import React, { useState } from 'react';
import { SectionList, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { categories, Category, RootStackParams } from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import { colors, ui } from '../theme';
import { FoodPhoto, TableDrawing } from '../components/Visuals';
import { Badge, Button, Empty, perform, Stepper } from '../components/UI';
import {
  changeQuantity,
  money,
  servingInvoice,
  totals,
} from '../utils/restaurant';

export function OrderScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Order'>) {
  const { data, saving, commit } = useRestaurant();
  const { tableNumber } = route.params;
  const [filter, setFilter] = useState<Category | 'Tất cả'>('Tất cả');
  const invoice = servingInvoice(data, tableNumber);
  const sections = categories
    .filter(c => filter === 'Tất cả' || filter === c)
    .map(c => ({ title: c, data: data.dishes.filter(d => d.category === c) }))
    .filter(s => s.data.length);
  const quantity =
    invoice?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  return (
    <SafeAreaView style={ui.screen} edges={['left', 'right', 'bottom']}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={ui.content}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.tableBanner}>
              <View style={ui.flex}>
                <Text style={styles.overline}>PHỤC VỤ TẠI BÀN</Text>
                <Text style={styles.tableTitle}>
                  Bàn {String(tableNumber).padStart(2, '0')}
                </Text>
                <Badge
                  title={invoice ? 'Đang phục vụ' : 'Gọi món mới'}
                  green={!invoice}
                />
                <Text style={styles.tableTime}>
                  {invoice
                    ? `Mở lúc ${invoice.createdAt}`
                    : 'Mời bạn chọn món bên dưới'}
                </Text>
              </View>
              <TableDrawing number={tableNumber} busy={!!invoice} />
            </View>
            <View style={ui.wrap}>
              {(['Tất cả', ...categories] as const).map(c => (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  onPress={() => setFilter(c)}
                  style={({ pressed }) => [
                    ui.chip,
                    filter === c && ui.chipActive,
                    pressed && ui.pressed,
                  ]}
                >
                  <Text
                    style={[ui.chipText, filter === c && ui.chipTextActive]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <Empty
            title="Chưa có món ăn"
            detail="Hãy thêm món từ màn hình Thực đơn."
          />
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.section}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const selected =
            invoice?.items.find(i => i.dishId === item.id)?.quantity ?? 0;
          return (
            <View
              style={[ui.card, styles.dish, selected > 0 && styles.selected]}
            >
              <View style={ui.row}>
                <View style={!item.available && ui.faded}>
                  <FoodPhoto dish={item} size={70} />
                </View>
                <View style={[ui.flex, !item.available && ui.faded]}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={ui.price}>{money(item.price)}</Text>
                  {!item.available && (
                    <Text style={styles.soldOut}>Hết món</Text>
                  )}
                </View>
                {selected > 0 && (
                  <View style={styles.check}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.quantityRow}>
                <Text style={styles.quantityLabel}>
                  {selected
                    ? `${selected} phần · ${money(item.price * selected)}`
                    : 'Số lượng'}
                </Text>
                <Stepper
                  name={item.name}
                  quantity={selected}
                  available={item.available}
                  disabled={saving}
                  onChange={delta => {
                    perform(() =>
                      commit(state =>
                        changeQuantity(state, tableNumber, item.id, delta),
                      ),
                    );
                  }}
                />
              </View>
            </View>
          );
        }}
      />
      <View style={ui.footer}>
        <View style={ui.between}>
          <View>
            <Text style={ui.muted}>{quantity} phần đã chọn</Text>
            <Text style={ui.body}>Tạm tính</Text>
          </View>
          <Text style={ui.heading}>
            {money(invoice ? totals(invoice, data.dishes).subtotal : 0)}
          </Text>
        </View>
        <Button
          title="Xem hoá đơn & thanh toán →"
          disabled={saving || !invoice?.items.length}
          onPress={() => {
            if (invoice) {
              navigation.navigate('Checkout', { invoiceId: invoice.id });
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  header: { gap: 16 },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    paddingTop: 10,
    paddingBottom: 2,
  },
  dish: { gap: 13, padding: 14 },
  tableBanner: {
    backgroundColor: colors.forest,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overline: {
    color: '#ADBE9B',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  tableTitle: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 33,
    marginVertical: 8,
    letterSpacing: -1,
  },
  tableTime: { color: '#B9C8B1', fontSize: 10, marginTop: 10 },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 10,
  },
  quantityLabel: { color: colors.muted, fontSize: 12 },
  check: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  selected: { borderColor: '#A2B79A', backgroundColor: '#FAFCF7' },
  name: { fontSize: 15, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  soldOut: { fontSize: 12, color: colors.danger, marginTop: 4 },
});
