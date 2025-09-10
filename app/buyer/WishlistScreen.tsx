import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Share,
  TouchableOpacity,
} from 'react-native';
import { Appbar, ActivityIndicator, FAB, Card, IconButton, Switch, Menu, Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BookCard from '../../components/BookCard';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { WishlistItem, BuyerStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList, 'Wishlist'>;

const WishlistScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [shareDialogVisible, setShareDialogVisible] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareDescription, setShareDescription] = useState('');
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    console.log('WishlistScreen: Component mounted');
    return () => {
      console.log('WishlistScreen: Component unmounted');
    };
  }, []);
  
  const { 
    wishlistItems, 
    loading, 
    removeFromWishlist, 
    togglePriceNotification,
    createWishlistShare,
    refreshWishlist,
    getTotalItems
  } = useWishlist();
  
  const { addToCart } = useCart();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWishlist();
    setRefreshing(false);
  };

  const handleBookPress = (bookId: string) => {
    navigation.navigate('Product', { bookId });
  };

  const handleRemoveFromWishlist = async (bookId: string, title: string) => {
    console.log('WishlistScreen: handleRemoveFromWishlist called with bookId:', bookId, 'title:', title);
    Alert.alert(
      'Remove from Wishlist',
      `Remove "${title}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            console.log('WishlistScreen: User confirmed removal, calling removeFromWishlist...');
            try {
              await removeFromWishlist(bookId);
              console.log('WishlistScreen: Book removed successfully');
              
              // Force refresh to ensure UI is updated
              setTimeout(() => {
                refreshWishlist();
              }, 100);
              
              Alert.alert('Success', `"${title}" removed from wishlist`);
            } catch (error) {
              console.error('WishlistScreen: Error removing from wishlist:', error);
              Alert.alert('Error', 'Failed to remove book from wishlist. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      await addToCart(item.book, 1);
      Alert.alert('Success', `"${item.book.title}" added to cart!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add book to cart');
    }
  };

  const handleToggleNotification = async (bookId: string, currentValue: boolean) => {
    try {
      await togglePriceNotification(bookId, !currentValue);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification setting');
    }
  };

  const handleCreateShare = async () => {
    if (!shareTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for your wishlist share');
      return;
    }

    try {
      const share = await createWishlistShare(shareTitle.trim(), shareDescription.trim());
      setShareDialogVisible(false);
      setShareTitle('');
      setShareDescription('');
      
      // Share the link
      const shareUrl = `https://booknest.app/wishlist/${share.shareCode}`;
      Share.share({
        message: `Check out my BookNest wishlist: "${share.title}"\n\n${shareUrl}`,
        url: shareUrl,
        title: share.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create wishlist share');
    }
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => {
    const priceDrop = parseFloat(item.book.price) < item.priceWhenAdded;
    
    return (
      <Card style={styles.wishlistCard} elevation={2}>
        <View style={styles.cardContent}>
          <View style={styles.compactBookCard}>
            <View style={styles.bookHeader}>
              <View style={styles.bookInfo}>
                <Text style={styles.compactBookTitle} numberOfLines={2}>{item.book.title}</Text>
                <Text style={styles.compactBookSeller} numberOfLines={1}>by {item.book.sellerName}</Text>
                <Text style={styles.compactBookPrice}>${item.book.price}</Text>
              </View>
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => handleBookPress(item.bookId)}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.itemActions}>
            {priceDrop && (
              <View style={styles.priceDrop}>
                <Text style={styles.priceDropText}>
                  💰 Price dropped from ${item.priceWhenAdded.toFixed(2)} to ${item.book.price}!
                </Text>
              </View>
            )}
            
            <View style={styles.actionRow}>
              <View style={styles.notificationRow}>
                <Text style={styles.notificationLabel}>Price alerts</Text>
                <Switch
                  value={item.notifyOnPriceDrop}
                  onValueChange={() => handleToggleNotification(item.bookId, item.notifyOnPriceDrop)}
                  color="#667eea"
                />
              </View>
              
              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  onPress={() => handleAddToCart(item)}
                  style={styles.addToCartButton}
                  labelStyle={styles.buttonLabel}
                >
                  Add to Cart
                </Button>
                
                <IconButton
                  icon="delete"
                  iconColor="#FF4757"
                  size={24}
                  onPress={() => handleRemoveFromWishlist(item.bookId, item.book.title)}
                />
              </View>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <StatusBar barStyle="light-content" />
        <Appbar.Header style={styles.transparentHeader}>
          <Appbar.BackAction onPress={navigation.goBack} iconColor="#FFFFFF" />
          <Appbar.Content title="💝 My Wishlist" titleStyle={styles.headerTitle} />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Appbar.Action
                icon="dots-vertical"
                iconColor="#FFFFFF"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                setShareDialogVisible(true);
              }}
              title="Share Wishlist"
              leadingIcon="share"
            />
          </Menu>
        </Appbar.Header>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            📚 {getTotalItems()} {getTotalItems() === 1 ? 'book' : 'books'} saved
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading your wishlist...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id}
        extraData={wishlistItems}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💝</Text>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtitle}>
              Save books you love for later by tapping the heart icon
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Storefront')}
              style={styles.browseButton}
            >
              Browse Books
            </Button>
          </View>
        }
      />

      <Portal>
        <Dialog visible={shareDialogVisible} onDismiss={() => setShareDialogVisible(false)}>
          <Dialog.Title>Share Your Wishlist</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={shareTitle}
              onChangeText={setShareTitle}
              style={styles.shareInput}
              placeholder="My Book Wishlist"
            />
            <TextInput
              label="Description (Optional)"
              value={shareDescription}
              onChangeText={setShareDescription}
              style={styles.shareInput}
              placeholder="Books I'd love to read..."
              multiline
              numberOfLines={3}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShareDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCreateShare}>Create & Share</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
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
    paddingBottom: 20,
  },
  wishlistCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
    flex: 1,
  },
  bookCard: {
    marginBottom: 16,
    flex: 1,
    maxWidth: '100%',
  },
  itemActions: {
    gap: 12,
  },
  priceDrop: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  priceDropText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  actionRow: {
    gap: 12,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  notificationLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addToCartButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#667eea',
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
  },
  shareInput: {
    marginBottom: 12,
  },
  compactBookCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookInfo: {
    flex: 1,
    marginRight: 12,
  },
  compactBookTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 24,
  },
  compactBookSeller: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  compactBookPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#667eea',
  },
  viewDetailsButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WishlistScreen;
