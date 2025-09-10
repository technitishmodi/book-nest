import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Title, Text, Button, Appbar, Snackbar, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CartItem from '../../components/CartItem';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ordersAPI } from '../../services/api';
import { BuyerStackParamList, CartItem as CartItemType } from '../../types';

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList, 'Cart'>;

const CartScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const { cart, updateQuantity, removeFromCart, getTotalPrice, placeOrder } = useCart();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setLoading(true);
      
      // Use the cart's placeOrder method which calls the real API
      await placeOrder();
      
      setShowSnackbar(true);
      
      // Navigate back to storefront after a delay
      setTimeout(() => {
        navigation.navigate('Storefront');
      }, 2000);
    } catch (error) {
      console.error('Checkout error:', error);
      // You might want to show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }: { item: CartItemType }) => (
    <CartItem
      item={item}
      onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
      onRemove={() => removeFromCart(item.id)}
    />
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>Add some books to get started!</Text>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Storefront')}
        style={styles.shopButton}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.shopButtonGradient}
        >
          <Text style={styles.shopButtonText}>🛍️ Start Shopping</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={navigation.goBack} />
        <Appbar.Content title="🛒 Shopping Cart" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      {cart.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.totalContainer}>
            <LinearGradient
              colors={['#F8F9FA', '#FFFFFF']}
              style={styles.totalGradient}
            >
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items ({cart.length})</Text>
                <Text style={styles.summaryValue}>${getTotalPrice().toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryValue}>Free</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>${getTotalPrice().toFixed(2)}</Text>
              </View>
              
              <TouchableOpacity
                onPress={handleCheckout}
                disabled={loading || cart.length === 0}
                style={[
                  styles.checkoutButton,
                  { opacity: (loading || cart.length === 0) ? 0.6 : 1 }
                ]}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.checkoutGradient}
                >
                  <Text style={styles.checkoutText}>
                    {loading ? '⏳ Processing...' : '💳 Proceed to Checkout'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </>
      )}

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={2000}
      >
        Order placed successfully!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  shopButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
  },
  shopButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  totalContainer: {
    backgroundColor: 'transparent',
  },
  totalGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E0E0E0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
  },
  checkoutButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 6,
  },
  checkoutGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  checkoutText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  header: {
    backgroundColor: '#667eea',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CartScreen;