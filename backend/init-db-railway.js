const mysql = require('mysql2/promise');

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || process.env.MYSQLHOST,
    port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  });

  console.log('✅ Připojeno k databázi');

  // Users tabulka
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      role ENUM('admin', 'manager', 'foreman', 'worker') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabulka users vytvořena');

  // Projects tabulka
  await connection.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      custom_id VARCHAR(50) UNIQUE,
      address TEXT,
      start_date DATE,
      planned_end_date DATE,
      status ENUM('preparation', 'active', 'paused', 'completed') DEFAULT 'preparation',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabulka projects vytvořena');

  // Materials tabulka
  await connection.query(`
    CREATE TABLE IF NOT EXISTS materials (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      unit_price DECIMAL(10, 2) NOT NULL,
      unit VARCHAR(50) NOT NULL,
      category VARCHAR(100),
      sku VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Tabulka materials vytvořena');

  // Extra work tabulka
  await connection.query(`
    CREATE TABLE IF NOT EXISTS extra_work (
      id INT PRIMARY KEY AUTO_INCREMENT,
      custom_id VARCHAR(50) UNIQUE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      project_id INT,
      work_date DATE,
      duration_hours DECIMAL(5, 2),
      material_description_text TEXT,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log('✅ Tabulka extra_work vytvořena');

  // Extra work photos
  await connection.query(`
    CREATE TABLE IF NOT EXISTS extra_work_photos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      extra_work_id INT NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_name VARCHAR(255),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (extra_work_id) REFERENCES extra_work(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Tabulka extra_work_photos vytvořena');

  // Extra work materials
  await connection.query(`
    CREATE TABLE IF NOT EXISTS extra_work_materials (
      id INT PRIMARY KEY AUTO_INCREMENT,
      extra_work_id INT NOT NULL,
      material_id INT NOT NULL,
      quantity DECIMAL(10, 2) NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (extra_work_id) REFERENCES extra_work(id) ON DELETE CASCADE,
      FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Tabulka extra_work_materials vytvořena');

  // Shifts tabulka
  await connection.query(`
    CREATE TABLE IF NOT EXISTS shifts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      custom_id VARCHAR(50) UNIQUE,
      project_id INT,
      worker_id INT,
      shift_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      hours DECIMAL(5, 2),
      description TEXT,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log('✅ Tabulka shifts vytvořena');

  // Shift photos
  await connection.query(`
    CREATE TABLE IF NOT EXISTS shift_photos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      shift_id INT NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_name VARCHAR(255),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Tabulka shift_photos vytvořena');

  // Notifications tabulka
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Tabulka notifications vytvořena');

  // Vytvoř admin účet
  const bcrypt = require('bcryptjs');
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  await connection.query(`
    INSERT IGNORE INTO users (email, password, first_name, last_name, role)
    VALUES ('admin@example.com', ?, 'Admin', 'User', 'admin')
  `, [adminPassword]);
  console.log('✅ Admin účet vytvořen (admin@example.com / admin123)');

  await connection.end();
  console.log('✅ Databáze inicializována!');
}

initDatabase().catch(console.error);
