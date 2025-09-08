import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Title, Button, Card, Text, TextInput, SegmentedButtons } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen: React.FC = () => {
  const { login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async () => {
    try {
      if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password, role);
      }
    } catch (error: any) {
      Alert.alert(
        'Error', 
        error.response?.data?.error || error.message || 'An error occurred'
      );
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Title style={styles.title}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Title>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to your account' : 'Join our bookstore community'}
          </Text>
          
          {!isLogin && (
            <>
              <Text style={styles.sectionTitle}>I want to:</Text>
              <SegmentedButtons
                value={role}
                onValueChange={(value) => setRole(value as 'buyer' | 'seller')}
                buttons={[
                  { value: 'buyer', label: 'Buy Books' },
                  { value: 'seller', label: 'Sell Books' },
                ]}
                style={styles.segmentedButtons}
              />
            </>
          )}

          <View style={styles.formContainer}>
            {!isLogin && (
              <TextInput
                label="Full Name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
              />
            )}
            
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            labelStyle={styles.buttonLabel}
            loading={loading}
            disabled={loading}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <Button
              mode="text"
              onPress={switchMode}
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Button>
          </View>

          {/* Demo credentials for testing */}
          <Card style={styles.demoCard}>
            <Card.Content>
              <Text style={styles.demoTitle}>Demo Credentials</Text>
              <Text style={styles.demoText}>
                Seller: testseller@example.com / password123
              </Text>
              <Text style={styles.demoText}>
                Buyer: testbuyer@example.com / password123
              </Text>
            </Card.Content>
          </Card>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'white',
  },
  submitButton: {
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#2196F3',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    color: '#666',
  },
  demoCard: {
    marginTop: 24,
    backgroundColor: '#E3F2FD',
  },
  demoTitle: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default AuthScreen;