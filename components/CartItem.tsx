import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Card, Title, Text, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <Card style={styles.card} elevation={3}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </View>
        <View style={styles.content}>
          <Title numberOfLines={2} style={styles.title}>
            {item.title}
          </Title>
          <Text style={styles.price}>${parseFloat(item.price).toFixed(2)} each</Text>
          
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => onUpdateQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1}
                style={[
                  styles.quantityButton,
                  { opacity: item.quantity <= 1 ? 0.5 : 1 }
                ]}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantity}>{item.quantity}</Text>
              </View>
              <TouchableOpacity
                onPress={() => onUpdateQuantity(item.quantity + 1)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.rightSection}>
          <TouchableOpacity onPress={onRemove} style={styles.deleteButton}>
            <LinearGradient
              colors={['#FF6B6B', '#FF5252']}
              style={styles.deleteGradient}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>
              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  container: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: 90,
    height: 110,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: 24,
  },
  price: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  quantitySection: {
    marginTop: 8,
  },
  quantityLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  quantityDisplay: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  deleteButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  deleteGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 16,
  },
  totalContainer: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
});

export default CartItem;