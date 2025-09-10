const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Get user's wishlist
router.get('/', authenticateToken, requireRole(['buyer']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        w.id,
        w.user_id as "userId",
        w.book_id as "bookId",
        w.added_at as "addedAt",
        w.price_when_added as "priceWhenAdded",
        w.notify_on_price_drop as "notifyOnPriceDrop",
        b.title,
        b.description,
        b.price,
        b.stock,
        b.image_url as "imageUrl",
        b.seller_id as "sellerId",
        b.seller_name as "sellerName",
        b.created_at as "createdAt"
      FROM wishlist w
      JOIN books b ON w.book_id = b.id
      WHERE w.user_id = $1
      ORDER BY w.added_at DESC
    `, [req.user.id]);

    const wishlistItems = result.rows.map(row => ({
      id: row.id,
      userId: row.userId,
      bookId: row.bookId,
      addedAt: row.addedAt,
      priceWhenAdded: row.priceWhenAdded,
      notifyOnPriceDrop: row.notifyOnPriceDrop,
      book: {
        id: row.bookId,
        title: row.title,
        description: row.description,
        price: row.price,
        stock: row.stock,
        imageUrl: row.imageUrl,
        sellerId: row.sellerId,
        sellerName: row.sellerName,
        createdAt: row.createdAt
      }
    }));

    res.json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    
    // Fallback for development when database might not be available
    console.log('⚠️  Database error, returning empty wishlist');
    res.json([]);
  }
});

// Add book to wishlist
router.post('/', authenticateToken, requireRole(['buyer']), async (req, res) => {
  const { bookId, notifyOnPriceDrop = false } = req.body;

  try {
    // Check if book exists
    const bookResult = await pool.query('SELECT id, price FROM books WHERE id = $1', [bookId]);
    
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = bookResult.rows[0];

    // Check if already in wishlist
    const existingResult = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
      [req.user.id, bookId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Book already in wishlist' });
    }

    // Add to wishlist
    const result = await pool.query(`
      INSERT INTO wishlist (user_id, book_id, price_when_added, notify_on_price_drop)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id,
        user_id as "userId",
        book_id as "bookId",
        added_at as "addedAt",
        price_when_added as "priceWhenAdded",
        notify_on_price_drop as "notifyOnPriceDrop"
    `, [req.user.id, bookId, book.price, notifyOnPriceDrop]);

    res.status(201).json({
      message: 'Book added to wishlist',
      wishlistItem: result.rows[0]
    });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove book from wishlist
router.delete('/:bookId', authenticateToken, requireRole(['buyer']), async (req, res) => {
  const { bookId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2 RETURNING id',
      [req.user.id, bookId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found in wishlist' });
    }

    res.json({ message: 'Book removed from wishlist' });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if book is in wishlist
router.get('/check/:bookId', authenticateToken, requireRole(['buyer']), async (req, res) => {
  const { bookId } = req.params;

  try {
    const result = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND book_id = $2',
      [req.user.id, bookId]
    );

    res.json({ inWishlist: result.rows.length > 0 });

  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.json({ inWishlist: false });
  }
});

// Update price drop notification setting
router.patch('/:bookId/notify', authenticateToken, requireRole(['buyer']), async (req, res) => {
  const { bookId } = req.params;
  const { notifyOnPriceDrop } = req.body;

  try {
    const result = await pool.query(`
      UPDATE wishlist 
      SET notify_on_price_drop = $1
      WHERE user_id = $2 AND book_id = $3
      RETURNING 
        id,
        user_id as "userId",
        book_id as "bookId",
        notify_on_price_drop as "notifyOnPriceDrop"
    `, [notifyOnPriceDrop, req.user.id, bookId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found in wishlist' });
    }

    res.json({
      message: 'Notification setting updated',
      wishlistItem: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating notification setting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create shareable wishlist
router.post('/share', authenticateToken, requireRole(['buyer']), async (req, res) => {
  const { title, description, isPublic = true, expiresInDays = 30 } = req.body;

  try {
    const shareCode = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const result = await pool.query(`
      INSERT INTO wishlist_shares (user_id, share_code, title, description, is_public, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id,
        user_id as "userId",
        share_code as "shareCode",
        title,
        description,
        is_public as "isPublic",
        created_at as "createdAt",
        expires_at as "expiresAt"
    `, [req.user.id, shareCode, title, description, isPublic, expiresAt]);

    res.status(201).json({
      message: 'Wishlist share created',
      share: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating wishlist share:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get shared wishlist by share code
router.get('/shared/:shareCode', async (req, res) => {
  const { shareCode } = req.params;

  try {
    // Get share details
    const shareResult = await pool.query(`
      SELECT 
        ws.id,
        ws.user_id as "userId",
        ws.share_code as "shareCode",
        ws.title,
        ws.description,
        ws.is_public as "isPublic",
        ws.created_at as "createdAt",
        ws.expires_at as "expiresAt",
        u.name as "ownerName"
      FROM wishlist_shares ws
      JOIN users u ON ws.user_id = u.id
      WHERE ws.share_code = $1 AND ws.expires_at > NOW()
    `, [shareCode]);

    if (shareResult.rows.length === 0) {
      return res.status(404).json({ error: 'Shared wishlist not found or expired' });
    }

    const share = shareResult.rows[0];

    if (!share.isPublic) {
      return res.status(403).json({ error: 'This wishlist is private' });
    }

    // Get wishlist items
    const itemsResult = await pool.query(`
      SELECT 
        w.id,
        w.book_id as "bookId",
        w.added_at as "addedAt",
        b.title,
        b.description,
        b.price,
        b.stock,
        b.image_url as "imageUrl",
        b.seller_id as "sellerId",
        b.seller_name as "sellerName"
      FROM wishlist w
      JOIN books b ON w.book_id = b.id
      WHERE w.user_id = $1
      ORDER BY w.added_at DESC
    `, [share.userId]);

    const wishlistItems = itemsResult.rows.map(row => ({
      id: row.id,
      bookId: row.bookId,
      addedAt: row.addedAt,
      book: {
        id: row.bookId,
        title: row.title,
        description: row.description,
        price: row.price,
        stock: row.stock,
        imageUrl: row.imageUrl,
        sellerId: row.sellerId,
        sellerName: row.sellerName
      }
    }));

    res.json({
      share,
      items: wishlistItems
    });

  } catch (error) {
    console.error('Error fetching shared wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's wishlist shares
router.get('/shares', authenticateToken, requireRole(['buyer']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        user_id as "userId",
        share_code as "shareCode",
        title,
        description,
        is_public as "isPublic",
        created_at as "createdAt",
        expires_at as "expiresAt"
      FROM wishlist_shares
      WHERE user_id = $1 AND expires_at > NOW()
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wishlist shares:', error);
    res.json([]);
  }
});

// Delete wishlist share
router.delete('/shares/:shareCode', authenticateToken, requireRole(['buyer']), async (req, res) => {
  const { shareCode } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM wishlist_shares WHERE user_id = $1 AND share_code = $2 RETURNING id',
      [req.user.id, shareCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist share not found' });
    }

    res.json({ message: 'Wishlist share deleted' });

  } catch (error) {
    console.error('Error deleting wishlist share:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
