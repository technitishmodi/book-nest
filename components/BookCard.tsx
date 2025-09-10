import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Dimensions, Alert } from 'react-native';
import { Card, Title, Paragraph, Text, IconButton, Avatar, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Book } from '../types';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface BookCardProps {
  book: Book;
  onPress: () => void;
  style?: any;
}

const BookCard: React.FC<BookCardProps> = ({ book, onPress, style }: BookCardProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(book.id);
  const canUseWishlist = user?.role === 'buyer';

  const handleWishlistToggle = async () => {
    if (!canUseWishlist) {
      Alert.alert('Info', 'Only buyers can save books to wishlist');
      return;
    }

    setLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(book.id);
      } else {
        await addToWishlist(book.id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card style={[styles.card, style]} elevation={4}>
      {/* Header with seller info */}
      <View style={styles.header}>
        <View style={styles.sellerInfo}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>
              {book.sellerName.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>{book.sellerName}</Text>
            <Text style={styles.timestamp}>📚 Book Seller</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Chip 
            mode="flat" 
            compact
            style={[
              styles.stockChip,
              { backgroundColor: book.stock > 0 ? '#E8F5E8' : '#FFEBEE' }
            ]}
            textStyle={[
              styles.stockChipText,
              { color: book.stock > 0 ? '#2E7D32' : '#C62828' }
            ]}
          >
            {book.stock > 0 ? `${book.stock} left` : 'Sold out'}
          </Chip>
        </View>
      </View>

      {/* Book Image with overlay */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.95} style={styles.imageContainer}>
        <Image source={{ uri: book.imageUrl }} style={styles.bookImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        >
          <View style={styles.overlayContent}>
            <Text style={styles.overlayPrice}>${parseFloat(book.price).toFixed(2)}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Book Details */}
      <View style={styles.details}>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {book.title}
          </Text>
        </TouchableOpacity>
        <Text style={styles.description} numberOfLines={2}>
          {book.description || 'A fascinating read that will captivate your imagination...'}
        </Text>
        
        <View style={styles.actionRow}>
          {canUseWishlist && (
            <TouchableOpacity 
              style={[styles.likeButton, inWishlist && styles.likeButtonActive]} 
              onPress={handleWishlistToggle}
              disabled={loading}
            >
              <Text style={[styles.likeIcon, inWishlist && styles.likeIconActive]}>
                {inWishlist ? '💖' : '🤍'}
              </Text>
              <Text style={[styles.likeText, inWishlist && styles.likeTextActive]}>
                {inWishlist ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareIcon}>📤</Text>
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
          <View style={styles.spacer} />
          <TouchableOpacity onPress={onPress} style={styles.viewButton}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.viewButtonGradient}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sellerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  timestamp: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  stockChip: {
    borderRadius: 12,
  },
  stockChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookImage: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
  },
  overlayContent: {
    padding: 16,
  },
  overlayPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  details: {
    padding: 20,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 26,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  likeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  likeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  likeButtonActive: {
    backgroundColor: '#FFE8F0',
    borderWidth: 1,
    borderColor: '#FF69B4',
  },
  likeIconActive: {
    // No additional styles needed for active icon
  },
  likeTextActive: {
    color: '#FF1493',
    fontWeight: '700',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginLeft: 12,
  },
  shareIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  shareText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  spacer: {
    flex: 1,
  },
  viewButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  viewButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BookCard;