const pool = require('../config/database');

// Simple price drop notification checker
// In a production app, this would be run as a scheduled job (cron job, etc.)
async function checkPriceDrops() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking for price drops...');

    // Find books where current price is lower than when added to wishlist
    // and user has notifications enabled
    const result = await client.query(`
      SELECT 
        w.id as wishlist_id,
        w.user_id,
        w.book_id,
        w.price_when_added,
        w.notify_on_price_drop,
        b.title,
        b.price as current_price,
        u.name as user_name,
        u.email as user_email
      FROM wishlist w
      JOIN books b ON w.book_id = b.id
      JOIN users u ON w.user_id = u.id
      WHERE w.notify_on_price_drop = true
        AND CAST(b.price AS DECIMAL) < w.price_when_added
        AND w.last_notified_at IS NULL OR w.last_notified_at < NOW() - INTERVAL '24 hours'
    `);

    if (result.rows.length === 0) {
      console.log('✅ No price drops found');
      return;
    }

    console.log(`📉 Found ${result.rows.length} price drops to notify about`);

    for (const row of result.rows) {
      const priceDrop = row.price_when_added - parseFloat(row.current_price);
      const percentageDrop = ((priceDrop / row.price_when_added) * 100).toFixed(1);

      console.log(`💰 Price drop notification for ${row.user_name}:`);
      console.log(`   Book: "${row.title}"`);
      console.log(`   Original price: $${row.price_when_added}`);
      console.log(`   Current price: $${row.current_price}`);
      console.log(`   Savings: $${priceDrop.toFixed(2)} (${percentageDrop}%)`);

      // In a real app, you would send push notifications, emails, etc.
      // For now, we'll just log and update the notification timestamp
      
      // Update the last notified timestamp
      await client.query(`
        UPDATE wishlist 
        SET last_notified_at = NOW()
        WHERE id = $1
      `, [row.wishlist_id]);

      // You could integrate with services like:
      // - Firebase Cloud Messaging for push notifications
      // - SendGrid/Mailgun for email notifications
      // - Twilio for SMS notifications
    }

    console.log('✅ Price drop notifications processed');

  } catch (error) {
    console.error('❌ Error checking price drops:', error);
  } finally {
    client.release();
  }
}

// Add the last_notified_at column if it doesn't exist
async function addNotificationColumn() {
  const client = await pool.connect();
  
  try {
    await client.query(`
      ALTER TABLE wishlist 
      ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMP
    `);
    console.log('✅ Added last_notified_at column to wishlist table');
  } catch (error) {
    console.error('❌ Error adding notification column:', error);
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  addNotificationColumn()
    .then(() => checkPriceDrops())
    .then(() => {
      console.log('🎉 Price drop notification check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to check price drops:', error);
      process.exit(1);
    });
}

module.exports = { checkPriceDrops, addNotificationColumn };
