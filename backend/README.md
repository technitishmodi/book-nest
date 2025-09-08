# Bookstore Backend API

A Node.js Express backend for the React Native bookstore application using PostgreSQL (Neon) database.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and update with your database credentials:
```bash
cp .env.example .env
```

Update the `.env` file with your Neon PostgreSQL connection string:
```
DATABASE_URL=postgresql://neondb_owner:npg_sUZ40vCMhrdt@ep-morning-dream-adl1775i-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (requires auth)

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get single book
- `GET /api/books/seller/:sellerId` - Get books by seller
- `POST /api/books` - Create new book (sellers only)
- `PUT /api/books/:id` - Update book (sellers only, own books)
- `DELETE /api/books/:id` - Delete book (sellers only, own books)

### Orders
- `POST /api/orders` - Create new order (buyers only)
- `GET /api/orders/seller` - Get orders for seller (sellers only)
- `GET /api/orders/buyer` - Get orders for buyer (buyers only)
- `PATCH /api/orders/:id/status` - Update order status (sellers only)

### Health Check
- `GET /health` - Server health status

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `role` (ENUM: 'buyer', 'seller')
- `created_at`, `updated_at` (TIMESTAMP)

### Books Table
- `id` (UUID, Primary Key)
- `title` (VARCHAR)
- `description` (TEXT)
- `price` (DECIMAL)
- `stock` (INTEGER)
- `image_url` (TEXT)
- `seller_id` (UUID, Foreign Key)
- `seller_name` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

### Orders Table
- `id` (UUID, Primary Key)
- `buyer_id` (UUID, Foreign Key)
- `seller_id` (UUID, Foreign Key)
- `total_amount` (DECIMAL)
- `status` (ENUM: 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
- `created_at`, `updated_at` (TIMESTAMP)

### Order Items Table
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key)
- `book_id` (UUID, Foreign Key)
- `quantity` (INTEGER)
- `price` (DECIMAL)
- `created_at` (TIMESTAMP)

## Sample Data

The database initialization script creates sample users and books for testing:

**Sample Users:**
- Seller 1: `seller1@example.com`
- Seller 2: `seller2@example.com`
- Buyer: `buyer@example.com`

**Sample Books:**
- The Great Gatsby ($15.99)
- To Kill a Mockingbird ($12.99)
- 1984 ($13.99)

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention with parameterized queries
