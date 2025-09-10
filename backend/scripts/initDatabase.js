const pool = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating database tables...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'seller')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Books table
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        seller_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        book_id UUID REFERENCES books(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Wishlist table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        book_id UUID REFERENCES books(id) ON DELETE CASCADE,
        price_when_added DECIMAL(10, 2),
        notify_on_price_drop BOOLEAN DEFAULT FALSE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);

    // Wishlist shares table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist_shares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        share_code VARCHAR(32) UNIQUE NOT NULL,
        title VARCHAR(255),
        description TEXT,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    // Insert sample data
    console.log('Inserting sample data...');

    // Insert sample users
    const sellerResult = await client.query(`
      INSERT INTO users (name, email, password_hash, role) 
      VALUES 
        ('Classic Books Store', 'seller1@example.com', '$2a$10$example1', 'seller'),
        ('Modern Literature Hub', 'seller2@example.com', '$2a$10$example2', 'seller')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name
    `);

    const buyerResult = await client.query(`
      INSERT INTO users (name, email, password_hash, role) 
      VALUES ('John Doe', 'buyer@example.com', '$2a$10$example3', 'buyer')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `);

    // Get seller IDs for books
    const sellers = await client.query(`
      SELECT id, name FROM users WHERE role = 'seller'
    `);

    if (sellers.rows.length > 0) {
      const seller1 = sellers.rows[0];
      const seller2 = sellers.rows.length > 1 ? sellers.rows[1] : sellers.rows[0];

      // Insert sample books
      await client.query(`
        INSERT INTO books (title, description, price, stock, image_url, seller_id, seller_name) 
        VALUES 
          ('The Great Gatsby', 'A classic American novel about the Jazz Age.', 15.99, 10, 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400', $1, $2),
          ('To Kill a Mockingbird', 'A gripping tale of racial injustice and childhood innocence.', 12.99, 5, 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400', $3, $4),
          ('1984', 'George Orwell''s dystopian masterpiece.', 13.99, 8, 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400', $1, $2)
        ON CONFLICT DO NOTHING
      `, [seller1.id, seller1.name, seller2.id, seller2.name]);
    }

    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run the initialization
createTables()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });
