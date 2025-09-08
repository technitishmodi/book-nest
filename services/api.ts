import axios from 'axios';
import { Platform } from 'react-native';
import { Book, Order } from '../types';

// Determine the correct API base URL based on platform
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }
  
  // For mobile devices, use your computer's IP address
  // You can get this IP from the Expo CLI output when you run `npm run dev`
  return 'http://192.168.55.217:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token (will be implemented with proper auth later)
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add auth token when authentication is implemented
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only log auth errors for protected endpoints, not login attempts
      if (!error.config?.url?.includes('/auth/login')) {
        console.log('Authentication error - token expired or invalid');
      }
    }
    return Promise.reject(error);
  }
);

// Books API
export const booksAPI = {
  getAll: async (): Promise<Book[]> => {
    console.log('booksAPI.getAll: called');
    try {
      const response = await apiClient.get('/books');
      console.log('booksAPI.getAll: returning books:', response.data);
      return response.data;
    } catch (error) {
      console.error('booksAPI.getAll: error:', error);
      // Fallback to empty array if API fails
      return [];
    }
  },

  getBySeller: async (sellerId: string): Promise<Book[]> => {
    console.log('booksAPI.getBySeller: called with sellerId:', sellerId);
    try {
      const response = await apiClient.get(`/books/seller/${sellerId}`);
      console.log('booksAPI.getBySeller: returning books:', response.data);
      return response.data;
    } catch (error) {
      console.error('booksAPI.getBySeller: error:', error);
      return [];
    }
  },

  getById: async (bookId: string): Promise<Book | null> => {
    console.log('booksAPI.getById: called with bookId:', bookId);
    try {
      const response = await apiClient.get(`/books/${bookId}`);
      console.log('booksAPI.getById: returning book:', response.data);
      return response.data;
    } catch (error) {
      console.error('booksAPI.getById: error:', error);
      return null;
    }
  },

  create: async (bookData: Partial<Book>): Promise<Book> => {
    console.log('booksAPI.create: called with bookData:', bookData);
    try {
      const response = await apiClient.post('/books', bookData);
      console.log('booksAPI.create: returning new book:', response.data.book);
      return response.data.book;
    } catch (error) {
      console.error('booksAPI.create: error:', error);
      throw error;
    }
  },

  update: async (bookId: string, bookData: Partial<Book>): Promise<Book> => {
    console.log('booksAPI.update: called with bookId:', bookId, 'bookData:', bookData);
    try {
      const response = await apiClient.put(`/books/${bookId}`, bookData);
      console.log('booksAPI.update: returning updated book:', response.data.book);
      return response.data.book;
    } catch (error) {
      console.error('booksAPI.update: error:', error);
      throw error;
    }
  },

  delete: async (bookId: string): Promise<void> => {
    console.log('booksAPI.delete: called with bookId:', bookId);
    try {
      await apiClient.delete(`/books/${bookId}`);
      console.log('booksAPI.delete: book deleted successfully');
    } catch (error) {
      console.error('booksAPI.delete: error:', error);
      throw error;
    }
  },
};

// Orders API
export const ordersAPI = {
  create: async (items: { bookId: string; quantity: number }[]): Promise<any> => {
    console.log('ordersAPI.create: called with items:', items);
    try {
      const response = await apiClient.post('/orders', { items });
      console.log('ordersAPI.create: returning orders:', response.data);
      return response.data;
    } catch (error) {
      console.error('ordersAPI.create: error:', error);
      throw error;
    }
  },

  getBySeller: async (): Promise<Order[]> => {
    console.log('ordersAPI.getBySeller: called');
    try {
      const response = await apiClient.get('/orders/seller');
      console.log('ordersAPI.getBySeller: returning orders:', response.data);
      return response.data;
    } catch (error) {
      console.error('ordersAPI.getBySeller: error:', error);
      return [];
    }
  },

  getByBuyer: async (): Promise<Order[]> => {
    console.log('ordersAPI.getByBuyer: called');
    try {
      const response = await apiClient.get('/orders/buyer');
      console.log('ordersAPI.getByBuyer: returning orders:', response.data);
      return response.data;
    } catch (error) {
      console.error('ordersAPI.getByBuyer: error:', error);
      return [];
    }
  },

  updateStatus: async (orderId: string, status: Order['status']): Promise<Order> => {
    console.log('ordersAPI.updateStatus: called with orderId:', orderId, 'status:', status);
    try {
      const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
      console.log('ordersAPI.updateStatus: returning updated order:', response.data.order);
      return response.data.order;
    } catch (error) {
      console.error('ordersAPI.updateStatus: error:', error);
      throw error;
    }
  },
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<any> => {
    console.log('authAPI.login: called with email:', email);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      console.log('authAPI.login: login successful');
      return response.data;
    } catch (error) {
      console.error('authAPI.login: error:', error);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, role: 'buyer' | 'seller'): Promise<any> => {
    console.log('authAPI.register: called with email:', email, 'role:', role);
    try {
      const response = await apiClient.post('/auth/register', { name, email, password, role });
      console.log('authAPI.register: registration successful');
      return response.data;
    } catch (error) {
      console.error('authAPI.register: error:', error);
      throw error;
    }
  },

  getProfile: async (): Promise<any> => {
    console.log('authAPI.getProfile: called');
    try {
      const response = await apiClient.get('/auth/profile');
      console.log('authAPI.getProfile: returning profile:', response.data);
      return response.data;
    } catch (error) {
      console.error('authAPI.getProfile: error:', error);
      throw error;
    }
  },
};

export default apiClient;