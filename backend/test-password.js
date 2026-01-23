const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function testPassword() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'stavebni_aplikace'
  });
  
  try {
    const [users] = await connection.query(
      'SELECT email, password_hash FROM users WHERE email = ?',
      ['worker1@stavebni.cz']
    );
    
    if (users.length === 0) {
      console.log('❌ Uživatel worker1@stavebni.cz nebyl nalezen');
      return;
    }
    
    const user = users[0];
    console.log(`✅ Uživatel nalezen: ${user.email}`);
    console.log(`Hash začíná: ${user.password_hash.substring(0, 20)}...`);
    
    const testPassword = 'worker123';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    
    console.log(`\nTest hesla '${testPassword}': ${isValid ? '✅ SPRÁVNÉ' : '❌ ŠPATNÉ'}`);
    
    if (!isValid) {
      console.log('\n🔧 Resetuji heslo na worker123...');
      const newHash = await bcrypt.hash('worker123', 10);
      await connection.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [newHash, 'worker1@stavebni.cz']
      );
      console.log('✅ Heslo resetováno');
    }
    
  } finally {
    await connection.end();
  }
}

testPassword().catch(console.error);
