/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';
import {
  RestaurantProvider,
  useRestaurant,
} from '../src/context/RestaurantContext';
import { saveDish } from '../src/utils/restaurant';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);
let store: ReturnType<typeof useRestaurant>;
function Probe() {
  store = useRestaurant();
  return <Text>{store.data.dishes.length} món</Text>;
}
test('saved dishes survive provider unmount and remount', async () => {
  await AsyncStorage.clear();
  let root: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(
      <RestaurantProvider>
        <Probe />
      </RestaurantProvider>,
    );
  });
  await ReactTestRenderer.act(async () => {
    await store.commit(data =>
      saveDish(
        data,
        {
          name: 'Món lưu thử',
          category: 'Khai vị',
          price: 10000,
          available: true,
        },
        'persist-test',
      ),
    );
  });
  expect(store!.data.dishes).toHaveLength(9);
  await ReactTestRenderer.act(async () => {
    root!.unmount();
  });
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(
      <RestaurantProvider>
        <Probe />
      </RestaurantProvider>,
    );
  });
  expect(store!.data.dishes.find(d => d.id === 'persist-test')?.name).toBe(
    'Món lưu thử',
  );
  await ReactTestRenderer.act(async () => {
    root!.unmount();
  });
});
test('failed storage write preserves current state and allows a subsequent retry', async () => {
  await AsyncStorage.clear();
  let root: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(
      <RestaurantProvider>
        <Probe />
      </RestaurantProvider>,
    );
  });
  const write = jest
    .spyOn(AsyncStorage, 'setItem')
    .mockRejectedValueOnce(new Error('disk unavailable'));
  await ReactTestRenderer.act(async () => {
    await expect(
      store.commit(data => ({ ...data, dishes: [] })),
    ).rejects.toThrow('disk unavailable');
  });
  expect(store!.data.dishes).toHaveLength(8);
  write.mockRestore();
  await ReactTestRenderer.act(async () => {
    await store.commit(data => ({ ...data, dishes: [] }));
  });
  expect(store!.data.dishes).toHaveLength(0);
  await ReactTestRenderer.act(async () => {
    root!.unmount();
  });
});
