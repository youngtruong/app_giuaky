import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Dish } from '../types';
import { colors } from '../theme';

// One bundled image atlas; each tile is clipped by its parent at render time.
const atlas = require('../assets/food-atlas.png');
const crabSoup = require('../assets/crab-soup.png');
const tiles: Record<string, number> = {
  d1: 0,
  d2: 1,
  d3: 2,
  d4: 3,
  d5: 4,
  d6: 5,
  d7: 6,
  d8: 7,
};
export function FoodPhoto({
  dish,
  size = 78,
  tile,
}: {
  dish?: Dish;
  size?: number;
  tile?: number;
}) {
  const borderRadius = size > 100 ? size / 2 : 18;
  const index = tile ?? (dish ? tiles[dish.id] : undefined);
  const dishName = dish?.name
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
  const isCrabSoup = tile === undefined && dishName === 'sup cua';
  return (
    <View
      accessible={false}
      style={[styles.photo, { width: size, height: size, borderRadius }]}
    >
      {isCrabSoup ? (
        <Image source={crabSoup} resizeMode="cover" style={styles.fullPhoto} />
      ) : index === undefined ? (
        <View style={styles.placeholder}>
          <Text style={styles.initials}>
            {dish?.name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map(s => s[0])
              .join('')
              .toUpperCase() ?? 'BN'}
          </Text>
          <Text style={styles.placeholderLabel}>BẾP NHÀ</Text>
        </View>
      ) : (
        <Image
          source={atlas}
          resizeMode="stretch"
          style={[
            styles.atlas,
            {
              width: size * 4,
              height: size * 2,
              left: -(index % 4) * size,
              top: -Math.floor(index / 4) * size,
            },
          ]}
        />
      )}
    </View>
  );
}
export function NavIcon({
  name,
  color = colors.muted,
}: {
  name: 'menu' | 'tables' | 'receipt' | 'search';
  color?: string;
}) {
  if (name === 'tables') {
    return (
      <View style={styles.icon}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              styles.square,
              {
                borderColor: color,
                left: (i % 2) * 12 + 2,
                top: Math.floor(i / 2) * 12 + 2,
              },
            ]}
          />
        ))}
      </View>
    );
  }
  if (name === 'search') {
    return (
      <View style={styles.icon}>
        <View style={[styles.lens, { borderColor: color }]} />
        <View style={[styles.handle, { backgroundColor: color }]} />
      </View>
    );
  }
  return (
    <View style={styles.icon}>
      <View style={[styles.paper, { borderColor: color }]} />
      {[7, 12, 17].map(top => (
        <View
          key={top}
          style={[styles.line, { top, backgroundColor: color }]}
        />
      ))}
      {name === 'menu' && (
        <View style={[styles.spine, { backgroundColor: color }]} />
      )}
    </View>
  );
}
export function TableDrawing({
  number,
  busy,
}: {
  number: number;
  busy: boolean;
}) {
  return (
    <View accessible={false} style={styles.tableDrawing}>
      {[
        styles.chairTop,
        styles.chairBottom,
        styles.chairLeft,
        styles.chairRight,
      ].map((position, i) => (
        <View
          key={i}
          style={[styles.chair, position, busy && styles.chairBusy]}
        />
      ))}
      <View style={[styles.tableTop, busy && styles.tableTopBusy]}>
        <Text style={[styles.number, busy && styles.numberBusy]}>
          {String(number).padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  fullPhoto: { width: '100%', height: '100%' },
  atlas: { position: 'absolute' },
  photo: { backgroundColor: '#EEE9DF', overflow: 'hidden' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6ECDC',
    gap: 6,
  },
  initials: { fontSize: 24, color: colors.green, fontWeight: '700' },
  placeholderLabel: { color: colors.green, fontSize: 7, letterSpacing: 1.5 },
  icon: { width: 26, height: 26 },
  square: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderWidth: 1.7,
    borderRadius: 3,
  },
  paper: {
    position: 'absolute',
    left: 4,
    top: 2,
    width: 18,
    height: 22,
    borderWidth: 1.7,
    borderRadius: 4,
  },
  line: {
    position: 'absolute',
    width: 9,
    height: 1.5,
    left: 9,
    borderRadius: 1,
  },
  spine: { position: 'absolute', width: 1.5, height: 22, left: 8, top: 2 },
  lens: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: 15,
    height: 15,
    borderWidth: 1.7,
    borderRadius: 10,
  },
  handle: {
    position: 'absolute',
    width: 9,
    height: 1.7,
    left: 16,
    top: 20,
    transform: [{ rotate: '45deg' }],
  },
  tableDrawing: {
    width: 106,
    height: 96,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableTop: {
    width: 68,
    height: 62,
    backgroundColor: '#F0F3ED',
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#D3DEC9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableTopBusy: { backgroundColor: '#E27B49', borderColor: '#E99165' },
  number: {
    color: '#5D785F',
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -1,
  },
  numberBusy: { color: colors.white },
  chair: { position: 'absolute', backgroundColor: '#DCE4D5', borderRadius: 4 },
  chairBusy: { backgroundColor: '#D2B598' },
  chairTop: { top: 6, left: 40, width: 26, height: 7 },
  chairBottom: { bottom: 6, left: 40, width: 26, height: 7 },
  chairLeft: { left: 9, top: 35, width: 7, height: 26 },
  chairRight: { right: 9, top: 35, width: 7, height: 26 },
});
