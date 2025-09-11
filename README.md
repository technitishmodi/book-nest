# 📚 Book Nest

A modern, full-stack bookstore application built with React Native, Expo, and Node.js. Book Nest provides a seamless experience for both book sellers and buyers, featuring real-time inventory management, wishlist functionality, and secure user authentication.

## 🌟 Features

### 👤 **Dual User Roles**
- **Sellers**: Manage inventory, view sales analytics, process orders
- **Buyers**: Browse books, manage wishlist, place orders, track purchases

### 🛍️ **Core Functionality**
- 📖 **Book Management**: CRUD operations for book listings with images
- 🛒 **Shopping Cart**: Add/remove items, quantity management
- ❤️ **Wishlist**: Save favorite books with price drop notifications
- 📱 **Responsive Design**: Works seamlessly on mobile and web
- 🔐 **Secure Authentication**: JWT-based auth with role-based access
- 📊 **Analytics Dashboard**: Sales insights for sellers
- 🔄 **Real-time Updates**: Live inventory and order status updates

### 🔗 **Wishlist Sharing**
- Create shareable wishlist links
- Public/private wishlist options
- Expirable share codes
- Social sharing capabilities

## 🏗️ Tech Stack

### **Frontend**
- **React Native** `0.81.4` - Cross-platform mobile development
- **Expo SDK** `54` - Development platform and tools
- **Expo Router** `6.0` - File-based routing with TypeScript support
- **React Native Paper** `5.14` - Material Design components
- **React Native Reanimated** `4.1` - Smooth animations
- **TypeScript** - Type safety and better development experience

### **Backend**
- **Node.js** with **Express** `5.1` - RESTful API server
- **PostgreSQL** - Primary database for production
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing
- **CORS** & **Helmet** - Security middleware

### **Development Tools**
- **Expo CLI** - Development server and build tools
- **Metro Bundler** - JavaScript bundler
- **ESLint** - Code linting
- **Git** - Version control

## 📱 Screenshots

*(Add screenshots of your app here)*

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (for production) or SQLite (for development)
- **Expo Go** app on your mobile device
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/technitishmodi/book-nest.git
cd book-nest
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd backend
npm install
```

### 3. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/bookstore
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookstore
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Server
PORT=3000
NODE_ENV=development
```

### 4. Database Setup
```bash
cd backend
npm run init-db
```

### 5. Start the Development Servers

#### Start Backend Server
```bash
cd backend
npm start
# or for development with auto-restart
npm run dev
```

#### Start Frontend (in a new terminal)
```bash
npm run dev
```

### 6. Open the App
- **Mobile**: Scan the QR code with Expo Go app
- **Web**: Open `http://localhost:8081` in your browser

## 📁 Project Structure

```
book-nest/
├── 📱 app/                          # App screens and navigation
│   ├── _layout.tsx                  # Root layout
│   ├── index.tsx                    # Home screen
│   ├── auth.tsx                     # Authentication screen
│   ├── main.tsx                     # Main app screen
│   ├── buyer/                       # Buyer-specific screens
│   │   ├── StorefrontScreen.tsx
│   │   ├── ProductScreen.tsx
│   │   ├── CartScreen.tsx
│   │   ├── WishlistScreen.tsx
│   │   └── BuyerOrdersScreen.tsx
│   └── seller/                      # Seller-specific screens
│       ├── SalesDashboardScreen.tsx
│       ├── BookListingScreen.tsx
│       └── OrderManagementScreen.tsx
├── 🎨 components/                   # Reusable UI components
│   ├── BookCard.tsx
│   ├── CartItem.tsx
│   └── OrderItem.tsx
├── 🔧 contexts/                     # React Context providers
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── WishlistContext.tsx
├── 🔌 services/                     # API services
│   ├── api.ts
│   └── mockStorage.ts
├── 📦 types/                        # TypeScript type definitions
│   └── index.ts
├── 🖼️ assets/                       # Static assets
│   └── images/
├── ⚙️ backend/                      # Node.js backend
│   ├── server.js                    # Main server file
│   ├── config/                      # Database configuration
│   ├── middleware/                  # Express middleware
│   ├── routes/                      # API routes
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── orders.js
│   │   └── wishlist.js
│   └── scripts/                     # Database scripts
└── 📄 Configuration files
    ├── app.json                     # Expo configuration
    ├── babel.config.js              # Babel configuration
    ├── package.json                 # Dependencies
    └── tsconfig.json                # TypeScript configuration
```

## 🔧 Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start Expo development server
npm run build:web    # Build for web production
npm run lint         # Run ESLint
```

### Backend Scripts
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm run init-db      # Initialize database with sample data
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book (seller only)
- `PUT /api/books/:id` - Update book (seller only)
- `DELETE /api/books/:id` - Delete book (seller only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/buyer` - Get buyer's orders
- `GET /api/orders/seller` - Get seller's orders
- `PATCH /api/orders/:id/status` - Update order status

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add book to wishlist
- `DELETE /api/wishlist/:bookId` - Remove from wishlist
- `POST /api/wishlist/share` - Create shareable wishlist
- `GET /api/wishlist/shared/:shareCode` - Get shared wishlist

## 🔐 Authentication & Authorization

Book Nest uses JWT-based authentication with role-based access control:

- **Public Routes**: Book browsing, shared wishlists
- **Buyer Routes**: Cart, wishlist, orders, profile
- **Seller Routes**: Book management, sales dashboard, order processing
- **Protected APIs**: Require valid JWT token in Authorization header

## 📱 Platform Support

- ✅ **iOS** (via Expo Go or custom development build)
- ✅ **Android** (via Expo Go or custom development build)
- ✅ **Web** (responsive design)

## 🧪 Testing

The project includes test utilities and API testing:

```bash
# Backend API testing
cd backend
node test-api.js
```

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for web
npm run build:web

# Build for mobile (EAS Build)
npx eas build --platform all
```

### Backend Deployment
The backend can be deployed to platforms like:
- **Heroku**
- **Railway**
- **DigitalOcean**
- **AWS**
- **Vercel**

Ensure to set up environment variables on your chosen platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- ~~SDK 53/54 compatibility issues~~ ✅ **Fixed**
- ~~React Native Reanimated v4 worklets dependency~~ ✅ **Fixed**

## 🔮 Roadmap

- [ ] Push notifications for price drops
- [ ] Book reviews and ratings
- [ ] Advanced search and filtering
- [ ] Social features (follow sellers, share reviews)
- [ ] Payment integration
- [ ] Multi-language support
- [ ] Dark mode support

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/technitishmodi/book-nest/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing development platform
- [React Native Paper](https://reactnativepaper.com/) for beautiful UI components
- [PostgreSQL](https://www.postgresql.org/) for robust database support
- The React Native community for continuous support and contributions

---

**Made with ❤️ by [technitishmodi](https://github.com/technitishmodi)**

*Happy coding! 🚀*
