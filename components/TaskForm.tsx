import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { Colors, suggestCategoryColor } from '@/components/colors';
import { Button } from '@/components/customs/Button';
import { ColorSwatchPicker } from '@/components/customs/ColorSwatchPicker';
import { FieldGroup } from '@/components/customs/FieldGroup';
import { FilterChip } from '@/components/customs/FilterChip';
import { TextField } from '@/components/customs/TextField';
import { validateTaskForm, type TaskFormValues } from '@/components/validators/taskForm';
import { common } from '@/styles/common';
import { Radius, Spacing } from '@/styles/layout';
import type { Category, CategoryColorId, NewCategory } from '@/types/task';

type TaskFormProps = {
  categories: Category[];
  initialValues?: Partial<TaskFormValues>;
  submitLabel: string;
  submitIcon?: 'add' | 'checkmark';
  submitting?: boolean;
  onSubmit: (values: TaskFormValues) => void;
  onCancel?: () => void;
  onCreateCategory?: (input: NewCategory) => Promise<Category>;
};

type DuePreset = {
  label: string;
  days: number | null;
};

const DUE_PRESETS: DuePreset[] = [
  { label: 'No date', days: null },
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'Next week', days: 7 },
];

function dueDateInDays(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function isSameCalendarDay(a: string | null, b: string | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return new Date(a).toDateString() === new Date(b).toDateString();
}

/** Shared create/edit form. Validation lives in `validators/taskForm`. */
export function TaskForm({
  categories,
  initialValues,
  submitLabel,
  submitIcon,
  submitting,
  onSubmit,
  onCancel,
  onCreateCategory,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(initialValues?.categoryId ?? null);
  const [dueDate, setDueDate] = useState<string | null>(initialValues?.dueDate ?? null);
  const [titleError, setTitleError] = useState<string | null>(null);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState<CategoryColorId>(() =>
    suggestCategoryColor(categories),
  );
  const [creatingCategory, setCreatingCategory] = useState(false);

  function openNewCategoryForm() {
    setNewCategoryColor(suggestCategoryColor(categories));
    setIsAddingCategory(true);
  }

  function closeNewCategoryForm() {
    setIsAddingCategory(false);
    setNewCategoryName('');
  }

  async function handleCreateCategory() {
    const trimmed = newCategoryName.trim();
    if (trimmed.length === 0 || !onCreateCategory) return;

    const exists = categories.some(
      (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      Toast.show({ type: 'error', text1: 'That category already exists' });
      return;
    }

    setCreatingCategory(true);
    try {
      const created = await onCreateCategory({ name: trimmed, color: newCategoryColor });
      setCategoryId(created.id);
      closeNewCategoryForm();
      Toast.show({ type: 'success', text1: 'Category added' });
    } catch {
      Toast.show({ type: 'error', text1: 'Couldn’t add category' });
    } finally {
      setCreatingCategory(false);
    }
  }

  const handleSubmit = () => {
    const errors = validateTaskForm({ title });
    if (errors.title) {
      setTitleError(errors.title);
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      dueDate,
    });
  };

  return (
    <KeyboardAvoidingView
      style={common.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <TextField
          label="Task name"
          placeholder="e.g. Design the settings screen"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (titleError) setTitleError(null);
          }}
          error={titleError}
          returnKeyType="next"
          autoFocus={!initialValues}
        />

        <FieldGroup label="Category">
          <View style={styles.chipRow}>
            <FilterChip label="None" selected={categoryId === null} onPress={() => setCategoryId(null)} />
            {categories.map((category) => (
              <FilterChip
                key={category.id}
                label={category.name}
                selected={categoryId === category.id}
                onPress={() => setCategoryId(category.id)}
              />
            ))}
            {onCreateCategory && !isAddingCategory ? (
              <FilterChip label="+ New" selected={false} onPress={openNewCategoryForm} />
            ) : null}
          </View>

          {isAddingCategory ? (
            <View style={styles.newCategoryCard}>
              <TextField
                label="New category name"
                placeholder="e.g. Marketing"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                returnKeyType="done"
                autoFocus
              />
              <ColorSwatchPicker value={newCategoryColor} onChange={setNewCategoryColor} />
              <View style={styles.newCategoryActions}>
                <Button
                  label="Cancel"
                  variant="ghost"
                  size="sm"
                  onPress={closeNewCategoryForm}
                  disabled={creatingCategory}
                  style={styles.newCategoryActionHalf}
                />
                <Button
                  label="Add category"
                  size="sm"
                  onPress={handleCreateCategory}
                  disabled={newCategoryName.trim().length === 0}
                  loading={creatingCategory}
                  style={styles.newCategoryActionHalf}
                />
              </View>
            </View>
          ) : null}
        </FieldGroup>

        <FieldGroup label="Due date">
          <View style={styles.chipRow}>
            {DUE_PRESETS.map((preset) => {
              const value = preset.days === null ? null : dueDateInDays(preset.days);
              return (
                <FilterChip
                  key={preset.label}
                  label={preset.label}
                  selected={isSameCalendarDay(dueDate, value)}
                  onPress={() => setDueDate(value)}
                />
              );
            })}
          </View>
        </FieldGroup>

        <TextField
          label="Description"
          placeholder="Add any details…"
          value={description}
          onChangeText={setDescription}
          multiline
          multilineBox
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.footer}>
        {onCancel ? (
          <View style={styles.footerActions}>
            <Button
              label="Cancel"
              variant="ghost"
              onPress={onCancel}
              disabled={submitting}
              style={styles.footerActionHalf}
            />
            <Button
              label={submitLabel}
              icon={submitIcon}
              onPress={handleSubmit}
              loading={submitting}
              style={styles.footerActionHalf}
            />
          </View>
        ) : (
          <Button
            label={submitLabel}
            icon={submitIcon}
            onPress={handleSubmit}
            loading={submitting}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  newCategoryCard: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  newCategoryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  newCategoryActionHalf: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  footerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footerActionHalf: {
    flex: 1,
  },
});
