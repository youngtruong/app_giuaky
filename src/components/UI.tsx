import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, ui } from '../theme';

export async function perform(action: () => Promise<void>, done?: () => void) {
  try {
    await action();
    done?.();
  } catch (error) {
    Alert.alert(
      'Không thể thực hiện',
      error instanceof Error
        ? error.message
        : 'Không thể lưu dữ liệu. Vui lòng thử lại.',
    );
  }
}
export function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        disabled && styles.disabled,
        pressed && ui.pressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secondary && styles.secondaryText,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.empty}>
      <Text style={ui.heading}>{title}</Text>
      <Text style={[ui.muted, styles.center]}>{detail}</Text>
    </View>
  );
}
export function Badge({
  title,
  green = false,
}: {
  title: string;
  green?: boolean;
}) {
  return (
    <View style={[styles.badge, green && styles.badgeGreen]}>
      <Text style={[styles.badgeText, green && styles.badgeTextGreen]}>
        {title}
      </Text>
    </View>
  );
}
export function Stepper({
  name,
  quantity,
  available,
  disabled,
  onChange,
}: {
  name: string;
  quantity: number;
  available: boolean;
  disabled: boolean;
  onChange: (delta: number) => void;
}) {
  function decrease() {
    if (quantity === 1) {
      Alert.alert(
        'Bỏ món khỏi hoá đơn?',
        `Bạn muốn bỏ “${name}” khỏi hoá đơn này?`,
        [
          { text: 'Giữ lại', style: 'cancel' },
          { text: 'Bỏ món', style: 'destructive', onPress: () => onChange(-1) },
        ],
      );
    } else {
      onChange(-1);
    }
  }
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Giảm ${name}`}
        disabled={disabled || !quantity}
        onPress={decrease}
        style={({ pressed }) => [
          styles.step,
          (!quantity || disabled) && ui.faded,
          pressed && ui.pressed,
        ]}
      >
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <Text style={styles.quantity}>{quantity}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Thêm ${name}`}
        disabled={disabled || !available}
        onPress={() => onChange(1)}
        style={({ pressed }) => [
          styles.step,
          styles.plus,
          (!available || disabled) && ui.faded,
          pressed && ui.pressed,
        ]}
      >
        <Text style={[styles.stepText, styles.plusText]}>+</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: colors.primary,
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  secondary: { backgroundColor: colors.primarySoft },
  secondaryText: { color: colors.primary },
  disabled: { backgroundColor: colors.disabled },
  disabledText: { color: '#74776F' },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  center: { textAlign: 'center' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeGreen: { backgroundColor: colors.greenSoft },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  badgeTextGreen: { color: colors.green },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  step: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 23, color: colors.ink, fontWeight: '500' },
  plus: { backgroundColor: colors.green },
  plusText: { color: colors.white },
  quantity: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    minWidth: 24,
    textAlign: 'center',
  },
});
