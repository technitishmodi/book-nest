import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { Title, Text, Appbar, ActivityIndicator, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.salesCard}
      >
        <Text style={styles.salesIcon}>💰</Text>
        <Text style={styles.salesValue}>${getTotalSales().toFixed(2)}</Text>
        <Text style={styles.salesLabel}>Total Sales</Text>
      </LinearGradient>
      
      <View style={styles.statsRow}>
        <Card style={styles.statCard} elevation={3}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard} elevation={3}>
          <Card.Content style={styles.statContent}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statValue}>{getPendingOrders()}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <Appbar.Header style={styles.transparentHeader}>
          <Appbar.BackAction onPress={navigation.goBack} iconColor="#FFFFFF" />
          <Appbar.Content title="📊 Sales Dashboard" titleStyle={styles.headerTitle} />
          <Appbar.Action
            icon="clipboard-list"
            iconColor="#FFFFFF"
            onPress={() => navigation.navigate('OrderManagement')}
          />
        </Appbar.Header>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading sales data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStats()}
          
          <View style={styles.ordersSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 Recent Orders</Text>
              <Text style={styles.sectionSubtitle}>
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
              </Text>
            </View>
            
            {orders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyText}>No orders yet</Text>
                <Text style={styles.emptySubtext}>Orders will appear here once customers start purchasing your books.</Text>
              </View>
            ) : (
              <View>
                {orders.map((order) => (
                  <OrderItem key={order.id} order={order} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
    padding: 20,
  },
  salesCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
  },
  salesIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  salesValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  salesLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ordersSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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

export default SalesDashboardScreen;