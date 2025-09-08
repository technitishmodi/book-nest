import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Appbar, Badge, ActivityIndicator, Text } from 'react-native-paper';
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
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const { getTotalItems } = useCart();
  const { logout } = useAuth();

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

  const loadBooks = async () => {
    try {
      setLoading(true);
      console.log('StorefrontScreen: Starting to load books...');
      const fetchedBooks = await booksAPI.getAll();
      console.log('StorefrontScreen: Fetched books:', fetchedBooks);
      setBooks(fetchedBooks);
      console.log('StorefrontScreen: Books state updated');
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (bookId: string) => {
    navigation.navigate('Product', { bookId });
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const renderBook = ({ item }: { item: Book }) => (
    <BookCard book={item} onPress={() => handleBookPress(item.id)} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="BookStore" />
        <Appbar.Action
          icon="cart"
          onPress={handleCartPress}
        />
        {getTotalItems() > 0 && (
          <Badge style={styles.badge}>{getTotalItems()}</Badge>
        )}
        <Appbar.Action 
          icon="clipboard-list" 
          onPress={() => navigation.navigate('Orders')} 
        />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>
      
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  listContainer: {
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 96, // Adjusted for the additional orders button
    backgroundColor: '#FF4444',
  },
});

export default StorefrontScreen;