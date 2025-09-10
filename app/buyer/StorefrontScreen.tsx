import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Alert, RefreshControl, StatusBar } from 'react-native';
import { Appbar, Badge, ActivityIndicator, Text, Searchbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BookCard from '../../components/BookCard';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { booksAPI } from '../../services/api';
import { Book, BuyerStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList, 'Storefront'>;

const StorefrontScreen: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<NavigationProp>();
  const { getTotalItems } = useCart();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('StorefrontScreen: Logout button pressed');
      await logout();
      console.log('StorefrontScreen: Logout completed');
    } catch (error) {
      console.error('StorefrontScreen: Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchBooks = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        console.log('StorefrontScreen: Starting to load books...');
        const fetchedBooks = await booksAPI.getAll();
        
        if (!isMounted) return;
        
        console.log('StorefrontScreen: Fetched books:', fetchedBooks);
        setBooks(fetchedBooks);
        setFilteredBooks(fetchedBooks);
        console.log('StorefrontScreen: Books state updated');
      } catch (error) {
        if (isMounted) {
          console.error('Error loading books:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  // Add focus listener to refresh books when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('StorefrontScreen: Screen focused, refreshing books...');
      loadBooks();
    });

    return unsubscribe;
  }, [navigation]);

  const loadBooks = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log('StorefrontScreen: Starting to load books...');
      const fetchedBooks = await booksAPI.getAll();
      console.log('StorefrontScreen: Fetched books:', fetchedBooks);
      setBooks(fetchedBooks);
      setFilteredBooks(fetchedBooks);
      console.log('StorefrontScreen: Books state updated');
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    loadBooks(true);
  };

  const handleBookPress = (bookId: string) => {
    console.log('StorefrontScreen: Navigating to book with ID:', bookId, 'type:', typeof bookId);
    navigation.navigate('Product', { bookId });
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.description?.toLowerCase().includes(query.toLowerCase()) ||
        book.sellerName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  };

  const renderBook = ({ item }: { item: Book }) => (
    <BookCard book={item} onPress={() => handleBookPress(item.id)} />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.appTitle}>📚 BookNest</Text>
            </View>
            <View style={styles.headerActions}>
              <View style={styles.cartContainer}>
                <Appbar.Action
                  icon="cart"
                  iconColor="#FFFFFF"
                  onPress={handleCartPress}
                />
                {getTotalItems() > 0 && (
                  <Badge style={styles.badge}>{getTotalItems()}</Badge>
                )}
              </View>
              <Appbar.Action 
                icon="clipboard-list" 
                iconColor="#FFFFFF"
                onPress={() => navigation.navigate('Orders')} 
              />
              <Appbar.Action 
                icon="logout" 
                iconColor="#FFFFFF"
                onPress={handleLogout} 
              />
            </View>
          </View>
          <Searchbar
            placeholder="Search books, authors, sellers..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#667eea"
          />
        </View>
      </LinearGradient>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          📖 {filteredBooks.length} books available
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading books...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredBooks}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={1}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
            progressBackgroundColor="#FFFFFF"
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No books found' : 'No books available'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? `Try searching for something else` 
                  : 'Check back later for new arrivals!'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    marginBottom: 8,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF4757',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    fontSize: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  feedContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default StorefrontScreen;