import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const IndexScreen: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('IndexScreen: Auth state changed', { isAuthenticated, loading, user: user?.email });
    
    if (!loading) {
      if (isAuthenticated && user) {
        console.log('IndexScreen: Navigating to main for user:', user.email, user.role);
        router.replace('/main');
      } else {
        console.log('IndexScreen: Navigating to auth');
        router.replace('/auth');
      }
    }
  }, [isAuthenticated, loading, user, router]);

  // Show loading while checking authentication state
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={{ marginTop: 16, color: '#666' }}>
        {loading ? 'Checking authentication...' : 'Redirecting...'}
      </Text>
    </View>
  );
};

export default IndexScreen;
