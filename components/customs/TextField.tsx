import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors } from '@/components/colors';
import { AppFonts } from '@/components/fonts';
import { Radius, Spacing } from '@/styles/layout';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
  /** Adds a taller box for descriptions. */
  multilineBox?: boolean;
};

/**
 * A labelled text input with focus and error states. Owns its label/error
 * chrome so forms stay consistent and screens don't re-implement the same
 * bordered box each time.
 */
export function TextField({ label, error, hint, multilineBox, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...rest}
        placeholderTextColor={Colors.textSubtle}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          multilineBox && styles.multiline,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
          style,
        ]}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontFamily: AppFonts.body,
    fontSize: 15,
    color: Colors.text,
  },
  multiline: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  error: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 12.5,
    color: Colors.danger,
  },
  hint: {
    fontFamily: AppFonts.body,
    fontSize: 12.5,
    color: Colors.textMuted,
  },
});
