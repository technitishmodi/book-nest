const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const fixTestUsers = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Fixing test user passwords...');

    const saltRounds = 10;
    
    // Hash the password "password123" for all test users
    const passwordHash = await bcrypt.hash('password123', saltRounds);
    
    // Update test users with proper password hashes
    const testUsers = [
      'testseller@example.com',
      'testbuyer@example.com',
      'seller1@example.com',
      'seller2@example.com',
      'buyer@example.com'
    ];
    
    for (const email of testUsers) {
      const result = await client.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING name, email',
        [passwordHash, email]
      );
      
      if (result.rows.length > 0) {
        console.log(`Updated password for ${result.rows[0].name} (${result.rows[0].email})`);
      }
    }

    console.log('Test user passwords updated successfully!');
    console.log('All test users now have password: "password123"');
    
  } catch (error) {
    console.error('Error fixing test users:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run the fix
fixTestUsers()
  .then(() => {
    console.log('Test user fix complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test user fix failed:', error);
    process.exit(1);
  });
