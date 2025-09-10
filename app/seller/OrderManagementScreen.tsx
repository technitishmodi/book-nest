import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { Title, Text, Appbar, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <Appbar.Header style={styles.transparentHeader}>
          <Appbar.BackAction onPress={navigation.goBack} iconColor="#FFFFFF" />
          <Appbar.Content title="📋 Order Management" titleStyle={styles.headerTitle} />
        </Appbar.Header>
      </LinearGradient>

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
            style={styles.segmentedButtons}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
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
          <ScrollView 
            style={styles.ordersList}
            showsVerticalScrollIndicator={false}
          >
            {filteredOrders.map((order) => (
              <OrderItem
                key={order.id}
                order={order}
                onUpdateStatus={(status) => handleUpdateOrderStatus(order.id, status)}
                showActions={order.status === 'pending'}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerGradient: {
    paddingTop: 0,
  },
  transparentHeader: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  filterContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  segmentedButtons: {
    backgroundColor: '#F8F9FA',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default OrderManagementScreen;