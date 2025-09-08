import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { Title, Text, Button, Appbar, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../../contexts/CartContext';
import { booksAPI } from '../../services/api';
import { Book, BuyerStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList, 'Product'>;
type RouteProp_ = RouteProp<BuyerStackParamList, 'Product'>;

const ProductScreen: React.FC = () => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp_>();
  const { addToCart } = useCart();
  const { bookId } = route.params;

  useEffect(() => {
    loadBook();
  }, [bookId]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const foundBook = await booksAPI.getById(bookId);
      setBook(foundBook);
    } catch (error) {
      console.error('Error loading book:', error);
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (book) {
      addToCart(book, 1);
      setShowSnackbar(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={navigation.goBack} />
        <Appbar.Content title="Book Details" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Image source={{ uri: book.imageUrl }} style={styles.image} />
        
        <View style={styles.details}>
          <Title style={styles.title}>{book.title}</Title>
          <Text style={styles.seller}>by {book.sellerName}</Text>
          <Text style={styles.price}>${parseFloat(book.price.toString()).toFixed(2)}</Text>
          
          <View style={styles.stockContainer}>
            <Text style={styles.stock}>
              {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
            </Text>
          </View>
          
          <Text style={styles.description}>{book.description}</Text>
          
          <Button
            mode="contained"
            onPress={handleAddToCart}
            style={styles.addButton}
            disabled={book.stock === 0}
            contentStyle={styles.buttonContent}
          >
            {book.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={2000}
        action={{
          label: 'View Cart',
          onPress: () => navigation.navigate('Cart'),
        }}
      >
        Added to cart!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  details: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  seller: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  stockContainer: {
    marginBottom: 16,
  },
  stock: {
    fontSize: 14,
    color: '#4CAF50',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    color: '#333',
  },
  addButton: {
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default ProductScreen;