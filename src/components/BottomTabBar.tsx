import React from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { NavIcon } from './Visuals';

const items = [
  { label: 'Thực đơn', icon: 'menu' },
  { label: 'Sơ đồ bàn', icon: 'tables' },
  { label: 'Hoá đơn', icon: 'receipt' },
] as const;
export type HomeTab = (typeof items)[number]['label'];

export function BottomTabBar({
  value,
  onChange,
}: {
  value: HomeTab;
  onChange: (tab: HomeTab) => void;
}) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.surface}>
      <View style={styles.row}>
        {items.map(item => {
          const selected = value === item.label;
          return (
            <Pressable
              key={item.label}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              onPress={() => {
                Keyboard.dismiss();
                onChange(item.label);
              }}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <View
                accessible={false}
                style={[styles.icon, selected && styles.activeIcon]}
              >
                <NavIcon
                  name={item.icon}
                  color={selected ? colors.green : '#87958B'}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[styles.label, selected && styles.activeLabel]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // The bar owns its bottom inset so the home-indicator area has the same background.
  surface: {
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DCE4D8',
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },
  item: {
    flex: 1,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 14,
  },
  pressed: { opacity: 0.65 },
  icon: {
    width: 64,
    height: 34,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIcon: { backgroundColor: '#EAF1E3' },
  label: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#87958B',
    textAlign: 'center',
    includeFontPadding: false,
  },
  activeLabel: { color: colors.green, fontWeight: '700' },
});
