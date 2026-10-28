import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import { colors, ui } from '../theme';
import { NavIcon } from '../components/Visuals';
import { Badge, Button, Empty, perform } from '../components/UI';
import { invoiceLines, money, payInvoice, totals } from '../utils/restaurant';

export function CheckoutScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Checkout'>) {
  const { data, saving, commit } = useRestaurant();
  const [cashText, setCashText] = useState('');
  const invoice = data.invoices.find(i => i.id === route.params.invoiceId);
  if (!invoice) {
    return (
      <View style={ui.screen}>
        <Empty
          title="Hoá đơn không tồn tại"
          detail="Quay lại sơ đồ bàn để kiểm tra."
        />
        <Button title="Về trang chính" onPress={() => navigation.popToTop()} />
      </View>
    );
  }
  const paid = invoice.status === 'Đã thanh toán';
  const lines = invoiceLines(invoice, data.dishes);
  const { subtotal, vat, total } = totals(invoice, data.dishes);
  const cash = paid ? invoice.cash ?? 0 : Number(cashText);
  const cashValid =
    Number.isSafeInteger(cash) && cash >= total && lines.length > 0;
  function checkout() {
    if (!invoice) {
      return;
    }
    perform(
      () => commit(state => payInvoice(state, invoice.id, cash)),
      () => {
        Alert.alert(
          'Thanh toán thành công',
          `Bàn ${invoice.tableNumber} đã được trả trống.\nTiền thừa: ${money(
            cash - total,
          )}`,
          [{ text: 'Hoàn tất', onPress: () => navigation.popToTop() }],
        );
      },
    );
  }
  return (
    <SafeAreaView style={ui.screen} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={ui.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={ui.content}
        >
          <View style={styles.receipt}>
            <View style={styles.receiptHeader}>
              <View style={styles.receiptIcon}>
                <NavIcon name="receipt" color={colors.gold} />
              </View>
              <Text style={styles.receiptBrand}>BẾP NHÀ</Text>
              <Text style={styles.receiptTitle}>
                Hoá đơn bàn {String(invoice.tableNumber).padStart(2, '0')}
              </Text>
              <View>
                <Badge title={invoice.status} green={paid} />
              </View>
              <Text style={styles.receiptTime}>Mở lúc {invoice.createdAt}</Text>
              {paid && (
                <Text style={styles.receiptTime}>
                  Thanh toán {invoice.paidAt}
                </Text>
              )}
            </View>
            <View style={styles.receiptBody}>
              <View style={ui.between}>
                <Text style={styles.columnLabel}>MÓN ĂN / SỐ LƯỢNG</Text>
                <Text style={styles.columnLabel}>THÀNH TIỀN</Text>
              </View>
              {lines.length ? (
                lines.map(line => (
                  <View key={line.dishId} style={styles.line}>
                    <Text style={styles.lineName}>{line.name}</Text>
                    <View style={ui.between}>
                      <Text style={ui.muted}>
                        {line.quantity} × {money(line.unitPrice)}
                      </Text>
                      <Text style={styles.amount}>{money(line.amount)}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Empty
                  title="Chưa có món"
                  detail="Quay lại để thêm món vào hoá đơn."
                />
              )}
              <View style={styles.dashed} />
              <View style={ui.between}>
                <Text style={ui.body}>Tạm tính</Text>
                <Text style={ui.body}>{money(subtotal)}</Text>
              </View>
              <View style={ui.between}>
                <Text style={ui.muted}>VAT (8%)</Text>
                <Text style={ui.body}>{money(vat)}</Text>
              </View>
              <View style={styles.dashed} />
              <View style={styles.totalBox}>
                <View>
                  <Text style={ui.heading}>Tổng cộng</Text>
                  <Text style={styles.totalNote}>Đã bao gồm VAT 8%</Text>
                </View>
                <Text style={styles.total}>{money(total)}</Text>
              </View>
              <Text style={styles.thanks}>
                Cảm ơn bạn đã dùng bữa tại Bếp Nhà!
              </Text>
            </View>
          </View>
          {paid ? (
            <View style={[ui.card, styles.cashCard]}>
              <View style={ui.between}>
                <Text style={ui.body}>Khách đã đưa</Text>
                <Text style={ui.body}>{money(cash)}</Text>
              </View>
              <View style={ui.between}>
                <Text style={ui.body}>Tiền thừa</Text>
                <Text style={ui.price}>{money(cash - total)}</Text>
              </View>
            </View>
          ) : (
            <View style={[ui.card, styles.cashCard]}>
              <Text style={ui.label}>Tiền khách đưa (VNĐ)</Text>
              <TextInput
                accessibilityLabel="Tiền khách đưa"
                value={cashText}
                onChangeText={setCashText}
                keyboardType="number-pad"
                placeholder="Nhập số tiền"
                placeholderTextColor={colors.muted}
                style={[ui.input, !!cashText && !cashValid && ui.inputError]}
              />
              {!!cashText && !cashValid && (
                <Text style={ui.error}>
                  {!Number.isSafeInteger(cash) || cash < 0
                    ? 'Vui lòng nhập số tiền hợp lệ.'
                    : `Khách cần đưa thêm ${money(Math.max(total - cash, 0))}.`}
                </Text>
              )}
              <View style={ui.wrap}>
                {Array.from(
                  new Set([
                    total,
                    Math.ceil(total / 50000) * 50000,
                    Math.ceil(total / 100000) * 100000,
                  ]),
                ).map(value => (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    onPress={() => setCashText(String(value))}
                    style={({ pressed }) => [ui.chip, pressed && ui.pressed]}
                  >
                    <Text style={ui.chipText}>{money(value)}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={ui.between}>
                <Text style={ui.body}>Tiền thừa</Text>
                <Text style={styles.change}>
                  {money(cashValid ? cash - total : 0)}
                </Text>
              </View>
              <Button
                title={saving ? 'Đang lưu…' : 'Xác nhận thanh toán'}
                disabled={saving || !cashValid}
                onPress={checkout}
              />
              <Text style={ui.muted}>
                Hoàn tất thanh toán sẽ trả bàn về trạng thái trống.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  receipt: { ...ui.card, padding: 0, overflow: 'hidden', borderRadius: 25 },
  receiptHeader: {
    backgroundColor: colors.forest,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  receiptIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#2B503E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBrand: {
    color: colors.gold,
    letterSpacing: 4,
    fontSize: 10,
    fontWeight: '600',
  },
  receiptTitle: {
    color: colors.white,
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  receiptTime: { color: '#B8C8B1', fontSize: 11 },
  receiptBody: { padding: 20, gap: 15 },
  columnLabel: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '600',
  },
  dashed: {
    borderTopWidth: 1,
    borderColor: '#D9E0D3',
    borderStyle: 'dashed',
    marginVertical: 3,
  },
  totalBox: {
    backgroundColor: colors.greenSoft,
    marginHorizontal: -6,
    padding: 14,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  totalNote: { color: colors.muted, fontSize: 10, marginTop: 4 },
  thanks: { textAlign: 'center', color: colors.muted, fontSize: 10 },
  line: { gap: 4, paddingVertical: 4 },
  lineName: { fontSize: 16, fontWeight: '600', color: colors.ink },
  amount: { fontSize: 15, fontWeight: '600', color: colors.ink },
  total: { fontSize: 24, fontWeight: '700', color: colors.primary },
  cashCard: { gap: 14 },
  change: { color: colors.green, fontWeight: '700', fontSize: 21 },
});
