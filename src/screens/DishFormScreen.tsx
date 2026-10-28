import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { categories, Category, RootStackParams } from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import { colors, ui } from '../theme';
import { FoodPhoto } from '../components/Visuals';
import { Button, perform } from '../components/UI';
import { saveDish, validateDish } from '../utils/restaurant';

export function DishFormScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'DishForm'>) {
  const { data, saving, commit } = useRestaurant();
  const dish = data.dishes.find(d => d.id === route.params?.dishId);
  const [name, setName] = useState(dish?.name ?? '');
  const [price, setPrice] = useState(dish ? String(dish.price) : '');
  const [category, setCategory] = useState<Category>(
    dish?.category ?? 'Khai vị',
  );
  const [available, setAvailable] = useState(dish?.available ?? true);
  const [touched, setTouched] = useState({ name: false, price: false });
  const errors = validateDish(name, price, data.dishes, dish?.id);
  function submit() {
    setTouched({ name: true, price: true });
    if (errors.name || errors.price) {
      return;
    }
    perform(
      () =>
        commit(state =>
          saveDish(
            state,
            { name, price: Number(price), category, available },
            dish?.id,
          ),
        ),
      () => navigation.goBack(),
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
          <View style={styles.preview}>
            <View style={ui.flex}>
              <Text style={styles.overline}>THỰC ĐƠN BẾP NHÀ</Text>
              <Text style={styles.previewTitle}>
                {dish ? 'Chăm chút\ntừng món ngon' : 'Thêm một\nhương vị mới'}
              </Text>
              <Text style={styles.previewCaption}>
                Từ gian bếp đến trái tim thực khách.
              </Text>
            </View>
            <FoodPhoto dish={dish} tile={dish ? undefined : 0} size={104} />
          </View>
          <View style={ui.between}>
            <Text style={ui.heading}>Thông tin món ăn</Text>
            <Text style={ui.muted}>* Bắt buộc</Text>
          </View>
          <View style={ui.card}>
            <Text style={ui.label}>Tên món ăn *</Text>
            <TextInput
              accessibilityLabel="Tên món ăn"
              placeholder="Ví dụ: Cơm gà Hội An"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              onBlur={() => setTouched(v => ({ ...v, name: true }))}
              style={[ui.input, touched.name && !!errors.name && ui.inputError]}
            />
            {touched.name && !!errors.name && (
              <Text style={ui.error}>{errors.name}</Text>
            )}
          </View>
          <View style={ui.card}>
            <Text style={ui.label}>Loại món</Text>
            <View style={ui.wrap}>
              {categories.map(value => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: category === value }}
                  onPress={() => setCategory(value)}
                  style={({ pressed }) => [
                    ui.chip,
                    category === value && ui.chipActive,
                    pressed && ui.pressed,
                  ]}
                >
                  <Text
                    style={[
                      ui.chipText,
                      category === value && ui.chipTextActive,
                    ]}
                  >
                    {value}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={ui.card}>
            <Text style={ui.label}>Giá bán (VNĐ) *</Text>
            <TextInput
              accessibilityLabel="Giá bán"
              placeholder="75000"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              value={price}
              onChangeText={setPrice}
              onBlur={() => setTouched(v => ({ ...v, price: true }))}
              style={[
                ui.input,
                touched.price && !!errors.price && ui.inputError,
              ]}
            />
            {touched.price && !!errors.price ? (
              <Text style={ui.error}>{errors.price}</Text>
            ) : (
              <Text style={ui.muted}>
                Giá là bội số của 1.000 đ, ví dụ: 45.000 đ.
              </Text>
            )}
          </View>
          <View style={[ui.card, ui.between]}>
            <View style={ui.flex}>
              <Text style={ui.label}>Còn phục vụ</Text>
              <Text style={ui.muted}>Tắt khi món tạm hết nguyên liệu.</Text>
            </View>
            <Switch
              accessibilityLabel="Còn phục vụ"
              value={available}
              onValueChange={setAvailable}
              trackColor={{ false: colors.disabled, true: colors.green }}
            />
          </View>
          <Button
            title={
              saving ? 'Đang lưu…' : dish ? 'Lưu thay đổi' : 'Thêm vào thực đơn'
            }
            disabled={saving}
            onPress={submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  preview: {
    backgroundColor: colors.forest,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  overline: {
    fontSize: 8,
    color: colors.gold,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  previewTitle: {
    color: colors.white,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginVertical: 12,
  },
  previewCaption: { color: '#B6C9AD', fontSize: 10, lineHeight: 16 },
});
