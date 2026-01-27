const mysql = require('mysql2/promise');

async function updateEmails() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stavebni_aplikace',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Získat všechny uživatele
    const [users] = await pool.query('SELECT id, first_name, last_name, email, role FROM users ORDER BY id');
    
    console.log('Aktualizuji emaily na pecholtmartin+userX@gmail.com (všechny emaily přijdou na pecholtmartin@gmail.com)...\n');
    
    // Aktualizovat každého uživatele s unikátním +alias
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const newEmail = `pecholtmartin+user${user.id}@gmail.com`;
      await pool.query('UPDATE users SET email = ? WHERE id = ?', [newEmail, user.id]);
      console.log(`✓ ${user.first_name} ${user.last_name} (${user.role}): ${newEmail}`);
    }
    
    console.log('\n✓ Všechny emaily byly aktualizovány v lokální databázi');
    console.log('📧 Všechny notifikace přijdou na: pecholtmartin@gmail.com');
    console.log('\n⚠ Nezapomeň stejnou změnu udělat i v produkční databázi na Railway!');
    console.log('   Můžeš použít Railway dashboard -> Database -> Query editor');
  } finally {
    await pool.end();
  }
}

updateEmails().catch(err => {
  console.error('Chyba:', err);
  process.exit(1);
});
