const mysql = require('mysql2/promise');

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'stavebni_aplikace'
  });
  
  try {
    const [users] = await connection.query('SELECT id, email, role FROM users ORDER BY id');
    console.log(`\nCelkem uživatelů: ${users.length}\n`);
    users.forEach(u => console.log(`${u.id}. ${u.email} (${u.role})`));
  } finally {
    await connection.end();
  }
}

checkUsers().catch(console.error);
