import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

import { taskRepository } from '@/core/tasks';
import { applyStarred } from '@/core/tasks/mergeTasks';
import { taskCache } from '@/core/tasks/taskCache';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type {
  Category,
  NewCategory,
  NewTask,
  Task,
  TaskUpdate,
} from '@/types/task';

import {
  initialTasksState,
  tasksReducer,
  type SyncStatus,
  type TasksState,
} from './tasksReducer';

type TasksContextValue = {
  tasks: Task[];
  categories: Category[];
  status: SyncStatus;
  isOffline: boolean;
  lastRefreshedAt: number | null;
  error: string | null;
  refresh: () => Promise<void>;
  createTask: (input: NewTask) => Promise<Task>;
  updateTask: (id: string, changes: TaskUpdate) => Promise<Task>;
  toggleComplete: (task: Task) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  createCategory: (input: NewCategory) => Promise<Category>;
  toggleStarred: (id: string) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

// MMKV is synchronous, so we can hydrate straight from the cache on the very
// first render — the list paints instantly, before any network call.
function createInitialState(): TasksState {
  return {
    ...initialTasksState,
    remoteTasks: taskCache.readTasks() ?? [],
    categories: taskCache.readCategories(),
    starredIds: taskCache.readStarredIds(),
    lastRefreshedAt: taskCache.readLastRefreshedAt(),
    // We always refresh on mount, so start in the refreshing state to avoid a
    // brief "no tasks" flash before the first refresh kicks in.
    status: 'refreshing',
  };
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tasksReducer, undefined, createInitialState);
  const isOnline = useOnlineStatus();

  // Kept in a ref so the write actions stay referentially stable while still
  // reading the latest starred set.
  const starredIdsRef = useRef(state.starredIds);
  starredIdsRef.current = state.starredIds;

  // Persist each cacheable slice back to MMKV as it changes.
  useEffect(() => {
    taskCache.writeTasks(state.remoteTasks);
  }, [state.remoteTasks]);
  useEffect(() => {
    taskCache.writeCategories(state.categories);
  }, [state.categories]);
  useEffect(() => {
    taskCache.writeStarredIds(state.starredIds);
  }, [state.starredIds]);
  useEffect(() => {
    if (state.lastRefreshedAt !== null) {
      taskCache.writeLastRefreshedAt(state.lastRefreshedAt);
    }
  }, [state.lastRefreshedAt]);

  const refresh = useCallback(async () => {
    dispatch({ type: 'refresh/start' });
    try {
      const [remoteTasks, categories] = await Promise.all([
        taskRepository.listTasks(),
        taskRepository.listCategories(),
      ]);
      dispatch({
        type: 'refresh/success',
        remoteTasks,
        categories,
        lastRefreshedAt: Date.now(),
      });
    } catch {
      dispatch({
        type: 'refresh/error',
        error: 'Couldn’t reach the server. Showing your saved tasks.',
      });
    }
  }, []);

  // Cache is already on screen from the initializer; refresh in the background.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTask = useCallback(async (input: NewTask): Promise<Task> => {
    const created = await taskRepository.createTask(input);
    dispatch({ type: 'task/upsert', task: created });
    return { ...created, starred: false };
  }, []);

  const updateTask = useCallback(async (id: string, changes: TaskUpdate): Promise<Task> => {
    const updated = await taskRepository.updateTask(id, changes);
    dispatch({ type: 'task/upsert', task: updated });
    return { ...updated, starred: starredIdsRef.current.includes(id) };
  }, []);

  const toggleComplete = useCallback(
    (task: Task): Promise<Task> =>
      updateTask(task.id, { status: task.status === 'open' ? 'done' : 'open' }),
    [updateTask],
  );

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    await taskRepository.deleteTask(id);
    dispatch({ type: 'task/remove', id });
  }, []);

  const createCategory = useCallback(async (input: NewCategory): Promise<Category> => {
    const created = await taskRepository.createCategory(input);
    dispatch({ type: 'category/upsert', category: created });
    return created;
  }, []);

  // Starred is device-local: no backend call, just update the local set.
  const toggleStarred = useCallback((id: string) => {
    dispatch({ type: 'starred/toggle', id });
  }, []);

  const tasks = useMemo(
    () => applyStarred(state.remoteTasks, new Set(state.starredIds)),
    [state.remoteTasks, state.starredIds],
  );

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      categories: state.categories,
      status: state.status,
      isOffline: !isOnline,
      lastRefreshedAt: state.lastRefreshedAt,
      error: state.error,
      refresh,
      createTask,
      updateTask,
      toggleComplete,
      deleteTask,
      createCategory,
      toggleStarred,
    }),
    [
      tasks,
      state.categories,
      state.status,
      state.lastRefreshedAt,
      state.error,
      isOnline,
      refresh,
      createTask,
      updateTask,
      toggleComplete,
      deleteTask,
      createCategory,
      toggleStarred,
    ],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const context = useContext(TasksContext);
  if (context === null) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
