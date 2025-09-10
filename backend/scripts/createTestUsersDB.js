const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const createTestUsers = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating test users...');

    const saltRounds = 10;
    
    // Hash the password "password123" for all test users
    const passwordHash = await bcrypt.hash('password123', saltRounds);
    
    // Create test users
    const testUsers = [
      {
        name: 'Test Seller',
        email: 'testseller@example.com',
        role: 'seller'
      },
      {
        name: 'Test Buyer',
        email: 'testbuyer@example.com',
        role: 'buyer'
      }
    ];
    
    for (const user of testUsers) {
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) DO UPDATE SET 
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = EXCLUDED.role
         RETURNING id, name, email, role`,
        [user.name, user.email, passwordHash, user.role]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ Created/Updated user: ${result.rows[0].name} (${result.rows[0].email}) - ${result.rows[0].role}`);
        console.log(`   User ID: ${result.rows[0].id}`);
      }
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('📧 Login credentials:');
    console.log('   Email: testseller@example.com | Password: password123 | Role: seller');
    console.log('   Email: testbuyer@example.com | Password: password123 | Role: buyer');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run the script
createTestUsers()
  .then(() => {
    console.log('\n✅ Test user creation complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test user creation failed:', error);
    process.exit(1);
  });
