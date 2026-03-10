const mysql = require('mysql2/promise');

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.RAILWAY_TCP_PROXY_DOMAIN,
      port: parseInt(process.env.RAILWAY_TCP_PROXY_PORT),
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: 'railway'
    });
    
    // Get a user and its current active status
    const [users] = await conn.execute('SELECT id, email, first_name, is_active FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('❌ No users found');
      await conn.end();
      return;
    }
    
    const user = users[0];
    console.log(`Found user: ${user.first_name} (ID=${user.id}, is_active=${user.is_active})`);
    
    // Try toggle
    console.log(`\nToggling is_active from ${user.is_active} to ${1 - user.is_active}...`);
    const newStatus = 1 - user.is_active;
    
    await conn.execute('UPDATE users SET is_active = ?, updated_by = ? WHERE id = ?', 
                      [newStatus, 1, user.id]);
    
    // Verify
    const [updated] = await conn.execute('SELECT is_active FROM users WHERE id = ?', [user.id]);
    console.log(`✅ Updated! New is_active = ${updated[0].is_active}`);
    
    await conn.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

test();
