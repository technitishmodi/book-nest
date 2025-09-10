import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Alert, TouchableOpacity, Image } from 'react-native';
import { Title, Text, TextInput, Button, Appbar, Card, ActivityIndicator, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { booksAPI } from '../../services/api';
import { Book, SellerStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<SellerStackParamList, 'BookListing'>;

const BookListingScreen: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
  });
  
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('BookListingScreen: Logout button pressed');
      await logout();
      console.log('BookListingScreen: Logout completed');
    } catch (error) {
      console.error('BookListingScreen: Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user]);

  const loadBooks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const fetchedBooks = await booksAPI.getBySeller(user.id);
      setBooks(fetchedBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    // Validate form
    if (!formData.title || !formData.description || !formData.price || !formData.stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity');
      return;
    }

    try {
      setSubmitting(true);
      const newBook = await booksAPI.create({
        title: formData.title,
        description: formData.description,
        price: price.toString(),
        stock: stock,
        imageUrl: formData.imageUrl || 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
      });

      setBooks(prevBooks => [newBook, ...prevBooks]);
      setFormData({ title: '', description: '', price: '', stock: '', imageUrl: '' });
      setShowForm(false);
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error creating book:', error);
      Alert.alert('Error', 'Failed to create book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderBook = ({ item }: { item: Book }) => (
    <Card style={styles.bookCard} elevation={3}>
      <View style={styles.bookContainer}>
        <View style={styles.bookImageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.bookImage} />
        </View>
        <View style={styles.bookContent}>
          <Title numberOfLines={2} style={styles.bookTitle}>{item.title}</Title>
          <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
          <View style={styles.stockRow}>
            <Text style={styles.stockLabel}>Stock:</Text>
            <View style={[
              styles.stockBadge,
              { backgroundColor: item.stock > 0 ? '#E8F5E8' : '#FFEBEE' }
            ]}>
              <Text style={[
                styles.stockText,
                { color: item.stock > 0 ? '#2E7D32' : '#C62828' }
              ]}>
                {item.stock} {item.stock === 1 ? 'copy' : 'copies'}
              </Text>
            </View>
          </View>
          <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <Appbar.Header style={styles.transparentHeader}>
          <Appbar.Content title="📚 My Books" titleStyle={styles.headerTitle} />
          <Appbar.Action
            icon="chart-line"
            iconColor="#FFFFFF"
            onPress={() => navigation.navigate('SalesDashboard')}
          />
          <Appbar.Action
            icon="clipboard-list"
            iconColor="#FFFFFF"
            onPress={() => navigation.navigate('OrderManagement')}
          />
          <Appbar.Action icon="logout" iconColor="#FFFFFF" onPress={handleLogout} />
        </Appbar.Header>
      </LinearGradient>

      {showForm ? (
        <ScrollView style={styles.form}>
          <Card style={styles.formCard}>
            <Card.Content>
              <Title>Add New Book</Title>
              
              <TextInput
                label="Book Title *"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Description *"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Price *"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="decimal-pad"
                style={styles.input}
                mode="outlined"
                left={<TextInput.Affix text="$" />}
              />
              
              <TextInput
                label="Stock Quantity *"
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                keyboardType="number-pad"
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Image URL (optional)"
                value={formData.imageUrl}
                onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                style={styles.input}
                mode="outlined"
                placeholder="https://example.com/image.jpg"
              />
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={() => setShowForm(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={submitting}
                  style={[
                    styles.submitButton,
                    { opacity: submitting ? 0.7 : 1 }
                  ]}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>
                      {submitting ? '⏳ Adding...' : '✨ Add Book'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.header}>
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>{books.length}</Text>
              <Text style={styles.statsLabel}>Books Listed</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              style={styles.addButton}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.addButtonGradient}
              >
                <Text style={styles.addButtonText}>+ Add Book</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Loading your books...</Text>
            </View>
          ) : books.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No books listed yet</Text>
              <Text style={styles.emptySubtext}>Add your first book to get started!</Text>
            </View>
          ) : (
            <FlatList
              data={books}
              renderItem={renderBook}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        Book added successfully!
      </Snackbar>
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
  form: {
    flex: 1,
    padding: 20,
  },
  formCard: {
    elevation: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 0.45,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  submitButton: {
    flex: 0.45,
    borderRadius: 25,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 2,
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
  },
  addButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  addButtonText: {
    fontSize: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  bookCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bookContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  bookImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  bookImage: {
    width: 80,
    height: 100,
    resizeMode: 'cover',
  },
  bookContent: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 24,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default BookListingScreen;