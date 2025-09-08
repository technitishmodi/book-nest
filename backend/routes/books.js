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

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal server error' });
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

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching seller books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single book by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

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
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
