import { router } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';

import { TaskForm } from '@/components/TaskForm';
import { useTasks } from '@/contexts/TasksProvider';
import type { NewTask } from '@/types/task';

export default function NewTaskScreen() {
  const { categories, createTask } = useTasks();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: NewTask) {
    setSubmitting(true);
    try {
      await createTask(values);
      Toast.show({ type: 'success', text1: 'Task created' });
      // Pushed screen, so go back to wherever the form was opened from.
      // Deep links land here without history, so fall back to the list.
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch {
      // The write never reached the cache, so there is nothing to roll back.
      Toast.show({ type: 'error', text1: 'Couldn’t create task', text2: 'Please try again.' });
      setSubmitting(false);
    }
  }

  return (
    <TaskForm
      categories={categories}
      submitLabel="Create task"
      submitIcon="add"
      submitting={submitting}
      onSubmit={handleSubmit}
    />
  );
}
