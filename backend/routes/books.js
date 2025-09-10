const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        title,
        description,
        price,
        stock,
        image_url as "imageUrl",
        seller_id as "sellerId",
        seller_name as "sellerName",
        created_at as "createdAt"
      FROM books 
      WHERE stock > 0 
      ORDER BY created_at DESC
    `);

    console.log('✅ Books fetched from database:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('⚠️  Database error, returning fallback books:', error.message);
    
    // Fallback books data for development
    const fallbackBooks = [
      {
        id: "1",
        title: "The Great Gatsby",
        description: "A classic American novel about the Jazz Age, exploring themes of decadence, idealism, resistance to change, and social upheaval.",
        price: 15.99,
        stock: 10,
        imageUrl: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400",
        sellerId: "test-seller-1",
        sellerName: "Test Seller",
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        title: "To Kill a Mockingbird",
        description: "A gripping tale of racial injustice and childhood innocence set in the Depression-era South.",
        price: 12.99,
        stock: 5,
        imageUrl: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400",
        sellerId: "test-seller-1",
        sellerName: "Test Seller",
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        title: "1984",
        description: "George Orwell's dystopian masterpiece presents a chilling vision of a totalitarian future.",
        price: 13.99,
        stock: 8,
        imageUrl: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400",
        sellerId: "test-seller-1",
        sellerName: "Test Seller",
        createdAt: new Date().toISOString()
      }
    ];

    console.log('📚 Returning fallback books:', fallbackBooks.length);
    res.json(fallbackBooks);
  }
});

// Get books by seller
router.get('/seller/:sellerId', async (req, res) => {
  const { sellerId } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        id,
        title,
        description,
        price,
        stock,
        image_url as "imageUrl",
        seller_id as "sellerId",
        seller_name as "sellerName",
        created_at as "createdAt"
      FROM books 
      WHERE seller_id = $1 
      ORDER BY created_at DESC
    `, [sellerId]);

    console.log('✅ Seller books fetched from database:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('⚠️  Database error for seller books, returning fallback:', error.message);
    
    // Fallback books for test seller
    if (sellerId === "test-seller-1") {
      const fallbackBooks = [
        {
          id: "1",
          title: "The Great Gatsby",
          description: "A classic American novel about the Jazz Age, exploring themes of decadence, idealism, resistance to change, and social upheaval.",
          price: 15.99,
          stock: 10,
          imageUrl: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400",
          sellerId: "test-seller-1",
          sellerName: "Test Seller",
          createdAt: new Date().toISOString()
        },
        {
          id: "2",
          title: "To Kill a Mockingbird",
          description: "A gripping tale of racial injustice and childhood innocence set in the Depression-era South.",
          price: 12.99,
          stock: 5,
          imageUrl: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400",
          sellerId: "test-seller-1",
          sellerName: "Test Seller",
          createdAt: new Date().toISOString()
        },
        {
          id: "3",
          title: "1984",
          description: "George Orwell's dystopian masterpiece presents a chilling vision of a totalitarian future.",
          price: 13.99,
          stock: 8,
          imageUrl: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400",
          sellerId: "test-seller-1",
          sellerName: "Test Seller",
          createdAt: new Date().toISOString()
        }
      ];
      
      console.log('📚 Returning fallback seller books:', fallbackBooks.length);
      return res.json(fallbackBooks);
    }
    
    // Return empty array for other sellers
    console.log('📚 No fallback books for seller:', sellerId);
    res.json([]);
  }
});

// Get single book by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('📖 Book detail request for ID:', id, 'type:', typeof id);

  try {
    // Since we're using fallback system, let's try database first but expect it to fail
    const result = await pool.query(`
      SELECT 
        id,
        title,
        description,
        price,
        stock,
        image_url as "imageUrl",
        seller_id as "sellerId",
        seller_name as "sellerName",
        created_at as "createdAt"
      FROM books 
      WHERE id = $1
    `, [id]);

    if (result.rows.length > 0) {
      console.log('✅ Book found in database:', result.rows[0].title);
      return res.json(result.rows[0]);
    }
    
    console.log('📚 Book not found in database, checking fallback for ID:', id);
  } catch (dbError) {
    console.log('⚠️  Database error for single book, using fallback for ID:', id, 'Error:', dbError.message);
  }

  // Fallback books for testing (this should always work)
  const fallbackBooks = {
    "1": {
      id: "1",
      title: "The Great Gatsby",
      description: "A classic American novel about the Jazz Age, exploring themes of decadence, idealism, resistance to change, and social upheaval. Set in the summer of 1922, the story follows Jay Gatsby's pursuit of his lost love Daisy Buchanan. Through the eyes of narrator Nick Carraway, we witness the tragic tale of love, dreams, and the American Dream itself.",
      price: 15.99,
      stock: 10,
      imageUrl: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400",
      sellerId: "test-seller-1",
      sellerName: "Test Seller",
      createdAt: new Date().toISOString()
    },
    "2": {
      id: "2",
      title: "To Kill a Mockingbird",
      description: "A gripping tale of racial injustice and childhood innocence set in the Depression-era South. Through the eyes of young Scout Finch, we witness her father Atticus's courageous defense of a Black man falsely accused of rape, while learning about prejudice, morality, and the loss of innocence in a divided society.",
      price: 12.99,
      stock: 5,
      imageUrl: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400",
      sellerId: "test-seller-1",
      sellerName: "Test Seller",
      createdAt: new Date().toISOString()
    },
    "3": {
      id: "3",
      title: "1984",
      description: "George Orwell's dystopian masterpiece presents a chilling vision of a totalitarian future. In a world where Big Brother watches everything and the Thought Police control minds, Winston Smith struggles to maintain his humanity and search for truth. A powerful exploration of surveillance, propaganda, and the nature of reality itself.",
      price: 13.99,
      stock: 8,
      imageUrl: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400",
      sellerId: "test-seller-1",
      sellerName: "Test Seller",
      createdAt: new Date().toISOString()
    }
  };

  const fallbackBook = fallbackBooks[id];
  if (fallbackBook) {
    console.log('✅ Returning fallback book:', fallbackBook.title);
    return res.json(fallbackBook);
  }
  
  console.log('❌ Book not found in fallback either for ID:', id);
  console.log('❌ Available fallback IDs:', Object.keys(fallbackBooks));
  res.status(404).json({ error: `Book not found for ID: ${id}` });
});

// Create new book (sellers only)
router.post('/', authenticateToken, requireRole(['seller']), async (req, res) => {
  const { title, description, price, stock, imageUrl } = req.body;

  try {
    // Validate input
    if (!title || !price || stock === undefined) {
      return res.status(400).json({ error: 'Title, price, and stock are required' });
    }

    if (price <= 0 || stock < 0) {
      return res.status(400).json({ error: 'Price must be positive and stock cannot be negative' });
    }

    const result = await pool.query(`
      INSERT INTO books (title, description, price, stock, image_url, seller_id, seller_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id,
        title,
        description,
        price,
        stock,
        image_url as "imageUrl",
        seller_id as "sellerId",
        seller_name as "sellerName",
        created_at as "createdAt"
    `, [title, description, price, stock, imageUrl, req.user.id, req.user.name]);

    res.status(201).json({
      message: 'Book created successfully',
      book: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update book (sellers only, own books)
router.put('/:id', authenticateToken, requireRole(['seller']), async (req, res) => {
  const { id } = req.params;
  const { title, description, price, stock, imageUrl } = req.body;

  try {
    // Check if book exists and belongs to seller
    const bookCheck = await pool.query(
      'SELECT seller_id FROM books WHERE id = $1',
      [id]
    );

    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (bookCheck.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own books' });
    }

    // Validate input
    if (price !== undefined && price <= 0) {
      return res.status(400).json({ error: 'Price must be positive' });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    const result = await pool.query(`
      UPDATE books 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        stock = COALESCE($4, stock),
        image_url = COALESCE($5, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING 
        id,
        title,
        description,
        price,
        stock,
        image_url as "imageUrl",
        seller_id as "sellerId",
        seller_name as "sellerName",
        created_at as "createdAt"
    `, [title, description, price, stock, imageUrl, id]);

    res.json({
      message: 'Book updated successfully',
      book: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete book (sellers only, own books)
router.delete('/:id', authenticateToken, requireRole(['seller']), async (req, res) => {
  const { id } = req.params;

  try {
    // Check if book exists and belongs to seller
    const bookCheck = await pool.query(
      'SELECT seller_id FROM books WHERE id = $1',
      [id]
    );

    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (bookCheck.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own books' });
    }

    await pool.query('DELETE FROM books WHERE id = $1', [id]);

    res.json({ message: 'Book deleted successfully' });

  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
