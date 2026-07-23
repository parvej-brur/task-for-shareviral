import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { resolveCategoryColor, Colors } from '@/components/colors';
import { SegmentedFilter, type Segment } from '@/components/customs/SegmentedFilter';
import { IconTile } from '@/components/customs/IconTile';
import { EmptyList } from '@/components/EmptyList';
import { AppFonts } from '@/components/fonts';
import { TaskListItem } from '@/components/Lists/TaskListItem';
import { useTasks } from '@/contexts/TasksProvider';
import {
  countTasksByGroup,
  filtersForGroup,
  selectVisibleTasks,
} from '@/core/tasks/taskSelectors';
import { common } from '@/styles/common';
import { Radius, Shadow, Spacing } from '@/styles/layout';
import type { Task, TaskGroup } from '@/types/task';

const GROUP_LABELS: Record<TaskGroup, string> = {
  all: 'All',
  todo: 'To Do',
  inProgress: 'In Progress',
  done: 'Done',
};

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, categories, toggleComplete, toggleStarred } = useTasks();
  const [group, setGroup] = useState<TaskGroup>('all');

  const category = categories.find((item) => item.id === id);

  if (!category) {
    return (
      <>
        <Stack.Screen options={{ title: 'Category' }} />
        <EmptyList
          tone="danger"
          icon="alert-circle-outline"
          title="Category not found"
          message="It may have been deleted."
          actionLabel="Go back"
          actionIcon="arrow-back"
          onAction={() => router.back()}
        />
      </>
    );
  }

  const categoryId = category.id;
  const categoryTasks = tasks.filter((task) => task.categoryId === categoryId);
  const counts = countTasksByGroup(categoryTasks);
  const filters = filtersForGroup(group, categoryId, '');
  const visibleTasks = selectVisibleTasks(categoryTasks, filters, {
    key: 'dueDate',
    direction: 'asc',
  });
  const { bg, fg } = resolveCategoryColor(category);

  const summary =
    counts.all === 0
      ? 'No tasks yet'
      : counts.open === 0
        ? 'All caught up'
        : `${counts.open} open · ${counts.done} done`;

  const segments: Segment<TaskGroup>[] = [
    { key: 'all', label: GROUP_LABELS.all, count: counts.all },
    { key: 'todo', label: GROUP_LABELS.todo, count: counts.todo },
    { key: 'inProgress', label: GROUP_LABELS.inProgress, count: counts.inProgress },
    { key: 'done', label: GROUP_LABELS.done, count: counts.done },
  ];

  function handlePressTask(taskId: string) {
    router.push({ pathname: '/task/[id]', params: { id: taskId } });
  }

  async function handleToggleComplete(task: Task) {
    try {
      await toggleComplete(task);
    } catch {
      Toast.show({ type: 'error', text1: 'Couldn’t update task' });
    }
  }

  function handleNewTask() {
    router.push({ pathname: '/task/new', params: { categoryId } });
  }

  const listHeader = (
    <View style={styles.header}>
      <View style={styles.identity}>
        <IconTile icon="pricetag" color={fg} background={bg} size={52} />
        <View style={styles.identityText}>
          <Text style={styles.title}>{category.name}</Text>
          <Text style={styles.eyebrow}>{summary}</Text>
        </View>
      </View>
      <View style={styles.fullBleed}>
        <SegmentedFilter segments={segments} value={group} onChange={setGroup} />
      </View>
    </View>
  );

  return (
    <View style={common.screen}>
      <Stack.Screen options={{ title: category.name }} />
      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskListItem
            task={item}
            category={category}
            onPress={handlePressTask}
            onToggleComplete={handleToggleComplete}
            onToggleStar={toggleStarred}
          />
        )}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListSeparator}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyList
            icon="checkbox-outline"
            title="No tasks in this category"
            message="Tasks you add to this category will show up here."
            actionLabel="New task"
            actionIcon="add"
            onAction={handleNewTask}
          />
        }
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleNewTask}
        accessibilityRole="button"
        accessibilityLabel="New task in this category">
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabLabel}>New task</Text>
      </Pressable>
    </View>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
    gap: Spacing.lg,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: AppFonts.headingBold,
    fontSize: 24,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  eyebrow: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  fullBleed: {
    marginHorizontal: -Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 4,
    flexGrow: 1,
  },
  separator: {
    height: Spacing.md,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 52,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    ...Shadow.raised,
  },
  fabPressed: {
    opacity: 0.92,
  },
  fabLabel: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.2,
  },
});
