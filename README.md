# Task Manager (React Native / Expo)

A small offline-first task manager: create tasks, assign them to categories, mark
them complete, star them locally, and browse by category and status. Tasks read
instantly from a local cache and refresh from the backend in the background.

Built with **Expo SDK 54**, **React Native 0.81**, **React 19**, **expo-router**,
and **TypeScript**.

---

## Where to find each requirement

| Requirement                              | Where                                                                                                  |
| :--------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| 4.1 Cache-first reads, offline-safe       | [`TasksProvider`](contexts/TasksProvider.tsx) initializer → [`taskCache`](core/tasks/taskCache.ts)      |
| 4.2 Write → backend → cache               | `createTask` / `updateTask` / `deleteTask` in [`TasksProvider`](contexts/TasksProvider.tsx)             |
| 4.3 `starred` survives a refresh          | [`mergeTasks.ts`](core/tasks/mergeTasks.ts) + `refresh/success` in [`tasksReducer`](contexts/tasksReducer.ts) |
| 4.4 Filter/sort outside the render tree   | [`taskSelectors.ts`](core/tasks/taskSelectors.ts)                                                       |
| 4.5 Sync status in UI                     | [`SyncStatusBar`](components/SyncStatusBar.tsx)                                                        |
| Debounced search (300ms)                  | [`useDebouncedValue`](hooks/useDebouncedValue.ts), used in [`(tabs)/index.tsx`](app/(tabs)/index.tsx)   |
| Env-based config, no hardcoded secrets    | [`config/env.ts`](config/env.ts) + [`.env.example`](.env.example)                                       |
| Backend boundary / integration point      | [`taskRepository.ts`](core/tasks/taskRepository.ts), selected in [`core/tasks/index.ts`](core/tasks/index.ts) |
| Supabase implementation                   | [`supabaseTaskRepository.ts`](core/tasks/supabaseTaskRepository.ts) + [`supabase/schema.sql`](supabase/schema.sql) |
| Tests (4 suites, 37 tests)                | [`__tests__/`](__tests__)                                                                              |

---

## Setup

MMKV is a native module, so the app runs in a **development build**, not Expo Go.

```bash
npm install
```

### 1. Provision the backend (optional)

Skip this and the app runs against a persistent **local mock backend** with the
same seed data — a fresh clone works end-to-end with nothing to provision.

To point at a real Supabase project:

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor → New query**, paste all of
   [`supabase/schema.sql`](supabase/schema.sql), and **Run**. That creates both
   tables, the indexes, the `updated_at` trigger, the RLS policies, and the seed
   data (3 categories, 8 tasks).
3. Copy the credentials from **Project Settings**: the **Project URL** (Data API)
   and the **anon / public** key (API Keys).

### 2. Configure the environment

```bash
cp .env.example .env
```

Fill in the two values. `.env` is git-ignored; nothing is hardcoded in source.

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run

```bash
# First run creates the native projects, then launches the dev build:
npx expo run:ios       # or: npx expo run:android
```

Once a dev build is installed you can use the normal dev server. Expo inlines
`EXPO_PUBLIC_*` at bundle time, so `--clear` is required after editing `.env`:

```bash
npx expo start --clear
```

Other scripts:

```bash
npm test          # Jest unit tests
npm run typecheck # tsc --noEmit
npm run lint      # ESLint (expo lint)
```

> **Which backend am I on?** Whichever one is chosen logs a line on startup, and
> the choice is driven purely by whether both env variables are set — see
> [The single integration point](#the-single-integration-point).

---

## Architecture

Feature code is grouped by responsibility, matching the import aliases in
`tsconfig.json` (`@/…` resolves from the project root).

```
app/                    expo-router screens
  (tabs)/index.tsx      Task List
  (tabs)/categories.tsx Categories
  task/[id].tsx         Task Detail
  task/new.tsx          Create Task
  task/edit/[id].tsx    Edit Task
components/             reusable UI (Button, Chip, TaskListItem, TaskForm, …)
config/env.ts          environment-based backend config (no hardcoded secrets)
contexts/              TasksProvider (state) + tasksReducer (pure)
core/
  storage/mmkv.ts       typed MMKV JSON wrapper
  tasks/
    index.ts            ← SINGLE backend integration point
    taskRepository.ts   TaskRepository interface (the boundary)
    supabaseClient.ts   client construction (URL polyfill, no auth session)
    supabaseTaskRepository.ts  the Supabase implementation
    mockTaskRepository.ts  local stand-in used when no credentials are set
    supabaseRowMappers.ts  pure row ↔ domain mapping (snake_case ↔ camelCase)
    taskCache.ts        MMKV-backed cache (tasks, categories, starred, sync time)
    taskSelectors.ts    pure filter + sort + segment decomposition
    mergeTasks.ts       pure starred merge
    seed.ts             seed categories + tasks (mirrors supabase/schema.sql)
hooks/                 useDebouncedValue, useOnlineStatus
styles/                shared tokens (spacing/radius/shadow) + common styles
constants/theme.ts     colour + font tokens
supabase/schema.sql    schema, indexes, RLS policies and seed data
types/task.ts          domain types
```

**Data flow.** Screens depend only on `useTasks()`. The provider owns the
cache-first orchestration; the reducer is a pure state machine; the repository is
the only thing that talks to the "backend". Nothing in the UI knows whether the
backend is a mock or Supabase.

### On memoization

There is deliberately no `useMemo` or `useCallback` anywhere in this codebase.
**React Compiler is enabled** (`experiments.reactCompiler` in
[`app.json`](app.json)), so components and hooks are auto-memoized at build time
at a finer granularity than hand-written dependency arrays achieve — and without
the stale-dependency bugs they invite. Hand-memoizing on top of it is dead weight
that has to be kept correct for no benefit.

This is worth verifying rather than assuming, since a compiler bail-out would
silently cost the memoization. Compiling the screens and the provider through
`babel-preset-expo` shows a memo cache allocated in every one — 115 slots for the
Task List screen, 35 for `TasksProvider` — so nothing bails out.

What memoization is left is the kind the compiler doesn't do: `React.memo` on
[`TaskListItem`](components/Lists/TaskListItem.tsx), so a star toggle on one row
doesn't re-render the whole list.

### Cache-first behaviour

1. On the first render, `TasksProvider` hydrates state **synchronously** from MMKV
   in the `useReducer` initializer — the list paints immediately, no loading flash.
2. A background refresh then calls the repository.
3. On success, fresh data replaces the cache and updates the UI; the last-refreshed
   time is recorded.
4. On failure, the cached tasks stay on screen and a non-blocking message is shown
   (offline banner / error line). The screen is **never** blanked when there is
   cached content.
5. If there is nothing cached and the load fails, the list shows a useful empty
   state with a **Retry** action.

Writes (create / edit / complete / delete) go to the repository first; only on
success is the local state/cache updated. If a write fails, an error toast is
shown and the cache is left untouched.

---

## Local storage — MMKV

**Choice: [`react-native-mmkv`](https://github.com/mrousavy/react-native-mmkv) (v4).**
MMKV's reads and writes are **synchronous**, which is exactly what a cache-first
list wants: state can be hydrated inside the `useReducer` initializer and the
first frame already shows real data — no `useEffect`, no loading spinner, no
async gate before the first paint. It is also dramatically faster than
AsyncStorage for the small, frequent reads/writes this app does. The whole cache
lives behind a tiny typed wrapper (`core/storage/mmkv.ts` → `core/tasks/taskCache.ts`),
so the storage engine could be swapped without touching the UI. The trade-off is
that MMKV is a native module and requires a development build (not Expo Go).

---

## State management — Context + `useReducer`

**Choice: React Context + `useReducer`.** The app has a single, cohesive slice of
state (tasks, categories, starred set, sync status) consumed by a handful of
screens. A `useReducer` keeps all transitions in one pure, testable function, and
Context distributes it without prop-drilling — no extra dependency, and it slots
straight into the project's existing `contexts/` folder. Zustand or Redux Toolkit
would be reasonable at larger scale, and TanStack Query would be a strong fit if
the server were the source of truth; here the source of truth is the **local
cache**, and cache-first hydration + a local-only field are simpler to express by
hand than to bend a query cache around. The reducer stays pure (no I/O); the
provider handles side effects (repository calls, MMKV persistence).

---

## How `starred` is preserved across a refresh

`starred` is per-device and never sent to the backend, so the two are stored
separately:

- The backend/cache holds plain task data (`RemoteTask`, no `starred`).
- The starred task ids live in their own cache key (`starred-ids`).

The app-facing `Task[]` is derived by overlaying the starred set onto the task
data in one pure function, `applyStarred(remoteTasks, starredIds)`
([`core/tasks/mergeTasks.ts`](core/tasks/mergeTasks.ts)). A background refresh only
replaces `remoteTasks`; the starred set is untouched, so re-deriving preserves
every star — even if the backend edited the task's title in the same refresh.

**How you'd know if it broke:** it's covered directly by
[`__tests__/mergeTasks.test.ts`](__tests__/mergeTasks.test.ts) ("preserves stars
when the backend returns refreshed task data") and by the reducer test asserting
`refresh/success` replaces tasks but leaves `starredIds` intact.

---

## Filter / sort

Filtering (category, status, starred, debounced title search) and sorting (due
date or created time, asc/desc) are pure functions in
[`core/tasks/taskSelectors.ts`](core/tasks/taskSelectors.ts). The Task List
screen contains **no `.filter()` / `.sort()` of its own** — every derived value
is a selector call:

| Screen value   | Selector             |
| :------------- | :------------------- |
| active filters | `filtersForGroup`    |
| visible rows   | `selectVisibleTasks` |
| segment badges | `countTasksByGroup`  |
| featured card  | `selectFeaturedTask` |

**Why `filtersForGroup` exists.** The segmented control is a product decision —
All / To do / In progress / Done — but the two dimensions underneath it are
independent: the backend's `status` (`open` / `done`) and the device-local
`starred` flag. Collapsing them into one enum would have meant the screen
re-deriving "is this task in this segment?" per row, which is exactly the inline
filtering the brief rules out. Instead each segment decomposes into a plain
`TaskFilters` value (`{ status, starred, categoryId, search }`), so `filterTasks`
stays a genuine open/done status filter and the segments are just presets over it.

Sorting by due date always sinks undated tasks to the bottom in **both**
directions — reversing the sort shouldn't promote tasks that have no date at all.

Search is debounced 300ms via [`useDebouncedValue`](hooks/useDebouncedValue.ts).
300ms sits just past typical inter-keystroke time (~150–200ms), so a burst of
typing collapses into one pass instead of one per character, while still landing
inside the ~400ms window where a result still feels like a direct response.

---

## Sync status in the UI

[`SyncStatusBar`](components/SyncStatusBar.tsx) surfaces, in priority order: an
offline banner (from `@react-native-community/netinfo`), a "Refreshing…" spinner
during a background refresh, a non-blocking error line, or the last-refreshed
relative time. Pull-to-refresh is also wired to the same `refresh()` action.

---

## Backend

**Choice: Supabase** (Postgres + PostgREST), with a local mock as an automatic
fallback when no credentials are configured.

Supabase gives a real relational schema with foreign keys, `check` constraints
and a database-owned `updated_at` — the correctness properties this app leans on
(a task can't hold a dangling `category_id`, `status` can't drift outside
`open`/`done`) belong in the database, not in client validation. PostgREST also
means no server code to write or host for six CRUD operations.

### Environment config

No secrets are committed, and no URL or key appears in source. Config is read
from the environment in one place,
[`config/env.ts`](config/env.ts), and `.env` is git-ignored;
[`.env.example`](.env.example) documents the variable names:

```
# .env  (git-ignored)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Two notes on the mechanics. Expo's Babel plugin inlines `process.env.EXPO_PUBLIC_*`
at **bundle time**, so the full member expression has to be written out literally
(it can't be destructured or built dynamically) and the bundler needs a
`--clear` restart after any change. And `EXPO_PUBLIC_` means "shipped inside the
app binary" — the anon key is fine there because it is public by design and gated
by row-level security, but a service-role key never is.

`getSupabaseConfig()` throws on a half-populated config rather than returning
blanks, so a typo in `.env` fails at startup with an actionable message instead of
an opaque 401 on the first request.

### The single integration point

The app depends only on the `TaskRepository` interface — six methods
(`listTasks`, `createTask`, `updateTask`, `deleteTask`, `listCategories`,
`createCategory`). Which implementation is used is decided in
[`core/tasks/index.ts`](core/tasks/index.ts) and nowhere else, driven by whether
credentials are present:

```ts
// core/tasks/index.ts — env-driven selection
if (!isSupabaseConfigured) return new MockTaskRepository();
return new SupabaseTaskRepository(createSupabaseClient());
```

Falling back rather than failing is deliberate: a fresh clone runs end-to-end with
no project to provision, which matters more for review than for production. The
same reasoning covers a malformed URL — client construction is wrapped, so a typo
in `.env` degrades to the mock with a warning instead of a blank screen at
startup.

Nothing above this line knows which one it got. Screens, cache, reducer and hooks
were written against the mock and needed **zero changes** when the real backend
was plugged in — which was the point of the boundary.

[`SupabaseTaskRepository`](core/tasks/supabaseTaskRepository.ts) does three
things and nothing else: issue the query, throw on failure, hand rows to the
mappers. No caching or merging happens there — that stays in `TasksProvider`. Two
details worth noting: columns are listed explicitly rather than `select('*')`, so
a schema drift surfaces as a type error instead of a missing field at runtime;
and writes use `.select().single()` to return the **database's** version of the
row, so the cache stores server-generated `id` / `created_at` / `updated_at`
rather than a client-side guess.

[`supabaseClient.ts`](core/tasks/supabaseClient.ts) imports
`react-native-url-polyfill/auto` before creating the client. Hermes ships an
incomplete `URL`, and supabase-js builds every PostgREST request by parsing and
mutating one — without the polyfill the query string comes out empty, so filters
are silently dropped and requests "succeed" with the wrong rows. Sessions are
disabled (`persistSession: false`) since auth is out of scope.

[`MockTaskRepository`](core/tasks/mockTaskRepository.ts) persists to its own MMKV
store (separate from the app cache, so it behaves like a real remote) and
simulates ~600ms latency plus offline failures via NetInfo — which keeps the
cache-first, offline and write-failure paths exercisable without airplane-moding
a device.

### Row mapping

Postgres is snake_case with nullable columns; the domain types are camelCase and
non-optional. [`supabaseRowMappers.ts`](core/tasks/supabaseRowMappers.ts) is the
single place that bridges them, deliberately free of any Supabase import so it
stays a pure unit-testable module.

The load-bearing one is `toTaskUpdate`: `null` is a *meaningful* value here
(clearing a due date, un-categorising a task), so "key absent" and "key present
but null" must not collapse together. Mapping every field unconditionally would
send `due_date: null` on a title-only edit and silently wipe the column — that
regression is pinned by a test.

### Table schema

The full runnable script — schema, indexes, trigger, RLS policies and seed data —
is [`supabase/schema.sql`](supabase/schema.sql). Paste it into the Supabase SQL
Editor and run it once. It is idempotent (it drops and recreates both tables), so
it doubles as a reset-to-known-state script.

```sql
create table categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text,                       -- swatch name, or null to derive one
  created_at timestamptz not null default now()
);

create table tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  category_id uuid references categories(id) on delete set null,
  status      text not null default 'open' check (status in ('open', 'done')),
  due_date    timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

A few choices worth calling out:

- **`starred` is intentionally not a column.** It is per-device, so it lives only
  in MMKV — which is exactly why a refresh has to merge it back in.
- **`on delete set null`, not `cascade`.** Deleting a category must un-categorise
  its tasks, never delete them.
- **`check (status in ('open','done'))`** keeps the status enum enforced in the
  database rather than trusted from the client. The mapper still narrows unknown
  values to `open` — belt and braces, since a hand-written row can predate a
  constraint.
- **`color` is free text, not an enum**, so adding a swatch to the app doesn't
  need a migration; the client narrows values it doesn't recognise back to null.
- **`updated_at` is owned by a trigger.** The client never sends it, so it can't
  lie about it.
- **Indexes on `category_id`, `status`, `created_at`** — the columns the list
  screen actually filters and orders by.

### Row-level security

Authentication is out of scope, so the app talks to Postgres as the `anon` role.
RLS is still **enabled**, with policies granting `anon` full access — leaving RLS
off would make the tables world-writable with no policy to point at, and having
the policy written down means swapping it for `auth.uid() = user_id` is a one-line
change if auth is ever added. This is the honest configuration for an open demo
backend, and it is a deliberate choice rather than a default.

### Seed data (3 categories, 8 tasks)

Included at the bottom of [`supabase/schema.sql`](supabase/schema.sql), and
mirrored in [`core/tasks/seed.ts`](core/tasks/seed.ts) so the mock backend shows
the same data.

```sql
insert into categories (id, name, color) values
  ('11111111-1111-1111-1111-111111111111', 'Design',      'violet'),
  ('22222222-2222-2222-2222-222222222222', 'Development', 'indigo'),
  ('33333333-3333-3333-3333-333333333333', 'Research',    'teal');

insert into tasks (title, description, category_id, status, due_date, created_at) values
  ('UI Design',            'Design the home and task detail screens in Figma.',       '1111…', 'open', '2026-07-25T09:00:00Z', '2026-07-20T08:00:00Z'),
  ('Web Development',      'Build the marketing landing page and waitlist form.',     '2222…', 'open', '2026-07-24T11:30:00Z', '2026-07-19T10:15:00Z'),
  ('Office Meeting Notes', 'Write up decisions from the weekly planning meeting.',    '3333…', 'done', null,                   '2026-07-18T14:00:00Z'),
  ('Dashboard Design',     'Lay out the analytics dashboard with progress cards.',    '1111…', 'open', '2026-07-28T09:00:00Z', '2026-07-21T09:45:00Z'),
  ('Market Research',      'Compare three competitor task apps and summarise.',       '3333…', 'done', '2026-07-15T09:00:00Z', '2026-07-10T11:00:00Z'),
  ('API Integration',      'Wire the task list screen to the backend endpoints.',     '2222…', 'open', '2026-07-30T17:00:00Z', '2026-07-22T13:20:00Z'),
  ('Design System Audit',  'Review spacing and colour tokens for consistency.',       '1111…', 'open', null,                   '2026-07-17T15:30:00Z'),
  ('User Interviews',      'Run five interviews to validate the onboarding flow.',    '3333…', 'open', '2026-07-26T10:00:00Z', '2026-07-16T09:00:00Z');
```

Category UUIDs are fixed rather than generated so the task inserts can reference
them directly, and `created_at` is seeded explicitly so "sort by created time" has
something meaningful to sort — inserting all eight in one statement would
otherwise give them the same `now()`.

---

## Testing approach

Run with `npm test` — **4 suites, 37 tests**. They target the correctness-critical
**pure logic**, which is where bugs would actually hurt and where tests give the
most signal per line:

- **Filter / sort** ([`taskSelectors.test.ts`](__tests__/taskSelectors.test.ts)) —
  the required case. Category/status/starred/search filtering; sorting by due date
  (undated tasks last in *both* directions) and created time; that sorting doesn't
  mutate its input; that each segment decomposes to the right filter pair and that
  the segments **partition** the list — every task lands in exactly one, so no row
  is double-counted or invisible.
- **Cache merge** ([`mergeTasks.test.ts`](__tests__/mergeTasks.test.ts)) — the
  load-bearing invariant: `starred` survives a refresh that returns edited task
  data, and new backend tasks default to unstarred.
- **Reducer** ([`tasksReducer.test.ts`](__tests__/tasksReducer.test.ts)) — a failed
  refresh keeps cached tasks on screen (never blank), a successful refresh replaces
  tasks without disturbing the starred set, and upsert/remove/toggle behave.
- **Row mapper** ([`supabaseRowMappers.test.ts`](__tests__/supabaseRowMappers.test.ts)) —
  snake_case ↔ camelCase, null handling, unknown `status` and unknown `color`
  narrowing to safe values, and the partial-update case that would otherwise wipe
  columns on an edit. This is the layer where a real Supabase bug would land, and
  it is testable without a network because it holds no Supabase import.

The bias is toward tests that pin an **invariant** rather than restate an
implementation: "stars survive a refresh", "segments partition the list", "an
untouched column is absent from the patch". Each one fails loudly if the
behaviour regresses, and none of them break when the UI is restyled.

These modules import only types, so they run fast in plain Jest with no native
mocks. UI/screen tests were deliberately skipped in the interest of focus.

---

## Known limitations

- **RLS grants the `anon` role full access.** Correct for a demo with auth out of
  scope, and not something to ship — anyone with the URL and anon key can read and
  write. The policies are written out in `schema.sql` precisely so the change to
  `auth.uid() = user_id` is visible and small.
- **No integration test against a live Supabase project.** The row mappers are
  unit-tested and the repository is thin by design, but the wire format itself is
  verified by running the app, not by CI. Mocking the PostgREST client would test
  my mock more than the backend; a seeded test project is the real answer, and
  that's the next thing I'd add.
- **No offline write queue** — writes require connectivity and fail cleanly
  otherwise; explicitly out of scope for this task.
- **Due dates use quick presets** (Today / Tomorrow / +3 days / Next week / none)
  rather than a full calendar picker, to avoid an extra native dependency.
- **Categories are add-only** (rename/delete were optional and omitted).
- **The whole task list lives in memory** and re-derives on every change. Fine at
  seed scale; see the note below for what I'd change at 2,000 items.
- Requires a development build (MMKV is native) — the app does not run in Expo Go.

## What I'd do differently with another day

- Generate the row types from the live schema (`supabase gen types typescript`)
  instead of hand-writing `TaskRow` / `CategoryRow`, so a migration breaks the
  build rather than a request.
- Add integration tests around `TasksProvider` (cache hydrate → refresh → write)
  with the repository and MMKV mocked. That's the seam the current unit tests
  don't cover, and it's where a real bug would most plausibly hide.
- Add a proper date picker, and category rename/delete with a confirm step.
- **At 2,000 items** I'd look at the derivation chain before the list: today every
  keystroke or star toggle re-runs `applyStarred` over all tasks and then a full
  filter + sort. First moves would be keying the cache by id and filtering off an
  index rather than a linear scan, memoising the sort separately from the filter,
  then `getItemLayout` / `windowSize` tuning on the `FlatList`. I'd profile before
  any of it, though — at seed scale this is measurably not the bottleneck.

## AI usage

AI assistance was used to scaffold repetitive UI (screens, components, styles),
draft the unit tests, write the Supabase SQL and the boilerplate half of
`SupabaseTaskRepository` (six near-identical query/error/map blocks), and write
this README. The engineering decisions — the `TaskRepository` boundary and single
integration point, storing `starred` separately and merging it on refresh,
cache-first hydration via MMKV's synchronous reads, and the Context + reducer
split — were designed deliberately, and every file was reviewed and verified
(`npm test`, `npm run typecheck`, `npm run lint`, and a headless bundle) before
committing.

Two things in the Supabase layer were specifically *not* left to a first draft,
because the failure modes are quiet ones: the `URL` polyfill import (without it
requests succeed while dropping their query string) and `toTaskUpdate`'s
absent-vs-null distinction (which silently wipes columns on an edit). Both are
now commented at the call site and, in the second case, pinned by a test.
