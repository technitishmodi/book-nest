import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Dimensions, StatusBar, Platform } from 'react-native';
import { Title, Button, Card, Text, TextInput, SegmentedButtons, Surface, Divider, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const AuthScreen: React.FC = () => {
  const { login, register, loading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Clear errors when switching modes
  const clearErrors = () => {
    setErrors({ name: '', email: '', password: '' });
  };

  // Navigate after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Auth successful, navigating to main with user:', user);
      router.replace('/main');
    }
  }, [isAuthenticated, user, router]);

  // Validate form inputs
  const validateForm = () => {
    const newErrors = { name: '', email: '', password: '' };
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Name validation for registration
    if (!isLogin && !formData.name) {
      newErrors.name = 'Full name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Attempting authentication...', { isLogin, email: formData.email });

      if (isLogin) {
        await login(formData.email, formData.password);
        console.log('Login completed, should navigate now');
      } else {
        await register(formData.name, formData.email, formData.password, role);
        console.log('Registration completed, should navigate now');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert(
        'Authentication Error', 
        error.response?.data?.error || error.message || 'An error occurred during authentication'
      );
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    clearErrors();
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true}
      />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.logo}>📚</Text>
            </View>
            <Title style={styles.appTitle}>BookNest</Title>
            <Text style={styles.appSubtitle}>Your Literary Marketplace</Text>
          </View>

          {/* Main Card */}
          <Surface style={styles.card} elevation={5}>
            <View style={styles.content}>
              <View style={styles.cardHeader}>
                <Title style={styles.title}>
                  {isLogin ? 'Welcome Back!' : 'Join BookNest'}
                </Title>
                <Text style={styles.subtitle}>
                  {isLogin 
                    ? 'Sign in to continue your reading journey' 
                    : 'Create your account and start exploring'
                  }
                </Text>
              </View>
              
              {/* Role Selection for Registration */}
              {!isLogin && (
                <View style={styles.roleSection}>
                  <Text style={styles.sectionTitle}>Choose your role:</Text>
                  <SegmentedButtons
                    value={role}
                    onValueChange={(value) => setRole(value as 'buyer' | 'seller')}
                    buttons={[
                      { 
                        value: 'buyer', 
                        label: '🛍️ Book Lover',
                        style: { backgroundColor: role === 'buyer' ? '#667eea' : 'transparent' }
                      },
                      { 
                        value: 'seller', 
                        label: '📖 Book Seller',
                        style: { backgroundColor: role === 'seller' ? '#667eea' : 'transparent' }
                      },
                    ]}
                    style={styles.segmentedButtons}
                  />
                </View>
              )}

              {/* Form Section */}
              <View style={styles.formContainer}>
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Full Name"
                      value={formData.name}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, name: text }));
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                      }}
                      mode="outlined"
                      style={styles.input}
                      autoCapitalize="words"
                      error={!!errors.name}
                      left={<TextInput.Icon icon="account" />}
                      outlineColor="#E0E0E0"
                      activeOutlineColor="#667eea"
                    />
                    {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                  </View>
                )}
                
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, email: text }));
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={!!errors.email}
                    left={<TextInput.Icon icon="email" />}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#667eea"
                  />
                  {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                </View>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, password: text }));
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    error={!!errors.password}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon 
                        icon={showPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#667eea"
                  />
                  {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
                labelStyle={styles.buttonLabel}
                loading={loading}
                disabled={loading}
                buttonColor="#667eea"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>

              {/* Switch Mode */}
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {isLogin ? "New to BookNest?" : "Already have an account?"}
                </Text>
                <Button
                  mode="text"
                  onPress={switchMode}
                  disabled={loading}
                  textColor="#667eea"
                  style={styles.switchButton}
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </Button>
              </View>

              <Divider style={styles.divider} />

              {/* Demo Credentials */}
              <Surface style={styles.demoCard} elevation={1}>
                <View style={styles.demoContent}>
                  <Text style={styles.demoTitle}>🚀 Quick Demo Access</Text>
                  <Text style={styles.demoDescription}>
                    Try the app instantly with these demo credentials:
                  </Text>
                  
                  <View style={styles.demoCredentials}>
                    <View style={styles.demoRole}>
                      <Text style={styles.demoRoleTitle}>📖 Book Seller</Text>
                      <Text style={styles.demoText}>testseller@example.com</Text>
                      <Text style={styles.demoText}>password123</Text>
                    </View>
                    
                    <View style={styles.demoRole}>
                      <Text style={styles.demoRoleTitle}>🛍️ Book Buyer</Text>
                      <Text style={styles.demoText}>testbuyer@example.com</Text>
                      <Text style={styles.demoText}>password123</Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </View>
          </Surface>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '300',
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'white',
    marginHorizontal: 4,
    marginBottom: 20,
  },
  content: {
    padding: 28,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2D3748',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#718096',
    lineHeight: 22,
  },
  roleSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2D3748',
  },
  segmentedButtons: {
    marginBottom: 4,
  },
  formContainer: {
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    fontSize: 16,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  switchText: {
    color: '#718096',
    fontSize: 14,
    marginRight: 4,
  },
  switchButton: {
    marginLeft: -8,
  },
  divider: {
    marginVertical: 24,
    backgroundColor: '#E2E8F0',
  },
  demoCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoContent: {
    padding: 20,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2D3748',
  },
  demoDescription: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  demoCredentials: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  demoRole: {
    alignItems: 'center',
    flex: 1,
    minWidth: 140,
    marginVertical: 8,
  },
  demoRoleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default AuthScreen;