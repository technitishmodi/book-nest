import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Title, Text, Appbar, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OrderItem from '../../components/OrderItem';
import { useAuth } from '../../contexts/AuthContext';
import { ordersAPI } from '../../services/api';
import { Order, SellerStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<SellerStackParamList, 'OrderManagement'>;

const OrderManagementScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped'>('all');
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const fetchedOrders = await ordersAPI.getBySeller();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getFilteredOrders = () => {
    switch (filter) {
      case 'pending':
        return orders.filter(order => order.status === 'pending');
      case 'shipped':
        return orders.filter(order => order.status === 'shipped');
      default:
        return orders;
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <OrderItem
      order={item}
      onUpdateStatus={(status) => handleUpdateOrderStatus(item.id, status)}
      showActions={item.status === 'pending'}
    />
  );

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={navigation.goBack} />
        <Appbar.Content title="Order Management" />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={filter}
            onValueChange={setFilter}
            buttons={[
              { value: 'all', label: `All (${orders.length})` },
              { value: 'pending', label: `Pending (${orders.filter(o => o.status === 'pending').length})` },
              { value: 'shipped', label: `Shipped (${orders.filter(o => o.status === 'shipped').length})` },
            ]}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'all' 
                ? 'No orders yet' 
                : `No ${filter} orders`}
            </Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'Orders will appear here once customers start purchasing your books.'
                : `${filter} orders will appear here.`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OrderManagementScreen;