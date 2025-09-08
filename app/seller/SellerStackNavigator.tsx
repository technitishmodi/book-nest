import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookListingScreen from './BookListingScreen';
import SalesDashboardScreen from './SalesDashboardScreen';
import OrderManagementScreen from './OrderManagementScreen';
import { SellerStackParamList } from '../../types';

const Stack = createNativeStackNavigator<SellerStackParamList>();

const SellerStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BookListing"
        component={BookListingScreen}
        options={{ title: 'My Books' }}
      />
      <Stack.Screen
        name="SalesDashboard"
        component={SalesDashboardScreen}
        options={{ title: 'Sales Dashboard' }}
      />
      <Stack.Screen
        name="OrderManagement"
        component={OrderManagementScreen}
        options={{ title: 'Order Management' }}
      />
    </Stack.Navigator>
  );
};

export default SellerStackNavigator;