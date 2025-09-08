import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Title, Text, Appbar, ActivityIndicator, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OrderItem from '../../components/OrderItem';
import { useAuth } from '../../contexts/AuthContext';
import { ordersAPI } from '../../services/api';
import { Order, SellerStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<SellerStackParamList, 'SalesDashboard'>;

const SalesDashboardScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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

  const getTotalSales = () => {
    return orders
      .filter(order => order.status !== 'cancelled')
      .reduce((total, order) => total + parseFloat(order.totalAmount), 0);
  };

  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending').length;
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <OrderItem order={item} />
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Card style={styles.statCard}>
        <Card.Content style={styles.statContent}>
          <Text style={styles.statValue}>${getTotalSales().toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </Card.Content>
      </Card>
      
      <Card style={styles.statCard}>
        <Card.Content style={styles.statContent}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </Card.Content>
      </Card>
      
      <Card style={styles.statCard}>
        <Card.Content style={styles.statContent}>
          <Text style={styles.statValue}>{getPendingOrders()}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={navigation.goBack} />
        <Appbar.Content title="Sales Dashboard" />
        <Appbar.Action
          icon="clipboard-list"
          onPress={() => navigation.navigate('OrderManagement')}
        />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading sales data...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {renderStats()}
          
          <View style={styles.ordersSection}>
            <Title style={styles.sectionTitle}>Recent Orders</Title>
            
            {orders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No orders yet</Text>
                <Text style={styles.emptySubtext}>Orders will appear here once customers start purchasing your books.</Text>
              </View>
            ) : (
              <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  ordersSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 8,
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

export default SalesDashboardScreen;