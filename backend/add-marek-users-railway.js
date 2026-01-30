const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function addMarekUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'junction.proxy.rlwy.net',
    port: process.env.DB_PORT || 52695,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'railway'
  });

  try {
    console.log('🔗 Připojuji se k databázi...');
    
    // Hashe hesel (stejné jako v seed.ts)
    const adminHash = await bcrypt.hash('admin123', 10);
    const managerHash = await bcrypt.hash('manager123', 10);
    const foremanHash = await bcrypt.hash('foreman123', 10);
    const workerHash = await bcrypt.hash('worker123', 10);

    console.log('👤 Přidávám uživatele pro pecholtmarek@gmail.com...\n');

    // Admin
    await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['pecholtmarek+admin@gmail.com', adminHash, 'Marek', 'Správce', '+420123456700', 'admin', true]
    );
    console.log('✅ Admin: pecholtmarek+admin@gmail.com / admin123');

    // Manažeři
    await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)`,
      [
        'pecholtmarek+manager1@gmail.com', managerHash, 'Karel', 'Manažer', '+420123456701', 'manager', true,
        'pecholtmarek+manager2@gmail.com', managerHash, 'Lucie', 'Koordinátorka', '+420123456702', 'manager', true
      ]
    );
    console.log('✅ Manažeři: pecholtmarek+manager1@gmail.com, pecholtmarek+manager2@gmail.com / manager123');

    // Stavbyvedoucí
    await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)`,
      [
        'pecholtmarek+foreman1@gmail.com', foremanHash, 'Josef', 'Stavbyvedoucí', '+420123456703', 'foreman', true,
        'pecholtmarek+foreman2@gmail.com', foremanHash, 'Alena', 'Mistrová', '+420123456704', 'foreman', true
      ]
    );
    console.log('✅ Stavbyvedoucí: pecholtmarek+foreman1@gmail.com, pecholtmarek+foreman2@gmail.com / foreman123');

    // Dělníci
    await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) 
       VALUES 
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?)`,
      [
        'pecholtmarek+worker1@gmail.com', workerHash, 'David', 'Pracovník', '+420123456705', 'worker', true,
        'pecholtmarek+worker2@gmail.com', workerHash, 'Marek', 'Dělník', '+420123456706', 'worker', true,
        'pecholtmarek+worker3@gmail.com', workerHash, 'Petr', 'Zedník', '+420123456707', 'worker', true,
        'pecholtmarek+worker4@gmail.com', workerHash, 'Lukáš', 'Pomocník', '+420123456708', 'worker', true,
        'pecholtmarek+worker5@gmail.com', workerHash, 'Vojtěch', 'Řemeslník', '+420123456709', 'worker', true
      ]
    );
    console.log('✅ Dělníci: pecholtmarek+worker1@gmail.com až pecholtmarek+worker5@gmail.com / worker123');

    // Výpis všech vytvořených uživatelů
    console.log('\n📋 Seznam vytvořených uživatelů:');
    const [users] = await connection.query(
      `SELECT id, email, CONCAT(first_name, ' ', last_name) as name, role 
       FROM users 
       WHERE email LIKE 'pecholtmarek%' 
       ORDER BY 
         CASE role
           WHEN 'admin' THEN 1
           WHEN 'manager' THEN 2
           WHEN 'foreman' THEN 3
           WHEN 'worker' THEN 4
         END,
         id`
    );

    users.forEach(user => {
      const password = 
        user.role === 'admin' ? 'admin123' :
        user.role === 'manager' ? 'manager123' :
        user.role === 'foreman' ? 'foreman123' : 'worker123';
      console.log(`   ${user.id}. ${user.email} - ${user.name} (${user.role}) / ${password}`);
    });

    console.log('\n✨ Všichni uživatelé pro pecholtmarek@gmail.com úspěšně vytvořeni!');

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('❌ Chyba: Některý uživatel již existuje v databázi');
      console.log('\n💡 Tip: Pokud chceš uživatele přidat znovu, nejdřív je smaž:');
      console.log('   DELETE FROM users WHERE email LIKE \'pecholtmarek%\';');
    } else {
      console.error('❌ Chyba při vytváření uživatelů:', error.message);
    }
  } finally {
    await connection.end();
  }
}

// Kontrola připojovacích údajů
if (!process.env.DB_PASSWORD) {
  console.error('❌ Chyba: DB_PASSWORD není nastaveno!');
  console.log('\n📝 Použití:');
  console.log('   DB_PASSWORD=<heslo> node add-marek-users-railway.js');
  console.log('\n   Nebo nastavte všechny proměnné:');
  console.log('   DB_HOST=... DB_PORT=... DB_USER=... DB_PASSWORD=... DB_NAME=... node add-marek-users-railway.js');
  process.exit(1);
}

addMarekUsers();
