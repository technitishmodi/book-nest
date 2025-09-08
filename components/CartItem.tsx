import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card, Title, Text, IconButton } from 'react-native-paper';
import { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.content}>
          <Title numberOfLines={2} style={styles.title}>
            {item.title}
          </Title>
          <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
          <View style={styles.quantityContainer}>
            <IconButton
              icon="minus"
              size={20}
              onPress={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
            />
            <Text style={styles.quantity}>{item.quantity}</Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => onUpdateQuantity(item.quantity + 1)}
            />
          </View>
        </View>
        <View style={styles.rightSection}>
          <IconButton icon="delete" size={20} onPress={onRemove} />
          <Text style={styles.total}>
            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 2,
  },
  container: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    paddingLeft: 12,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default CartItem;