import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';

import { EmptyList } from '@/components/EmptyList';
import { TaskForm } from '@/components/TaskForm';
import { useTasks } from '@/contexts/TasksProvider';
import type { NewTask } from '@/types/task';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, categories, updateTask, createCategory } = useTasks();
  const [submitting, setSubmitting] = useState(false);

  const task = tasks.find((item) => item.id === id);

  async function handleSubmit(values: NewTask) {
    if (!task) return;
    setSubmitting(true);
    try {
      await updateTask(task.id, values);
      Toast.show({ type: 'success', text1: 'Task updated' });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Couldn’t save changes', text2: 'Please try again.' });
      setSubmitting(false);
    }
  }

  if (!task) {
    return (
      <EmptyList
        tone="danger"
        icon="alert-circle-outline"
        title="Task not found"
        message="It may have been deleted."
        actionLabel="Go back"
        actionIcon="arrow-back"
        onAction={() => router.back()}
      />
    );
  }

  return (
    <TaskForm
      categories={categories}
      initialValues={{
        title: task.title,
        description: task.description,
        categoryId: task.categoryId,
        dueDate: task.dueDate,
      }}
      submitLabel="Save changes"
      submitIcon="checkmark"
      submitting={submitting}
      onSubmit={handleSubmit}
      onCreateCategory={createCategory}
    />
  );
}
