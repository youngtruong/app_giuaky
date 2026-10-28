import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RestaurantProvider } from './src/context/RestaurantContext';
import { RootStackParams } from './src/types';
import { colors } from './src/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { DishFormScreen } from './src/screens/DishFormScreen';
import { OrderScreen } from './src/screens/OrderScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';

const Stack = createNativeStackNavigator<RootStackParams>();
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <RestaurantProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerTintColor: colors.ink,
              headerStyle: { backgroundColor: colors.background },
              headerShadowVisible: false,
              headerBackTitle: 'Quay lại',
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DishForm"
              component={DishFormScreen}
              options={({ route }) => ({
                title: route.params?.dishId ? 'Sửa món' : 'Thêm món',
              })}
            />
            <Stack.Screen
              name="Order"
              component={OrderScreen}
              options={{ title: 'Gọi món' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ title: 'Chi tiết hoá đơn' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </RestaurantProvider>
    </SafeAreaProvider>
  );
}
