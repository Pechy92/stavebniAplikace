const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function resetPasswords() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.RAILWAY_TCP_PROXY_DOMAIN,
      port: parseInt(process.env.RAILWAY_TCP_PROXY_PORT),
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: 'railway'
    });
    
    console.log('✅ Connected to database');
    
    // Reset hesla pro všechny +user účty na "password"
    const newPasswordHash = await bcrypt.hash('password', 10);
    
    const emails = [
      'pecholtmartin+user2@gmail.com',
      'pecholtmartin+user3@gmail.com',
      'pecholtmartin+user4@gmail.com',
      'pecholtmartin+user5@gmail.com'
    ];
    
    for (const email of emails) {
      await conn.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [newPasswordHash, email]
      );
      console.log(`✅ Reset password for: ${email}`);
    }
    
    console.log('\n✅ All passwords reset to: password');
    await conn.end();
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

resetPasswords();
