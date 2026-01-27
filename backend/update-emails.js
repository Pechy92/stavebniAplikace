const mysql = require('mysql2/promise');

async function updateEmails() {
  const pool = mysql.createPool({
    host: 'junction.proxy.rlwy.net',
    port: 22975,
    user: 'root',
    password: 'pXMbOJPfGVfLkvlAbQQGtcHAYeKEqxLk',
    database: 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000
  });

  try {
    await pool.query("UPDATE users SET email = 'pecholtmartin@gmail.com'");
    const [users] = await pool.query('SELECT id, first_name, last_name, email, role FROM users');
    console.log('Všichni uživatelé mají nyní email: pecholtmartin@gmail.com\n');
    console.table(users);
  } finally {
    await pool.end();
  }
}

updateEmails().catch(err => {
  console.error('Chyba:', err);
  process.exit(1);
});
