import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Text, View } from 'react-native';
import { RestaurantData } from '../types';
import { seedData } from '../data/seed';
import { colors, ui } from '../theme';
import { Button } from '../components/UI';

const STORAGE_KEY = '@restaurant/data/v1';
type Store = {
  data: RestaurantData;
  saving: boolean;
  commit: (change: (data: RestaurantData) => RestaurantData) => Promise<void>;
};
const Context = createContext<Store | null>(null);

export function RestaurantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<RestaurantData | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const current = useRef<RestaurantData | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let active = true;
    setError('');
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const loaded: RestaurantData =
          raw === null ? seedData() : JSON.parse(raw);
        if (
          loaded.version !== 1 ||
          !Array.isArray(loaded.dishes) ||
          !Array.isArray(loaded.invoices)
        ) {
          throw new Error('Dữ liệu lưu không hợp lệ.');
        }
        if (raw === null) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
        }
        if (active) {
          current.current = loaded;
          setData(loaded);
        }
      } catch {
        if (active) {
          setError(
            'Không thể đọc dữ liệu. Dữ liệu cũ vẫn được giữ nguyên. Vui lòng thử lại.',
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [attempt]);

  function commit(change: (state: RestaurantData) => RestaurantData) {
    const task = queue.current.then(async () => {
      if (!current.current) {
        throw new Error('Dữ liệu chưa sẵn sàng.');
      }
      setSaving(true);
      try {
        const next = change(current.current);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        current.current = next;
        setData(next);
      } finally {
        setSaving(false);
      }
    });
    queue.current = task.catch(() => {});
    return task;
  }

  if (!data) {
    return (
      <View style={[ui.screen, ui.content]}>
        {error ? (
          <>
            <Text style={ui.body}>{error}</Text>
            <Button title="Thử lại" onPress={() => setAttempt(v => v + 1)} />
          </>
        ) : (
          <>
            <ActivityIndicator color={colors.primary} />
            <Text style={ui.muted}>Đang mở Bếp Nhà…</Text>
          </>
        )}
      </View>
    );
  }
  return (
    <Context.Provider value={{ data, saving, commit }}>
      {children}
    </Context.Provider>
  );
}
export function useRestaurant() {
  const store = useContext(Context);
  if (!store) {
    throw new Error('Thiếu RestaurantProvider');
  }
  return store;
}
