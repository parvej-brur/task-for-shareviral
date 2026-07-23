import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors } from '@/components/colors';
import { AppFonts } from '@/components/fonts';
import { EmptyList } from '@/components/EmptyList';
import { FeaturedTask } from '@/components/FeaturedTask';
import { FilterDropdown, type FilterOption } from '@/components/FilterDropdown';
import { SyncStatusBar } from '@/components/SyncStatusBar';
import { SegmentedFilter, type Segment } from '@/components/customs/SegmentedFilter';
import { TaskListItem } from '@/components/Lists/TaskListItem';
import { TaskListSkeleton } from '@/components/Skeletons/TaskRowSkeleton';
import { useTasks } from '@/contexts/TasksProvider';
import {
  countTasksByGroup,
  filtersForGroup,
  selectFeaturedTask,
  selectVisibleTasks,
} from '@/core/tasks/taskSelectors';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { common } from '@/styles/common';
import { Radius, Shadow, Spacing } from '@/styles/layout';
import type { Task, TaskGroup, TaskSortKey } from '@/types/task';

const GROUP_LABELS: Record<TaskGroup, string> = {
  all: 'All',
  todo: 'To Do',
  inProgress: 'In Progress',
  done: 'Done',
};

/**
 * The list heading names whichever segment is active, so "All Tasks" is one
 * state of the same heading rather than a second, competing screen title.
 */
const SECTION_TITLES: Record<TaskGroup, string> = {
  ...GROUP_LABELS,
  all: 'All Tasks',
};

const SORT_KEYS: { label: string; value: TaskSortKey }[] = [
  { label: 'Due date', value: 'dueDate' },
  { label: 'Created', value: 'createdAt' },
];

export default function TaskListScreen() {
  const {
    tasks,
    categories,
    status,
    isOffline,
    lastRefreshedAt,
    error,
    refresh,
    toggleComplete,
    toggleStarred,
  } = useTasks();

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [group, setGroup] = useState<TaskGroup>('all');
  const [sortKey, setSortKey] = useState<TaskSortKey>('dueDate');
  const [sortAscending, setSortAscending] = useState(true);

  const debouncedSearch = useDebouncedValue(search, 300);
  const sort = { key: sortKey, direction: sortAscending ? ('asc' as const) : ('desc' as const) };

  const filters = filtersForGroup(group, categoryId, debouncedSearch);
  const visibleTasks = selectVisibleTasks(tasks, filters, sort);
  const counts = countTasksByGroup(tasks);
  const featured = selectFeaturedTask(tasks);

  const segments: Segment<TaskGroup>[] = [
    { key: 'all', label: GROUP_LABELS.all, count: counts.all },
    { key: 'todo', label: GROUP_LABELS.todo, count: counts.todo },
    { key: 'inProgress', label: GROUP_LABELS.inProgress, count: counts.inProgress },
    { key: 'done', label: GROUP_LABELS.done, count: counts.done },
  ];

  const categoryNames: Record<string, string> = {};
  for (const category of categories) {
    categoryNames[category.id] = category.name;
  }

  const categoryOptions: FilterOption[] = [
    { label: 'All Categories', value: null },
    ...categories.map((category) => ({ label: category.name, value: category.id })),
  ];

  const activeCategoryName = categoryId ? categoryNames[categoryId] ?? 'Category' : null;

  // A stable two-part tally rather than a sentence, so the line keeps the same
  // shape whatever the numbers are (no "1 tasks", no singular/plural juggling).
  const summary =
    counts.all === 0
      ? 'Nothing here yet'
      : counts.open === 0
        ? 'All caught up'
        : `${counts.open} open · ${counts.done} done`;

  const isFirstLoad = status === 'refreshing' && tasks.length === 0;

  function handlePressTask(id: string) {
    router.push({ pathname: '/task/[id]', params: { id } });
  }

  async function handleToggleComplete(task: Task) {
    try {
      await toggleComplete(task);
    } catch {
      Toast.show({ type: 'error', text1: 'Couldn’t update task' });
    }
  }

  function clearFilters() {
    setSearch('');
    setCategoryId(null);
    setGroup('all');
  }

  function renderItem({ item }: { item: Task }) {
    return (
      <TaskListItem
        task={item}
        categoryName={item.categoryId ? categoryNames[item.categoryId] : undefined}
        onPress={handlePressTask}
        onToggleComplete={handleToggleComplete}
        onToggleStar={toggleStarred}
      />
    );
  }

  function renderEmpty() {
    if (isFirstLoad) {
      return <TaskListSkeleton />;
    }
    if (tasks.length > 0) {
      return (
        <EmptyList
          icon="search-outline"
          title="No matching tasks"
          message="Try adjusting your search or filters."
          actionLabel="Clear filters"
          actionIcon="refresh"
          onAction={clearFilters}
        />
      );
    }
    if (error) {
      return (
        <EmptyList
          tone="danger"
          icon="cloud-offline-outline"
          title="Couldn’t load tasks"
          message={error}
          actionLabel="Retry"
          actionIcon="refresh"
          onAction={refresh}
        />
      );
    }
    return (
      <EmptyList
        icon="checkbox-outline"
        title="No tasks yet"
        message="Create your first task to get started."
        actionLabel="New task"
        actionIcon="add"
        onAction={() => router.push('/task/new')}
      />
    );
  }

  const listHeader = (
    <View style={styles.header}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.eyebrow}>{summary}</Text>
          <Text style={styles.sectionTitle}>My Tasks</Text>
        </View>
        <FilterDropdown
          options={categoryOptions}
          value={categoryId}
          onChange={setCategoryId}
          accessibilityLabel="Filter by category"
        />
      </View>

      {featured ? (
        <FeaturedTask
          task={featured}
          categoryName={featured.categoryId ? categoryNames[featured.categoryId] : undefined}
          onPress={handlePressTask}
        />
      ) : null}

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textSubtle} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks"
          placeholderTextColor={Colors.textSubtle}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search tasks by title"
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={Colors.textSubtle} />
          </Pressable>
        ) : null}
      </View>

      <SyncStatusBar
        isOffline={isOffline}
        status={status}
        lastRefreshedAt={lastRefreshedAt}
        error={error}
      />

      <View style={styles.fullBleed}>
        <SegmentedFilter segments={segments} value={group} onChange={setGroup} />
      </View>

      <View style={styles.listControls}>
        <View style={styles.listHeading}>
          <Text style={styles.listTitle} numberOfLines={1}>
            {SECTION_TITLES[group]}
          </Text>
          <View style={styles.listCount}>
            <Text style={styles.listCountText}>{visibleTasks.length}</Text>
          </View>
        </View>

        <View style={styles.sortControl}>
          {SORT_KEYS.map((option) => {
            const active = sortKey === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Sort by ${option.label.toLowerCase()}`}
                onPress={() => setSortKey(option.value)}
                style={[styles.sortKey, active && styles.sortKeyActive]}>
                <Text style={[styles.sortKeyText, active && styles.sortKeyTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setSortAscending((value) => !value)}
            hitSlop={8}
            accessibilityLabel={sortAscending ? 'Sort descending' : 'Sort ascending'}
            style={styles.sortDirection}>
            <Ionicons
              name={sortAscending ? 'arrow-up' : 'arrow-down'}
              size={15}
              color={Colors.primaryDark}
            />
          </Pressable>
        </View>
      </View>

      {/*
       * Only surfaced while a category filter is on — an always-present
       * "All Categories" line just restated the dropdown's default.
       */}
      {activeCategoryName ? (
        <View style={styles.activeFilter}>
          <Ionicons name="pricetag" size={12} color={Colors.primaryDark} />
          <Text style={styles.activeFilterText} numberOfLines={1}>
            {activeCategoryName}
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={common.screen} edges={['top']}>
      <FlatList
        data={isFirstLoad ? [] : visibleTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={renderEmpty()}
        refreshControl={
          <RefreshControl
            refreshing={status === 'refreshing' && !isFirstLoad}
            onRefresh={refresh}
            tintColor={Colors.primary}
          />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/task/new')}
        accessibilityRole="button"
        accessibilityLabel="New task">
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabLabel}>New task</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontFamily: AppFonts.headingBold,
    fontSize: 26,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 46,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  fullBleed: {
    marginHorizontal: -Spacing.lg,
  },
  listControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  listHeading: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  listTitle: {
    flexShrink: 1,
    fontFamily: AppFonts.headingBold,
    fontSize: 19,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  listCount: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  listCountText: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 12,
    color: Colors.primaryDark,
  },
  sortControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortKey: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  sortKeyActive: {
    backgroundColor: Colors.primaryMuted,
  },
  sortKeyText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  sortKeyTextActive: {
    fontFamily: AppFonts.bodyBold,
    color: Colors.primaryDark,
  },
  sortDirection: {
    width: 26,
    height: 26,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceMuted,
  },
  activeFilter: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '70%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryMuted,
    marginTop: -Spacing.xs,
  },
  activeFilterText: {
    flexShrink: 1,
    fontFamily: AppFonts.bodyBold,
    fontSize: 12,
    color: Colors.primaryDark,
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
