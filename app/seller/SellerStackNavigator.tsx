import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookListingScreen from './BookListingScreen';
import SalesDashboardScreen from './SalesDashboardScreen';
import OrderManagementScreen from './OrderManagementScreen';
import { SellerStackParamList } from '../../types';

const Stack = createNativeStackNavigator<SellerStackParamList>();

const SellerStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="BookListing"
        component={BookListingScreen}
      />
      <Stack.Screen
        name="SalesDashboard"
        component={SalesDashboardScreen}
      />
      <Stack.Screen
        name="OrderManagement"
        component={OrderManagementScreen}
      />
    </Stack.Navigator>
  );
};

export default SellerStackNavigator;