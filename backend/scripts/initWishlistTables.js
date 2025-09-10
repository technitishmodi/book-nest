const pool = require('../config/database');

async function initWishlistTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Creating wishlist tables...');

    // Create wishlist table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        book_id VARCHAR(255) NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        price_when_added DECIMAL(10, 2) NOT NULL,
        notify_on_price_drop BOOLEAN DEFAULT FALSE,
        UNIQUE(user_id, book_id),
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      );
    `);

    // Create wishlist_shares table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist_shares (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        share_code VARCHAR(32) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlist_book_id ON wishlist(book_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlist_shares_code ON wishlist_shares(share_code);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wishlist_shares_user ON wishlist_shares(user_id);
    `);

    console.log('✅ Wishlist tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating wishlist tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  initWishlistTables()
    .then(() => {
      console.log('🎉 Wishlist database initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to initialize wishlist database:', error);
      process.exit(1);
    });
}

module.exports = initWishlistTables;
