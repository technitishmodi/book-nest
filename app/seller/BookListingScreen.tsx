import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Alert } from 'react-native';
import { Title, Text, TextInput, Button, Appbar, Card, ActivityIndicator, Snackbar } from 'react-native-paper';
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
    <Card style={styles.bookCard}>
      <Card.Content>
        <Title numberOfLines={2}>{item.title}</Title>
        <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
        <Text>Stock: {item.stock}</Text>
        <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="My Books" />
        <Appbar.Action
          icon="chart-line"
          onPress={() => navigation.navigate('SalesDashboard')}
        />
        <Appbar.Action
          icon="clipboard-list"
          onPress={() => navigation.navigate('OrderManagement')}
        />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>

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
                <Button
                  mode="outlined"
                  onPress={() => setShowForm(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={submitting}
                  style={styles.submitButton}
                >
                  Add Book
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.header}>
            <Title>Your Books ({books.length})</Title>
            <Button
              mode="contained"
              onPress={() => setShowForm(true)}
              icon="plus"
              style={styles.addButton}
            >
              Add Book
            </Button>
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
    backgroundColor: '#F5F5F5',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    elevation: 4,
  },
  input: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 0.45,
  },
  submitButton: {
    flex: 0.45,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    borderRadius: 8,
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
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  bookCard: {
    marginBottom: 12,
    elevation: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginVertical: 4,
  },
  description: {
    color: '#666',
    marginTop: 8,
  },
});

export default BookListingScreen;