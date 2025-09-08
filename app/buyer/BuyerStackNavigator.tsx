import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StorefrontScreen from './StorefrontScreen';
import ProductScreen from './ProductScreen';
import CartScreen from './CartScreen';
import BuyerOrdersScreen from './BuyerOrdersScreen';
import { BuyerStackParamList } from '../../types';

const Stack = createNativeStackNavigator<BuyerStackParamList>();

const BuyerStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Storefront"
        component={StorefrontScreen}
        options={{ title: 'BookStore' }}
      />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={{ title: 'Book Details' }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Shopping Cart' }}
      />
      <Stack.Screen
        name="Orders"
        component={BuyerOrdersScreen}
        options={{ title: 'My Orders' }}
      />
    </Stack.Navigator>
  );
};

export default BuyerStackNavigator;