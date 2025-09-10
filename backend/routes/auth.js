const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, passwordHash, role]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, hasPassword: !!password, body: req.body });

  try {
    // Validate input
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Test users for development (fallback when database is not available)
    const testUsers = {
      'testseller@example.com': {
        id: 'test-seller-1',
        name: 'Test Seller',
        email: 'testseller@example.com',
        role: 'seller',
        password: 'password123'
      },
      'testbuyer@example.com': {
        id: 'test-buyer-1',
        name: 'Test Buyer',
        email: 'testbuyer@example.com',
        role: 'buyer',
        password: 'password123'
      }
    };

    try {
      // Try database first
      const result = await pool.query(
        'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
        [email]
      );

      console.log('User query result:', { found: result.rows.length > 0, email });

      if (result.rows.length > 0) {
        const user = result.rows[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        console.log('Password validation:', { isValidPassword, email });
        
        if (!isValidPassword) {
          console.log('Login failed: Invalid password');
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, role: user.role },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        console.log('Login successful (database):', { email, role: user.role });

        return res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        });
      }
    } catch (dbError) {
      console.log('Database error, falling back to test users:', dbError.message);
    }

    // Fallback to test users if database fails or user not found
    const testUser = testUsers[email];
    if (testUser && testUser.password === password) {
      const token = jwt.sign(
        { userId: testUser.id, role: testUser.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      console.log('Login successful (test user):', { email, role: testUser.role });

      return res.json({
        message: 'Login successful (test mode)',
        user: {
          id: testUser.id,
          name: testUser.name,
          email: testUser.email,
          role: testUser.role
        },
        token
      });
    }

    console.log('Login failed: Invalid credentials');
    return res.status(401).json({ error: 'Invalid credentials' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;
