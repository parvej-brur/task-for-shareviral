import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { resolveCategoryColor, Colors } from '@/components/colors';
import { AppFonts } from '@/components/fonts';
import { EmptyList } from '@/components/EmptyList';
import { Card } from '@/components/Containers/Card';
import { Button } from '@/components/customs/Button';
import { IconTile } from '@/components/customs/IconTile';
import { StatusChip } from '@/components/customs/StatusChip';
import { Tag } from '@/components/customs/Tag';
import { taskStatusMeta } from '@/components/customs/taskStatus';
import { useTasks } from '@/contexts/TasksProvider';
import { formatDate } from '@/core/date';
import { common } from '@/styles/common';
import { Spacing } from '@/styles/layout';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, categories, toggleComplete, deleteTask, toggleStarred } = useTasks();
  const [busy, setBusy] = useState(false);

  const task = tasks.find((item) => item.id === id);
  const category = categories.find((item) => item.id === task?.categoryId);

  async function handleToggleComplete() {
    if (!task) return;
    setBusy(true);
    try {
      await toggleComplete(task);
    } catch {
      Toast.show({ type: 'error', text1: 'Couldn’t update task' });
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    if (!task) return;
    Alert.alert('Delete task', `Delete “${task.title}”? This can’t be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await deleteTask(task.id);
            router.back();
          } catch {
            Toast.show({ type: 'error', text1: 'Couldn’t delete task' });
            setBusy(false);
          }
        },
      },
    ]);
  }

  if (!task) {
    return (
      <>
        <Stack.Screen options={{ title: 'Task' }} />
        <EmptyList
          tone="danger"
          icon="alert-circle-outline"
          title="Task not found"
          message="It may have been deleted."
          actionLabel="Go back"
          actionIcon="arrow-back"
          onAction={() => router.back()}
        />
      </>
    );
  }

  const isDone = task.status === 'done';
  const statusMeta = taskStatusMeta(task);
  const { bg, fg } = resolveCategoryColor(category);

  return (
    <ScrollView
      style={common.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: 'Task' }} />

      <Card>
        <View style={styles.heroRow}>
          <IconTile
            icon={category ? 'pricetag' : 'ellipse-outline'}
            color={fg}
            background={bg}
            size={56}
            done={isDone}
          />
          <View style={styles.heroText}>
            <StatusChip label={statusMeta.label} color={statusMeta.color} muted={statusMeta.muted} />
            <Text style={[styles.title, isDone && styles.titleDone]}>{task.title}</Text>
          </View>
          <Pressable
            onPress={() => toggleStarred(task.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={task.starred ? 'Unstar task' : 'Star task'}
            style={styles.starButton}>
            <Ionicons
              name={task.starred ? 'star' : 'star-outline'}
              size={22}
              color={task.starred ? Colors.star : Colors.textSubtle}
            />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaList}>
          <MetaRow icon="pricetag-outline" label="Category">
            {category ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${category.name} category`}
                onPress={() =>
                  router.push({ pathname: '/category/[id]', params: { id: category.id } })
                }>
                <Tag category={category} />
              </Pressable>
            ) : (
              <Text style={styles.metaValueMuted}>None</Text>
            )}
          </MetaRow>
          <MetaRow icon="calendar-outline" label="Due date">
            <Text style={task.dueDate ? styles.metaValue : styles.metaValueMuted}>
              {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
            </Text>
          </MetaRow>
          <MetaRow icon="time-outline" label="Created">
            <Text style={styles.metaValue}>{formatDate(task.createdAt)}</Text>
          </MetaRow>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardLabel}>Description</Text>
        <Text style={task.description ? styles.description : styles.descriptionEmpty}>
          {task.description.length > 0 ? task.description : 'No description added.'}
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button
          label={isDone ? 'Reopen task' : 'Mark as done'}
          icon={isDone ? 'refresh' : 'checkmark'}
          onPress={handleToggleComplete}
          loading={busy}
          variant={isDone ? 'ghost' : 'primary'}
        />
        <View style={styles.actionRow}>
          <Button
            label="Edit"
            icon="create-outline"
            onPress={() => router.push({ pathname: '/task/edit/[id]', params: { id: task.id } })}
            variant="ghost"
            style={styles.actionHalf}
          />
          <Button
            label="Delete"
            icon="trash-outline"
            onPress={handleDelete}
            variant="danger"
            disabled={busy}
            style={styles.actionHalf}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={17} color={Colors.textMuted} />
      <Text style={styles.metaLabel}>{label}</Text>
      <View style={styles.metaRight}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  heroText: {
    flex: 1,
    gap: Spacing.sm,
    paddingTop: 2,
  },
  title: {
    fontFamily: AppFonts.headingBold,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.text,
  },
  titleDone: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  starButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  metaList: {
    gap: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaLabel: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: Colors.textMuted,
    width: 82,
  },
  metaRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metaValue: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: Colors.text,
  },
  metaValueMuted: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: Colors.textSubtle,
  },
  cardLabel: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  description: {
    fontFamily: AppFonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.text,
  },
  descriptionEmpty: {
    fontFamily: AppFonts.body,
    fontSize: 15,
    color: Colors.textSubtle,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionHalf: {
    flex: 1,
  },
});
