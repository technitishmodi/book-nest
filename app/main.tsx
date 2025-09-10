import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import BuyerStackNavigator from './buyer/BuyerStackNavigator';
import SellerStackNavigator from './seller/SellerStackNavigator';
import { TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();

const MainTabNavigator: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log('MainTabNavigator: user =', user, 'loading =', loading, 'isAuthenticated =', isAuthenticated);

  // Show loading if still checking auth state
  if (loading) {
    console.log('MainTabNavigator: Still loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  if (!user || !isAuthenticated) {
    console.log('MainTabNavigator: No user or not authenticated, returning null');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 16, color: '#666' }}>Authenticating...</Text>
      </View>
    );
  }

  console.log('MainTabNavigator: Rendering tabs for user role:', user.role);

  // Determine initial route based on user role
  const initialRouteName = user.role === 'seller' ? 'SellerTab' : 'BuyerTab';
  console.log('MainTabNavigator: Initial route will be:', initialRouteName);

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
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
      {user.role === 'buyer' && (
        <Tab.Screen
          name="BuyerTab"
          component={BuyerStackNavigator}
          options={{
            tabBarLabel: 'Shop',
          }}
        />
      )}
      {user.role === 'seller' && (
        <Tab.Screen
          name="SellerTab"
          component={SellerStackNavigator}
          options={{
            tabBarLabel: 'Seller',
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default MainTabNavigator;