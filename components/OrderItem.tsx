import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card, Title, Text, Chip, Button } from 'react-native-paper';
import { Order } from '../types';

interface OrderItemProps {
  order: Order;
  onUpdateStatus?: (status: Order['status']) => void;
  showActions?: boolean;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onUpdateStatus, showActions = false }) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'shipped': return '#2196F3';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get the first item for display (in a real app, you might want to show all items)
  const firstItem = order.items[0];
  const hasMultipleItems = order.items.length > 1;

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Title numberOfLines={2} style={styles.title}>
            {firstItem.title}
            {hasMultipleItems && ` +${order.items.length - 1} more`}
          </Title>
          <Text style={styles.buyer}>
            {order.buyerName ? `Buyer: ${order.buyerName}` : `Seller: ${order.sellerName}`}
          </Text>
          <Text style={styles.details}>
            Quantity: {firstItem.quantity} × ${parseFloat(firstItem.price.toString()).toFixed(2)}
          </Text>
          <Text style={styles.total}>
            Total: ${parseFloat(order.totalAmount).toFixed(2)}
          </Text>
          <Text style={styles.date}>
            Date: {formatDate(order.createdAt)}
          </Text>
          <View style={styles.statusContainer}>
            <Chip 
              mode="flat" 
              style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
              textStyle={styles.statusText}
            >
              {order.status.toUpperCase()}
            </Chip>
          </View>
        </View>
      </View>
      {showActions && order.status === 'pending' && onUpdateStatus && (
        <View style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={() => onUpdateStatus('confirmed')}
            style={styles.actionButton}
          >
            Confirm Order
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => onUpdateStatus('shipped')}
            style={[styles.actionButton, { marginTop: 8 }]}
          >
            Mark as Shipped
          </Button>
        </View>
      )}
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
  buyer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  details: {
    fontSize: 14,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusChip: {
    paddingHorizontal: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    marginTop: 8,
  },
});

export default OrderItem;