import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { WishlistProvider } from '../contexts/WishlistContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <PaperProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="main" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </PaperProvider>
  );
}