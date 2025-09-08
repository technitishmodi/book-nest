import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Title, Text, Button, Appbar, Snackbar, Divider } from 'react-native-paper';
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
      <Text style={styles.emptyText}>Your cart is empty</Text>
      <Button mode="contained" onPress={() => navigation.navigate('Storefront')}>
        Start Shopping
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={navigation.goBack} />
        <Appbar.Content title="Shopping Cart" />
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
            <Divider style={styles.divider} />
            <View style={styles.totalRow}>
              <Title style={styles.totalLabel}>Total:</Title>
              <Title style={styles.totalPrice}>${getTotalPrice().toFixed(2)}</Title>
            </View>
            
            <Button
              mode="contained"
              onPress={handleCheckout}
              loading={loading}
              disabled={loading || cart.length === 0}
              style={styles.checkoutButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Processing...' : 'Checkout'}
            </Button>
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
    backgroundColor: '#F5F5F5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  totalContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  divider: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 20,
  },
  totalPrice: {
    fontSize: 24,
    color: '#2196F3',
  },
  checkoutButton: {
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default CartScreen;