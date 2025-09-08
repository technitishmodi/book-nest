import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import BuyerStackNavigator from './buyer/BuyerStackNavigator';
import SellerStackNavigator from './seller/SellerStackNavigator';
import { TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();

const MainTabNavigator: React.FC = () => {
  const { user } = useAuth();

  console.log('MainTabNavigator: user =', user);

  if (!user) {
    console.log('MainTabNavigator: No user, returning null');
    return null;
  }

  console.log('MainTabNavigator: Rendering tabs for user role:', user.role);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'BuyerTab') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else {
            iconName = focused ? 'business' : 'business-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="BuyerTab"
        component={BuyerStackNavigator}
        options={{
          tabBarLabel: 'Shop',
          tabBarStyle: {
            display: user.role === 'buyer' ? 'flex' : 'none',
          },
        }}
      />
      <Tab.Screen
        name="SellerTab"
        component={SellerStackNavigator}
        options={{
          tabBarLabel: 'Seller',
          tabBarStyle: {
            display: user.role === 'seller' ? 'flex' : 'none',
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;