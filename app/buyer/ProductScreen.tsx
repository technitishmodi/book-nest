import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { Title, Text, Button, Appbar, ActivityIndicator, Snackbar, Card, Chip, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../../contexts/CartContext';
import { booksAPI } from '../../services/api';
import { Book, BuyerStackParamList } from '../../types';

const { width } = Dimensions.get('window');

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
    console.log('ProductScreen: Loading book with ID:', bookId);
    loadBook();
  }, [bookId]);

  const loadBook = async () => {
    try {
      setLoading(true);
      console.log('ProductScreen: Calling booksAPI.getById with:', bookId);
      const foundBook = await booksAPI.getById(bookId);
      console.log('ProductScreen: API returned:', foundBook);
      setBook(foundBook);
    } catch (error) {
      console.error('ProductScreen: Error loading book:', error);
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

  const handleBuyNow = () => {
    if (book) {
      addToCart(book, 1);
      navigation.navigate('Cart');
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
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={navigation.goBack} />
          <Appbar.Content title="Book Details" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Book not found</Text>
          <Text style={styles.errorSubtext}>
            The book you're looking for might have been removed or is temporarily unavailable.
          </Text>
          <Button
            mode="contained"
            onPress={navigation.goBack}
            style={styles.backButton}
            icon="arrow-left"
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={navigation.goBack} />
        <Appbar.Content title="Book Details" />
      </Appbar.Header>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: book.imageUrl }} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          >
            <View style={styles.imageOverlay}>
              <Chip
                icon="store"
                style={[
                  styles.stockChip,
                  { backgroundColor: book.stock > 0 ? '#4CAF50' : '#F44336' }
                ]}
                textStyle={{ color: 'white', fontWeight: '600' }}
              >
                {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
              </Chip>
            </View>
          </LinearGradient>
        </View>
        
        {/* Book Information Section */}
        <View style={styles.details}>
          {/* Title and Price */}
          <View style={styles.titleSection}>
            <Title style={styles.title}>{book.title}</Title>
            <Text style={styles.price}>${parseFloat(book.price.toString()).toFixed(2)}</Text>
          </View>
          
          {/* Seller Information */}
          <Card style={styles.sellerCard}>
            <Card.Content style={styles.sellerContent}>
              <View style={styles.sellerRow}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.sellerAvatar}
                >
                  <Text style={styles.sellerAvatarText}>
                    {book.sellerName.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerLabel}>Sold by</Text>
                  <Text style={styles.sellerName}>{book.sellerName}</Text>
                  <Text style={styles.sellerBadge}>⭐ Verified Seller</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />
          
          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About this book</Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>

          <Divider style={styles.divider} />

          {/* Book Details Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Book Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price:</Text>
              <Text style={styles.detailValue}>${parseFloat(book.price.toString()).toFixed(2)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Availability:</Text>
              <Text style={[
                styles.detailValue,
                { color: book.stock > 0 ? '#4CAF50' : '#F44336' }
              ]}>
                {book.stock > 0 ? `${book.stock} copies available` : 'Currently out of stock'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Seller:</Text>
              <Text style={styles.detailValue}>{book.sellerName}</Text>
            </View>

            {book.createdAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Listed:</Text>
                <Text style={styles.detailValue}>
                  {new Date(book.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />
          
          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <View style={styles.primaryActions}>
              <TouchableOpacity
                onPress={handleBuyNow}
                disabled={book.stock === 0}
                style={[
                  styles.buyNowButton,
                  { opacity: book.stock > 0 ? 1 : 0.5 }
                ]}
              >
                <LinearGradient
                  colors={book.stock > 0 ? ['#FF6B6B', '#FF5722'] : ['#BDBDBD', '#9E9E9E']}
                  style={styles.buyNowGradient}
                >
                  <Text style={styles.buyNowText}>⚡ {book.stock > 0 ? 'Buy Now' : 'Out of Stock'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleAddToCart}
                disabled={book.stock === 0}
                style={[
                  styles.addToCartButton,
                  { opacity: book.stock > 0 ? 1 : 0.5 }
                ]}
              >
                <LinearGradient
                  colors={book.stock > 0 ? ['#667eea', '#764ba2'] : ['#BDBDBD', '#9E9E9E']}
                  style={styles.addToCartGradient}
                >
                  <Text style={styles.addToCartText}>🛒 Add to Cart</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Cart')}
              style={styles.viewCartButton}
            >
              <Text style={styles.viewCartText}>👀 View Cart</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  backButton: {
    paddingVertical: 8,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  stockChip: {
    borderRadius: 20,
    elevation: 4,
  },
  details: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
    color: '#1A1A1A',
    lineHeight: 32,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  sellerCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    elevation: 3,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sellerContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sellerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sellerBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#E0E0E0',
  },
  descriptionSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    textAlign: 'justify',
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  actionSection: {
    marginTop: 8,
  },
  primaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  buyNowButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
  },
  buyNowGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addToCartButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
  },
  addToCartGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewCartButton: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
  },
  viewCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
});

export default ProductScreen;