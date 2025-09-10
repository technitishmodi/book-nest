import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WishlistItem, WishlistShare } from '../types';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistShares: WishlistShare[];
  loading: boolean;
  addToWishlist: (bookId: string, notifyOnPriceDrop?: boolean) => Promise<void>;
  removeFromWishlist: (bookId: string) => Promise<void>;
  isInWishlist: (bookId: string) => boolean;
  togglePriceNotification: (bookId: string, notify: boolean) => Promise<void>;
  createWishlistShare: (title: string, description?: string, isPublic?: boolean) => Promise<WishlistShare>;
  deleteWishlistShare: (shareCode: string) => Promise<void>;
  getSharedWishlist: (shareCode: string) => Promise<any>;
  refreshWishlist: () => Promise<void>;
  getTotalItems: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistShares, setWishlistShares] = useState<WishlistShare[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'buyer') {
      loadWishlist();
      loadWishlistShares();
    } else {
      // Clear wishlist when not authenticated or not a buyer
      setWishlistItems([]);
      setWishlistShares([]);
    }
  }, [isAuthenticated, user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const items = await wishlistAPI.getWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlistShares = async () => {
    try {
      const shares = await wishlistAPI.getWishlistShares();
      setWishlistShares(shares);
    } catch (error) {
      console.error('Error loading wishlist shares:', error);
      setWishlistShares([]);
    }
  };

  const addToWishlist = async (bookId: string, notifyOnPriceDrop = false): Promise<void> => {
    try {
      const response = await wishlistAPI.addToWishlist(bookId, notifyOnPriceDrop);
      
      // Refresh the wishlist to get the complete item with book details
      await loadWishlist();
      
      console.log('Book added to wishlist:', response.wishlistItem);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (bookId: string): Promise<void> => {
    try {
      console.log('WishlistContext: removeFromWishlist called with bookId:', bookId, 'type:', typeof bookId);
      console.log('WishlistContext: Current wishlist items:', wishlistItems.map(item => ({ id: item.bookId, type: typeof item.bookId })));
      
      await wishlistAPI.removeFromWishlist(bookId);
      
      // Remove from local state immediately for better UX
      const initialCount = wishlistItems.length;
      setWishlistItems(prev => {
        const filtered = prev.filter(item => item.bookId !== bookId);
        console.log('WishlistContext: Filtered items count:', filtered.length, 'from:', initialCount);
        return filtered;
      });
      
      console.log('Book removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Refresh on error to ensure consistency
      await loadWishlist();
      throw error;
    }
  };

  const isInWishlist = (bookId: string): boolean => {
    return wishlistItems.some(item => item.bookId === bookId);
  };

  const togglePriceNotification = async (bookId: string, notify: boolean): Promise<void> => {
    try {
      await wishlistAPI.updatePriceNotification(bookId, notify);
      
      // Update local state
      setWishlistItems(prev => 
        prev.map(item => 
          item.bookId === bookId 
            ? { ...item, notifyOnPriceDrop: notify }
            : item
        )
      );
      
      console.log('Price notification setting updated');
    } catch (error) {
      console.error('Error updating price notification:', error);
      throw error;
    }
  };

  const createWishlistShare = async (
    title: string, 
    description?: string, 
    isPublic = true
  ): Promise<WishlistShare> => {
    try {
      const response = await wishlistAPI.createWishlistShare(title, description, isPublic);
      
      // Add to local state
      setWishlistShares(prev => [response.share, ...prev]);
      
      console.log('Wishlist share created:', response.share);
      return response.share;
    } catch (error) {
      console.error('Error creating wishlist share:', error);
      throw error;
    }
  };

  const deleteWishlistShare = async (shareCode: string): Promise<void> => {
    try {
      await wishlistAPI.deleteWishlistShare(shareCode);
      
      // Remove from local state
      setWishlistShares(prev => prev.filter(share => share.shareCode !== shareCode));
      
      console.log('Wishlist share deleted');
    } catch (error) {
      console.error('Error deleting wishlist share:', error);
      throw error;
    }
  };

  const getSharedWishlist = async (shareCode: string) => {
    try {
      const sharedWishlist = await wishlistAPI.getSharedWishlist(shareCode);
      console.log('Shared wishlist loaded:', sharedWishlist);
      return sharedWishlist;
    } catch (error) {
      console.error('Error loading shared wishlist:', error);
      throw error;
    }
  };

  const refreshWishlist = async (): Promise<void> => {
    await loadWishlist();
    await loadWishlistShares();
  };

  const getTotalItems = (): number => {
    return wishlistItems.length;
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistShares,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      togglePriceNotification,
      createWishlistShare,
      deleteWishlistShare,
      getSharedWishlist,
      refreshWishlist,
      getTotalItems
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
