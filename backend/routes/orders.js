const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create new order (buyers only)
router.post('/', authenticateToken, requireRole(['buyer']), async (req, res) => {
  const { items } = req.body; // Array of { bookId, quantity }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let totalAmount = 0;
    const orderItems = [];

    // Validate and calculate order
    for (const item of items) {
      const { bookId, quantity } = item;

      if (!bookId || !quantity || quantity <= 0) {
        throw new Error('Invalid item data');
      }

      // Get book details and check stock
      const bookResult = await client.query(
        'SELECT id, title, price, stock, seller_id, seller_name FROM books WHERE id = $1',
        [bookId]
      );

      if (bookResult.rows.length === 0) {
        throw new Error(`Book with ID ${bookId} not found`);
      }

      const book = bookResult.rows[0];

      if (book.stock < quantity) {
        throw new Error(`Insufficient stock for book: ${book.title}`);
      }

      const itemTotal = parseFloat(book.price) * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        bookId: book.id,
        title: book.title,
        quantity,
        price: book.price,
        sellerId: book.seller_id,
        sellerName: book.seller_name
      });

      // Update book stock
      await client.query(
        'UPDATE books SET stock = stock - $1 WHERE id = $2',
        [quantity, bookId]
      );
    }

    // Group items by seller to create separate orders
    const ordersBySeller = {};
    orderItems.forEach(item => {
      if (!ordersBySeller[item.sellerId]) {
        ordersBySeller[item.sellerId] = {
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          items: [],
          total: 0
        };
      }
      ordersBySeller[item.sellerId].items.push(item);
      ordersBySeller[item.sellerId].total += parseFloat(item.price) * item.quantity;
    });

    const createdOrders = [];

    // Create orders for each seller
    for (const sellerOrder of Object.values(ordersBySeller)) {
      const orderResult = await client.query(`
        INSERT INTO orders (buyer_id, seller_id, total_amount, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING id, buyer_id as "buyerId", seller_id as "sellerId", total_amount as "totalAmount", status, created_at as "createdAt"
      `, [req.user.id, sellerOrder.sellerId, sellerOrder.total]);

      const order = orderResult.rows[0];

      // Create order items
      for (const item of sellerOrder.items) {
        await client.query(`
          INSERT INTO order_items (order_id, book_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `, [order.id, item.bookId, item.quantity, item.price]);
      }

      createdOrders.push({
        ...order,
        items: sellerOrder.items
      });
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Orders created successfully',
      orders: createdOrders,
      totalAmount
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(400).json({ error: error.message || 'Failed to create order' });
  } finally {
    client.release();
  }
});

// Get orders by seller
router.get('/seller', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id,
        o.buyer_id as "buyerId",
        u.name as "buyerName",
        o.total_amount as "totalAmount",
        o.status,
        o.created_at as "createdAt",
        json_agg(
          json_build_object(
            'id', oi.id,
            'bookId', oi.book_id,
            'title', b.title,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN books b ON oi.book_id = b.id
      WHERE o.seller_id = $1
      GROUP BY o.id, o.buyer_id, u.name, o.total_amount, o.status, o.created_at
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get orders by buyer
router.get('/buyer', authenticateToken, requireRole(['buyer']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id,
        o.seller_id as "sellerId",
        u.name as "sellerName",
        o.total_amount as "totalAmount",
        o.status,
        o.created_at as "createdAt",
        json_agg(
          json_build_object(
            'id', oi.id,
            'bookId', oi.book_id,
            'title', b.title,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      JOIN users u ON o.seller_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN books b ON oi.book_id = b.id
      WHERE o.buyer_id = $1
      GROUP BY o.id, o.seller_id, u.name, o.total_amount, o.status, o.created_at
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status (sellers only, own orders)
router.patch('/:id/status', authenticateToken, requireRole(['seller']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  try {
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if order exists and belongs to seller
    const orderCheck = await pool.query(
      'SELECT seller_id FROM orders WHERE id = $1',
      [id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderCheck.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own orders' });
    }

    const result = await pool.query(`
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING 
        id,
        buyer_id as "buyerId",
        seller_id as "sellerId",
        total_amount as "totalAmount",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [status, id]);

    res.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
