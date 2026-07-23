-- Task Manager — schema + seed data.
--
-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

drop table if exists tasks;
drop table if exists categories;

create table categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  -- A swatch name from CATEGORY_COLOR_IDS in types/task.ts, or null to let the
  -- app derive one. Free text rather than an enum so adding a colour to the app
  -- doesn't need a migration; the client narrows unknown values back to null.
  color      text,
  created_at timestamptz not null default now()
);

create table tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  -- Un-categorising a task must not delete it, hence `set null` over `cascade`.
  category_id uuid references categories(id) on delete set null,
  status      text not null default 'open' check (status in ('open', 'done')),
  due_date    timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- `starred` is deliberately NOT a column. It is a per-device flag and lives only
-- in MMKV on the phone (core/tasks/taskCache.ts), which is why a background
-- refresh has to merge it back in rather than read it from here.

-- The list screen filters by category and status and sorts by due date or
-- created time, so index the columns those queries actually touch.
create index tasks_category_id_idx on tasks (category_id);
create index tasks_status_idx      on tasks (status);
create index tasks_created_at_idx  on tasks (created_at desc);

-- Keep updated_at honest: the client never sends it, the database owns it.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on tasks
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
--
-- Authentication is out of scope for this task, so the app talks to Postgres as
-- the `anon` role. RLS is still enabled — leaving it off would make the tables
-- readable *and* writable by anyone with the URL, with no policy to point at.
-- These policies grant anon full access, which is the honest equivalent of an
-- open demo backend. With auth, they would become `auth.uid() = user_id`.

alter table categories enable row level security;
alter table tasks      enable row level security;

create policy "anon full access to categories"
  on categories for all
  to anon
  using (true)
  with check (true);

create policy "anon full access to tasks"
  on tasks for all
  to anon
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Seed data — 3 categories, 8 tasks
-- ---------------------------------------------------------------------------
--
-- Fixed UUIDs so the task inserts below can reference them without a lookup.

insert into categories (id, name, color) values
  ('11111111-1111-1111-1111-111111111111', 'Design',      'violet'),
  ('22222222-2222-2222-2222-222222222222', 'Development', 'indigo'),
  ('33333333-3333-3333-3333-333333333333', 'Research',    'teal');

insert into tasks (title, description, category_id, status, due_date, created_at) values
  ('UI Design',            'Design the home and task detail screens in Figma.',        '11111111-1111-1111-1111-111111111111', 'open', '2026-07-25T09:00:00Z', '2026-07-20T08:00:00Z'),
  ('Web Development',      'Build the marketing landing page and hook up the waitlist form.', '22222222-2222-2222-2222-222222222222', 'open', '2026-07-24T11:30:00Z', '2026-07-19T10:15:00Z'),
  ('Office Meeting Notes', 'Write up decisions from the weekly planning meeting.',     '33333333-3333-3333-3333-333333333333', 'done', null,                   '2026-07-18T14:00:00Z'),
  ('Dashboard Design',     'Lay out the analytics dashboard with progress summary cards.', '11111111-1111-1111-1111-111111111111', 'open', '2026-07-28T09:00:00Z', '2026-07-21T09:45:00Z'),
  ('Market Research',      'Compare three competitor task apps and summarise findings.', '33333333-3333-3333-3333-333333333333', 'done', '2026-07-15T09:00:00Z', '2026-07-10T11:00:00Z'),
  ('API Integration',      'Wire the task list screen to the backend endpoints.',      '22222222-2222-2222-2222-222222222222', 'open', '2026-07-30T17:00:00Z', '2026-07-22T13:20:00Z'),
  ('Design System Audit',  'Review spacing and colour tokens for consistency.',        '11111111-1111-1111-1111-111111111111', 'open', null,                   '2026-07-17T15:30:00Z'),
  ('User Interviews',      'Run five interviews to validate the onboarding flow.',     '33333333-3333-3333-3333-333333333333', 'open', '2026-07-26T10:00:00Z', '2026-07-16T09:00:00Z');
