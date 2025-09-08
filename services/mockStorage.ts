import { Book, Order } from '../types';

// In-memory storage for testing
class MockStorage {
  private books: Book[] = [
    {
      id: '1',
      title: 'The Great Gatsby',
      description: 'A classic American novel about the Jazz Age.',
      price: 15.99,
      stock: 10,
      imageUrl: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
      sellerId: 'seller1',
      sellerName: 'Classic Books Store',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'To Kill a Mockingbird',
      description: 'A gripping tale of racial injustice and childhood innocence.',
      price: 12.99,
      stock: 5,
      imageUrl: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
      sellerId: 'seller2',
      sellerName: 'Modern Literature Hub',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: '1984',
      description: 'George Orwell\'s dystopian masterpiece.',
      price: 13.99,
      stock: 8,
      imageUrl: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
      sellerId: 'seller1',
      sellerName: 'Classic Books Store',
      createdAt: new Date().toISOString(),
    },
  ];

  private orders: Order[] = [
    {
      id: '1',
      bookId: '1',
      bookTitle: 'The Great Gatsby',
      bookImage: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
      buyerId: 'buyer1',
      buyerName: 'John Doe',
      sellerId: 'seller1',
      quantity: 1,
      price: 15.99,
      totalAmount: 15.99,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    },
  ];

  // Books methods
  getAllBooks(): Book[] {
    console.log('MockStorage: getAllBooks called, returning:', this.books);
    return [...this.books];
  }

  getBooksBySeller(sellerId: string): Book[] {
    const sellerBooks = this.books.filter(book => book.sellerId === sellerId);
    console.log(`MockStorage: getBooksBySeller(${sellerId}) returning:`, sellerBooks);
    return sellerBooks;
  }

  addBook(bookData: Partial<Book>): Book {
    const newBook: Book = {
      id: Date.now().toString(),
      title: bookData.title || '',
      description: bookData.description || '',
      price: bookData.price || 0,
      stock: bookData.stock || 0,
      imageUrl: bookData.imageUrl || '',
      sellerId: bookData.sellerId || '',
      sellerName: bookData.sellerName || '',
      createdAt: new Date().toISOString(),
    };
    this.books.unshift(newBook); // Add to beginning
    console.log('MockStorage: addBook, new book added:', newBook);
    console.log('MockStorage: total books now:', this.books.length);
    return newBook;
  }

  // Orders methods
  getOrdersBySeller(sellerId: string): Order[] {
    const sellerOrders = this.orders.filter(order => order.sellerId === sellerId);
    console.log(`MockStorage: getOrdersBySeller(${sellerId}) returning:`, sellerOrders);
    return sellerOrders;
  }

  addOrder(orderData: Partial<Order>): Order {
    const newOrder: Order = {
      id: Date.now().toString(),
      bookId: orderData.bookId || '',
      bookTitle: orderData.bookTitle || '',
      bookImage: orderData.bookImage || '',
      buyerId: orderData.buyerId || '',
      buyerName: orderData.buyerName || '',
      sellerId: orderData.sellerId || '',
      quantity: orderData.quantity || 1,
      price: orderData.price || 0,
      totalAmount: orderData.totalAmount || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(newOrder); // Add to beginning
    console.log('MockStorage: addOrder, new order added:', newOrder);
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status']): Order | null {
    const orderIndex = this.orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
      this.orders[orderIndex] = { ...this.orders[orderIndex], status };
      console.log('MockStorage: updateOrderStatus, updated order:', this.orders[orderIndex]);
      return this.orders[orderIndex];
    }
    return null;
  }
}

// Create a singleton instance
export const mockStorage = new MockStorage();
