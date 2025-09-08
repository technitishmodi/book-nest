export interface Book {
  id: string;
  title: string;
  description: string;
  price: string; // API returns price as string
  stock: number;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  createdAt?: string;
}

export interface CartItem extends Book {
  quantity: number;
}

export interface OrderItem {
  id: string;
  bookId: string;
  title: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  buyerId?: string;
  buyerName?: string;
  sellerId?: string;
  sellerName?: string;
  totalAmount: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type TabParamList = {
  BuyerTab: undefined;
  SellerTab: undefined;
};

export type BuyerStackParamList = {
  Storefront: undefined;
  Product: { bookId: string };
  Cart: undefined;
  Orders: undefined;
};

export type SellerStackParamList = {
  BookListing: undefined;
  SalesDashboard: undefined;
  OrderManagement: undefined;
};