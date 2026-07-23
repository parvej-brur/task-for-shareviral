import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

import { Colors } from '@/components/colors';
import { EmptyList } from '@/components/EmptyList';
import { TaskForm } from '@/components/TaskForm';
import { useTasks } from '@/contexts/TasksProvider';
import type { NewTask } from '@/types/task';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, categories, updateTask, createCategory } = useTasks();
  const [submitting, setSubmitting] = useState(false);

  const task = tasks.find((item) => item.id === id);

  function handleClose() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  async function handleSubmit(values: NewTask) {
    if (!task) return;
    setSubmitting(true);
    try {
      await updateTask(task.id, values);
      Toast.show({ type: 'success', text1: 'Task updated' });
      handleClose();
    } catch {
      Toast.show({ type: 'error', text1: 'Couldn’t save changes', text2: 'Please try again.' });
      setSubmitting(false);
    }
  }

  if (!task) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Edit task',
            headerRight: () => (
              <Pressable
                onPress={handleClose}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close edit modal"
                style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </Pressable>
            ),
          }}
        />
        <EmptyList
          tone="danger"
          icon="alert-circle-outline"
          title="Task not found"
          message="It may have been deleted."
          actionLabel="Go back"
          actionIcon="arrow-back"
          onAction={handleClose}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit task',
          headerRight: () => (
            <Pressable
              onPress={handleClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close edit modal"
              style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
          ),
        }}
      />
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
        onCancel={handleClose}
        onCreateCategory={createCategory}
      />
    </>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    padding: 4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

