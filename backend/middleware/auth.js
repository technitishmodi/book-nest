const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Auth middleware: Authorization header:', authHeader ? 'present' : 'missing');
  console.log('🔐 Auth middleware: Token extracted:', token ? 'present' : 'missing');

  if (!token) {
    console.log('❌ Auth middleware: No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Auth middleware: Token decoded successfully, userId:', decoded.userId);
    
    // Get user from database - try PostgreSQL first, then fallback
    let result;
    try {
      result = await pool.query(
        'SELECT id, name, email, role FROM users WHERE id = $1',
        [decoded.userId]
      );
    } catch (dbError) {
      console.log('⚠️  Auth middleware: Database error, using fallback users');
      // Fallback for development
      const fallbackUsers = {
        'test-seller-1': { id: 'test-seller-1', name: 'Test Seller', email: 'seller@test.com', role: 'seller' },
        'test-buyer-1': { id: 'test-buyer-1', name: 'Test Buyer', email: 'buyer@test.com', role: 'buyer' }
      };
      
      const fallbackUser = fallbackUsers[decoded.userId];
      if (fallbackUser) {
        console.log('✅ Auth middleware: Using fallback user:', fallbackUser.email, 'role:', fallbackUser.role);
        req.user = fallbackUser;
        return next();
      } else {
        console.log('❌ Auth middleware: User not found in fallback');
        return res.status(401).json({ error: 'Invalid token - user not found' });
      }
    }

    if (result.rows.length === 0) {
      console.log('❌ Auth middleware: User not found in database');
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    console.log('✅ Auth middleware: User authenticated:', result.rows[0].email, 'role:', result.rows[0].role);
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.log('❌ Auth middleware: Token verification failed:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    console.log('🔒 Role check: Required roles:', roles);
    console.log('🔒 Role check: User role:', req.user?.role);
    
    if (!req.user) {
      console.log('❌ Role check: No user found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ Role check: Insufficient permissions. User has:', req.user.role, 'but needs one of:', roles);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    console.log('✅ Role check: User has required permissions');
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};
