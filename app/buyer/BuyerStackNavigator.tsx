import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StorefrontScreen from './StorefrontScreen';
import ProductScreen from './ProductScreen';
import CartScreen from './CartScreen';
import BuyerOrdersScreen from './BuyerOrdersScreen';
import WishlistScreen from './WishlistScreen';
import { BuyerStackParamList } from '../../types';

const Stack = createNativeStackNavigator<BuyerStackParamList>();

const BuyerStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Storefront"
        component={StorefrontScreen}
      />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
      />
      <Stack.Screen
        name="Orders"
        component={BuyerOrdersScreen}
      />
      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
      />
    </Stack.Navigator>
  );
};

export default BuyerStackNavigator;