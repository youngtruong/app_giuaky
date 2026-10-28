import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { categories, Category, Dish, RootStackParams } from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import { colors, ui } from '../theme';
import { Badge, Empty, perform } from '../components/UI';
import { FoodPhoto, NavIcon, TableDrawing } from '../components/Visuals';
import { BottomTabBar, HomeTab } from '../components/BottomTabBar';
import {
  deleteDish,
  money,
  normalizeName,
  servingInvoice,
  totals,
} from '../utils/restaurant';

type Props = NativeStackScreenProps<RootStackParams, 'Home'>;
const categoryShort: Record<Category, string> = {
  'Khai vị': 'Khai vị',
  'Món chính': 'Món chính',
  'Tráng miệng': 'Tráng miệng',
  'Đồ uống': 'Đồ uống',
};
export function HomeScreen({ navigation }: Props) {
  const { data, saving, commit } = useRestaurant();
  const [tab, setTab] = useState<HomeTab>('Thực đơn');
  const [filter, setFilter] = useState<Category | 'Tất cả'>('Tất cả');
  const [search, setSearch] = useState('');
  const occupied = data.invoices.filter(
    i => i.status === 'Đang phục vụ',
  ).length;
  const available = data.dishes.filter(d => d.available).length;
  const paid = data.invoices
    .filter(i => i.status === 'Đã thanh toán')
    .slice()
    .reverse();
  const sections = categories
    .filter(c => filter === 'Tất cả' || c === filter)
    .map(category => ({
      title: category,
      data: data.dishes.filter(
        d =>
          d.category === category &&
          normalizeName(d.name).includes(normalizeName(search)),
      ),
    }))
    .filter(s => s.data.length);
  function remove(dish: Dish) {
    if (
      data.invoices.some(
        i =>
          i.status === 'Đang phục vụ' &&
          i.items.some(item => item.dishId === dish.id),
      )
    ) {
      Alert.alert(
        'Chưa thể xoá món',
        'Món này đang có trong hoá đơn đang phục vụ. Hãy thanh toán trước khi xoá.',
      );
      return;
    }
    Alert.alert('Xoá món ăn?', `Bạn muốn xoá “${dish.name}” khỏi thực đơn?`, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá món',
        style: 'destructive',
        onPress: () => {
          perform(() => commit(state => deleteDish(state, dish.id)));
        },
      },
    ]);
  }
  const header = (
    <View>
      <View style={styles.hero}>
        <View style={styles.heroRing} />
        <View style={styles.heroRingSmall} />
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>
            {tab === 'Thực đơn'
              ? 'TỪ GIAN BẾP ĐẾN BÀN ĂN'
              : tab === 'Sơ đồ bàn'
              ? 'KHÔNG GIAN BẾP NHÀ'
              : 'MỖI LẦN PHỤC VỤ'}
          </Text>
          <Text style={styles.heroTitle}>
            {tab === 'Thực đơn'
              ? 'Trọn vị ngon,\nấm tình nhà.'
              : tab === 'Sơ đồ bàn'
              ? 'Sẵn sàng cho\nnhững vị khách.'
              : 'Chỉn chu đến\ntừng hoá đơn.'}
          </Text>
          <View style={styles.heroPill}>
            <View style={styles.liveDot} />
            <Text style={styles.heroPillText}>
              {saving ? 'Đang lưu dữ liệu' : 'Bếp đang sẵn sàng'}
            </Text>
          </View>
        </View>
        <View style={styles.heroFood}>
          <FoodPhoto
            tile={tab === 'Thực đơn' ? 2 : tab === 'Sơ đồ bàn' ? 0 : 3}
            size={158}
          />
        </View>
        <View style={styles.heroStar}>
          <Text style={styles.starText}>✦</Text>
        </View>
      </View>
      <View style={styles.stats}>
        {[
          {
            value: String(data.dishes.length).padStart(2, '0'),
            label: 'Món trong thực đơn',
          },
          { value: `${occupied}/10`, label: 'Bàn đang có khách' },
          {
            value: String(available).padStart(2, '0'),
            label: 'Món sẵn phục vụ',
          },
        ].map((stat, i) => (
          <View
            key={stat.label}
            style={[styles.stat, i !== 0 && styles.statBorder]}
          >
            <Text style={[styles.statValue, i === 1 && styles.statAccent]}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.sectionTop}>
        <View style={ui.flex}>
          <Text style={styles.pageTitle}>
            {tab === 'Thực đơn'
              ? 'Thực đơn'
              : tab === 'Sơ đồ bàn'
              ? 'Sơ đồ bàn'
              : 'Hoá đơn đã thanh toán'}
          </Text>
          <Text style={styles.pageSubtitle}>
            {tab === 'Thực đơn'
              ? 'Món ngon mỗi ngày, phục vụ tận tâm'
              : tab === 'Sơ đồ bàn'
              ? 'Chọn bàn để gọi món hoặc phục vụ tiếp'
              : `${paid.length} lần phục vụ trọn vẹn`}
          </Text>
        </View>
        {tab === 'Thực đơn' && (
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('DishForm')}
            style={({ pressed }) => [styles.addButton, pressed && ui.pressed]}
          >
            <Text style={styles.addText}>+ Thêm món</Text>
          </Pressable>
        )}
      </View>
      {tab === 'Thực đơn' && (
        <>
          <View style={styles.search}>
            <NavIcon name="search" />
            <TextInput
              accessibilityLabel="Tìm món ăn"
              value={search}
              onChangeText={setSearch}
              placeholder="Bạn đang tìm món gì?"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {(['Tất cả', ...categories] as const).map(c => (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === c }}
                onPress={() => setFilter(c)}
                style={({ pressed }) => [
                  styles.filter,
                  filter === c && styles.filterActive,
                  pressed && ui.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === c && styles.filterTextActive,
                  ]}
                >
                  {c === 'Tất cả' ? 'Tất cả' : categoryShort[c]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
      {tab === 'Sơ đồ bàn' && (
        <View style={styles.legend}>
          <View style={ui.row}>
            <View style={styles.legendDot} />
            <Text style={ui.muted}>Trống ({10 - occupied})</Text>
          </View>
          <View style={ui.row}>
            <View style={[styles.legendDot, styles.legendBusy]} />
            <Text style={ui.muted}>Có khách ({occupied})</Text>
          </View>
          <Text style={styles.floor}>TẦNG 01</Text>
        </View>
      )}
      {tab === 'Hoá đơn' && (
        <View style={styles.revenue}>
          <View>
            <Text style={styles.revenueLabel}>TỔNG ĐÃ THU</Text>
            <Text style={styles.revenueValue}>
              {money(
                paid.reduce((sum, i) => sum + totals(i, data.dishes).total, 0),
              )}
            </Text>
          </View>
          <View style={styles.revenueIcon}>
            <NavIcon name="receipt" color={colors.green} />
          </View>
        </View>
      )}
    </View>
  );
  return (
    <SafeAreaView style={ui.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <View style={ui.row}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>b.</Text>
          </View>
          <View>
            <Text style={styles.brandName}>
              Bếp Nhà<Text style={styles.brandAccent}> /</Text>
            </Text>
            <Text style={styles.brandSubtitle}>QUẢN LÝ NHÀ HÀNG</Text>
          </View>
        </View>
        <View style={styles.topRight}>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
            })}
          </Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>BN</Text>
          </View>
        </View>
      </View>
      {tab === 'Thực đơn' && (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <Empty
              title={search ? 'Chưa tìm thấy món' : 'Thực đơn đang trống'}
              detail={
                search
                  ? 'Thử một tên món khác hoặc đổi nhóm món.'
                  : 'Thêm món đầu tiên để bắt đầu phục vụ.'
              }
            />
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{section.title}</Text>
              <View style={styles.count}>
                <Text style={styles.countText}>{section.data.length}</Text>
              </View>
              <View style={styles.groupLine} />
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.dishCard, !item.available && styles.soldCard]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Sửa ${item.name}`}
                disabled={saving}
                onPress={() =>
                  navigation.navigate('DishForm', { dishId: item.id })
                }
                onLongPress={() => remove(item)}
                style={({ pressed }) => [
                  ui.row,
                  ui.flex,
                  pressed && ui.pressed,
                ]}
              >
                <View style={!item.available && ui.faded}>
                  <FoodPhoto dish={item} />
                </View>
                <View style={ui.flex}>
                  <Text style={styles.dishCategory}>
                    {item.category.toUpperCase()}
                  </Text>
                  <Text style={[styles.dishName, !item.available && ui.faded]}>
                    {item.name}
                  </Text>
                  <Text style={styles.dishPrice}>{money(item.price)}</Text>
                </View>
              </Pressable>
              <View style={styles.availability}>
                <Switch
                  accessibilityLabel={`Còn phục vụ ${item.name}`}
                  value={item.available}
                  disabled={saving}
                  trackColor={{ false: '#D8DDD4', true: colors.green }}
                  style={styles.smallSwitch}
                  onValueChange={value => {
                    perform(() =>
                      commit(state => ({
                        ...state,
                        dishes: state.dishes.map(d =>
                          d.id === item.id ? { ...d, available: value } : d,
                        ),
                      })),
                    );
                  }}
                />
                <Text
                  style={[
                    styles.availabilityText,
                    !item.available && styles.unavailableText,
                  ]}
                >
                  {item.available ? 'Còn món' : 'Hết món'}
                </Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            data.dishes.length ? (
              <Text style={styles.hint}>
                Chạm vào món để sửa · Nhấn giữ để xoá
              </Text>
            ) : undefined
          }
        />
      )}
      {tab === 'Sơ đồ bàn' && (
        <FlatList
          data={Array.from({ length: 10 }, (_, i) => i + 1)}
          keyExtractor={String}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.tableRow}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={header}
          renderItem={({ item }) => {
            const invoice = servingInvoice(data, item);
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Bàn ${item}, ${
                  invoice ? 'có khách' : 'trống'
                }`}
                onPress={() =>
                  navigation.navigate('Order', { tableNumber: item })
                }
                style={({ pressed }) => [
                  styles.tableCard,
                  invoice && styles.busyCard,
                  pressed && ui.pressed,
                ]}
              >
                <View style={ui.between}>
                  <Text
                    style={[styles.tableLabel, invoice && styles.busyLight]}
                  >
                    BÀN {String(item).padStart(2, '0')}
                  </Text>
                  <View
                    style={[
                      styles.tableBadge,
                      invoice && styles.tableBadgeBusy,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tableBadgeText,
                        invoice && styles.busyLight,
                      ]}
                    >
                      {invoice ? 'Có khách' : 'Trống'}
                    </Text>
                  </View>
                </View>
                <TableDrawing number={item} busy={!!invoice} />
                <View style={styles.tableDivider} />
                <View style={ui.between}>
                  <View style={ui.flex}>
                    <Text
                      style={[styles.tableAmount, invoice && styles.busyWhite]}
                    >
                      {invoice
                        ? money(totals(invoice, data.dishes).subtotal)
                        : 'Sẵn sàng đón khách'}
                    </Text>
                    <Text
                      style={[styles.tableDetail, invoice && styles.busyLight]}
                    >
                      {invoice
                        ? `${invoice.items.reduce(
                            (s, i) => s + i.quantity,
                            0,
                          )} phần đang phục vụ`
                        : 'Chạm để gọi món'}
                    </Text>
                  </View>
                  <Text
                    style={[styles.tableArrow, invoice && styles.busyLight]}
                  >
                    ↗
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
      {tab === 'Hoá đơn' && (
        <FlatList
          data={paid}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <Empty
              title="Chưa có hoá đơn"
              detail="Những hoá đơn hoàn tất sẽ được lưu tại đây."
            />
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('Checkout', { invoiceId: item.id })
              }
              style={({ pressed }) => [
                styles.invoiceCard,
                pressed && ui.pressed,
              ]}
            >
              <View style={ui.between}>
                <View style={ui.row}>
                  <View style={styles.billIcon}>
                    <NavIcon name="receipt" color={colors.green} />
                  </View>
                  <View>
                    <Text style={styles.billTitle}>
                      Bàn {String(item.tableNumber).padStart(2, '0')}
                    </Text>
                    <Text style={ui.muted}>
                      {item.paidAt ?? item.createdAt}
                    </Text>
                  </View>
                </View>
                <Text style={styles.tableArrow}>↗</Text>
              </View>
              <View style={styles.invoiceDivider} />
              <View style={ui.between}>
                <Badge title="Đã thanh toán" green />
                <Text style={styles.billTotal}>
                  {money(totals(item, data.dishes).total)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
      <BottomTabBar value={tab} onChange={setTab} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.gold,
    fontSize: 33,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginTop: -5,
  },
  brandName: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 22,
    letterSpacing: -0.8,
  },
  brandAccent: { color: colors.primary },
  brandSubtitle: {
    fontSize: 8,
    color: colors.muted,
    fontWeight: '600',
    letterSpacing: 1.7,
    marginTop: 3,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  date: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#E7EBD9',
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.green, fontSize: 11, fontWeight: '700' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  hero: {
    height: 182,
    backgroundColor: colors.forest,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  heroCopy: { paddingLeft: 22, gap: 14, zIndex: 2 },
  heroEyebrow: {
    color: '#A7BCA5',
    fontSize: 8,
    letterSpacing: 1.3,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFF7E8',
    fontSize: 29,
    lineHeight: 35,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -1,
  },
  heroPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#B1CA91' },
  heroPillText: { fontSize: 10, color: '#C5D3BC' },
  heroFood: {
    position: 'absolute',
    right: -28,
    top: 25,
    borderWidth: 6,
    borderColor: '#3E5947',
    borderRadius: 100,
    transform: [{ rotate: '-14deg' }],
  },
  heroRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    right: -54,
    top: -17,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: '#41604A',
  },
  heroRingSmall: {
    position: 'absolute',
    width: 254,
    height: 254,
    right: -66,
    top: -29,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: '#2B503C',
  },
  heroStar: { position: 'absolute', right: 123, top: 21 },
  starText: { color: colors.gold, fontSize: 25 },
  stats: {
    flexDirection: 'row',
    paddingVertical: 19,
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center', gap: 5 },
  statBorder: { borderLeftWidth: 1, borderColor: colors.border },
  statValue: {
    fontSize: 23,
    fontWeight: '700',
    color: colors.green,
    letterSpacing: -0.7,
  },
  statAccent: { color: colors.primary },
  statLabel: { fontSize: 9, color: colors.muted, textAlign: 'center' },
  sectionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 27,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 25,
    color: colors.ink,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  pageSubtitle: { fontSize: 11, color: colors.muted, marginTop: 5 },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 13,
  },
  addText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  search: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 9,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 13,
    color: colors.ink,
    paddingVertical: 12,
  },
  filters: { gap: 8, paddingVertical: 15 },
  filter: {
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#EDEFEB',
  },
  filterActive: { backgroundColor: colors.green },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: colors.white },
  groupHeader: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingTop: 9,
    paddingBottom: 12,
  },
  groupTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  count: {
    backgroundColor: '#E7EDDF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  countText: { fontSize: 10, color: colors.green, fontWeight: '600' },
  groupLine: {
    height: 1,
    backgroundColor: colors.border,
    flex: 1,
    marginLeft: 4,
  },
  dishCard: {
    ...ui.card,
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  soldCard: { backgroundColor: '#F0F1EC' },
  dishCategory: {
    fontSize: 8,
    color: '#97A18E',
    letterSpacing: 1.1,
    fontWeight: '600',
    marginBottom: 5,
  },
  dishName: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    marginBottom: 7,
  },
  dishPrice: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  availability: { width: 54, alignItems: 'center', gap: 3 },
  smallSwitch: { transform: [{ scale: 0.74 }] },
  availabilityText: { color: colors.green, fontSize: 9 },
  unavailableText: { color: colors.danger },
  hint: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 11,
    marginVertical: 18,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 8,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#B5C8A6',
  },
  legendBusy: { backgroundColor: colors.primary },
  floor: {
    marginLeft: 'auto',
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1.5,
  },
  tableRow: { gap: 12 },
  tableCard: {
    ...ui.card,
    flex: 1,
    marginTop: 12,
    padding: 13,
    borderRadius: 22,
  },
  busyCard: { backgroundColor: colors.forest, borderColor: colors.forest },
  tableLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  tableBadge: {
    backgroundColor: '#EDF3E7',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tableBadgeBusy: { backgroundColor: '#345342' },
  tableBadgeText: { color: colors.green, fontSize: 9, fontWeight: '600' },
  tableDivider: { height: 1, backgroundColor: '#8D9D8126', marginBottom: 12 },
  tableAmount: { fontSize: 12, color: colors.ink, fontWeight: '700' },
  tableDetail: { fontSize: 10, color: colors.muted, marginTop: 4 },
  tableArrow: { color: colors.primary, fontSize: 20 },
  busyLight: { color: '#B9CEAA' },
  busyWhite: { color: colors.white },
  invoiceCard: { ...ui.card, gap: 14, marginTop: 13 },
  billIcon: {
    width: 43,
    height: 43,
    backgroundColor: colors.greenSoft,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  invoiceDivider: { height: 1, backgroundColor: colors.border },
  billTotal: { fontSize: 20, fontWeight: '700', color: colors.ink },
  revenue: {
    backgroundColor: '#E6EEDB',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  revenueLabel: {
    fontSize: 9,
    color: colors.green,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  revenueValue: {
    color: colors.green,
    fontSize: 29,
    fontWeight: '700',
    marginTop: 7,
    letterSpacing: -1,
  },
  revenueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D9E5CD',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
