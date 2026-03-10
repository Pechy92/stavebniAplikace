import pool from './database';
import bcrypt from 'bcrypt';

export async function createTables() {
  const connection = await pool.getConnection();
  
  try {
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role ENUM('admin', 'manager', 'foreman', 'worker') NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        updated_by INT,
        INDEX idx_email (email),
        INDEX idx_role (role),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Projects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        custom_id VARCHAR(50) UNIQUE,
        address TEXT,
        start_date DATE,
        planned_end_date DATE,
        status ENUM('preparation', 'active', 'paused', 'completed') DEFAULT 'preparation',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        updated_by INT,
        INDEX idx_status (status),
        INDEX idx_custom_id (custom_id),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // ProjectManagers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_managers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        manager_id INT NOT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_project_manager (project_id, manager_id)
      )
    `);

    // ProjectForemen table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS project_foremen (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        foreman_id INT NOT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (foreman_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_project_foreman (project_id, foreman_id)
      )
    `);

    // Materials table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        unit_price DECIMAL(10,2),
        unit VARCHAR(20),
        category VARCHAR(100),
        project_id INT,
        sku VARCHAR(100) UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        updated_by INT,
        INDEX idx_name (name),
        INDEX idx_category (category),
        INDEX idx_project_id (project_id),
        INDEX idx_sku (sku),
        INDEX idx_is_active (is_active),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // ExtraWork table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS extra_work (
        id INT PRIMARY KEY AUTO_INCREMENT,
        custom_id VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        project_id INT NOT NULL,
        worker_id INT NOT NULL,
        start_datetime DATETIME,
        end_datetime DATETIME,
        duration_hours DECIMAL(5,2),
        description TEXT,
        material_description_text TEXT,
        status ENUM('draft', 'submitted_to_foreman', 'returned_to_worker', 'submitted_to_manager', 'returned_to_foreman', 'approved') DEFAULT 'draft',
        current_approver_id INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        updated_by INT,
        INDEX idx_status (status),
        INDEX idx_project (project_id),
        INDEX idx_worker (worker_id),
        INDEX idx_custom_id (custom_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (current_approver_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // ExtraWorkMaterials table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS extra_work_materials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        extra_work_id INT NOT NULL,
        material_id INT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price_snapshot DECIMAL(10,2),
        total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price_snapshot) STORED,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        added_by INT,
        FOREIGN KEY (extra_work_id) REFERENCES extra_work(id) ON DELETE CASCADE,
        FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // ExtraWorkPhotos table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS extra_work_photos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        extra_work_id INT NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INT,
        mime_type VARCHAR(50),
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        uploaded_by INT,
        FOREIGN KEY (extra_work_id) REFERENCES extra_work(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // ExtraWorkHistory table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS extra_work_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        extra_work_id INT NOT NULL,
        action ENUM('created', 'submitted', 'returned', 'approved') NOT NULL,
        status_from VARCHAR(50),
        status_to VARCHAR(50),
        user_id INT,
        note TEXT,
        action_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (extra_work_id) REFERENCES extra_work(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Shifts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        project_id INT NOT NULL,
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        duration_hours DECIMAL(5,2) GENERATED ALWAYS AS (TIMESTAMPDIFF(MINUTE, start_datetime, end_datetime) / 60) STORED,
        description TEXT(2000),
        status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        updated_by INT,
        INDEX idx_project (project_id),
        INDEX idx_status (status),
        INDEX idx_start_datetime (start_datetime),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // ShiftWorkers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shift_workers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        shift_id INT NOT NULL,
        user_id INT NOT NULL,
        individual_instructions TEXT(2000),
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_shift_worker (shift_id, user_id)
      )
    `);

    // ShiftTasks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shift_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        shift_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_worker_id INT,
        status ENUM('new', 'completed') DEFAULT 'new',
        due_date DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        order_index INT,
        FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_worker_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // ShiftPhotos table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shift_photos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        shift_id INT NOT NULL,
        worker_id INT,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INT,
        mime_type VARCHAR(50),
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
        FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // EmailNotifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        recipient_email VARCHAR(255),
        subject VARCHAR(500),
        body TEXT,
        notification_type VARCHAR(50),
        related_entity_type VARCHAR(50),
        related_entity_id INT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        sent_successfully BOOLEAN,
        error_message TEXT,
        INDEX idx_notification_type (notification_type),
        INDEX idx_related_entity (related_entity_type, related_entity_id)
      )
    `);

    // Notifications table (in-app)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
        entity_type VARCHAR(50),
        entity_id INT,
        is_read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(500),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at),
        INDEX idx_is_read (is_read),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Všechny tabulky byly úspěšně vytvořeny');
    
    // Seed admin uživatele a testovací data
    // Zkontroluj, jestli už existují uživatelé
    const [users]: any = await connection.query('SELECT COUNT(*) as count FROM users');
    
    if (users[0].count === 0) {
      console.log('Vytvářím testovací data...');
      
      // Admin
      const adminPassword = await bcrypt.hash('admin123', 10);
      await connection.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES ('admin@example.com', ?, 'Admin', 'Správce', 'admin')
      `, [adminPassword]);
      console.log('✅ Admin vytvořen (admin@example.com / admin123)');
      
      // Manager
      const managerPassword = await bcrypt.hash('manager123', 10);
      await connection.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES ('manager@example.com', ?, 'Jan', 'Manažer', 'manager')
      `, [managerPassword]);
      console.log('✅ Manager vytvořen (manager@example.com / manager123)');
      
      // Foreman (stavbyvedoucí)
      const foremanPassword = await bcrypt.hash('foreman123', 10);
      await connection.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES ('foreman@example.com', ?, 'Petr', 'Stavbyvedoucí', 'foreman')
      `, [foremanPassword]);
      console.log('✅ Stavbyvedoucí vytvořen (foreman@example.com / foreman123)');
      
      // Workers
      const workerPassword = await bcrypt.hash('worker123', 10);
      await connection.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES 
          ('worker1@example.com', ?, 'Олексій', 'Коваленко', 'worker'),
          ('worker2@example.com', ?, 'Андрій', 'Шевченко', 'worker')
      `, [workerPassword, workerPassword]);
      console.log('✅ Dělníci vytvořeni (worker1@example.com, worker2@example.com / worker123)');
      
      // Testovací projekt
      await connection.query(`
        INSERT INTO projects (name, custom_id, address, status)
        VALUES ('Testovací projekt', 'PROJ-001', 'Praha 1, Testovací 123', 'active')
      `);
      console.log('✅ Testovací projekt vytvořen');
      
      // Testovací materiály
      await connection.query(`
        INSERT INTO materials (name, description, unit_price, unit, category)
        VALUES 
          ('Cihly', 'Klasické pálené cihly', 15.50, 'ks', 'Stavební materiál'),
          ('Cement', 'Portlandský cement 42,5', 185.00, 'pytel', 'Stavební materiál'),
          ('Písek', 'Stavební písek', 450.00, 'm3', 'Stavební materiál')
      `);
      console.log('✅ Testovací materiály vytvořeny');
    }
    
  } catch (error) {
    console.error('❌ Chyba při vytváření tabulek:', error);
    throw error;
  } finally {
    connection.release();
  }
}
