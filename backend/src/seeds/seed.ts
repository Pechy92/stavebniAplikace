import bcrypt from 'bcrypt';
import pool from '../config/database';

async function seed() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    console.log('🌱 Začínám vytvářet testovací data...');

    // Vytvořit admin uživatele
    const adminPassword = await bcrypt.hash('admin123', 10);
    const [adminResult] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin@stavebni.cz', adminPassword, 'Admin', 'Systému', '+420123456789', 'admin']
    );
    const adminId = (adminResult as any).insertId;
    console.log('✅ Admin vytvořen (email: admin@stavebni.cz, heslo: admin123)');

    // Vytvořit manažery
    const managerPassword = await bcrypt.hash('manager123', 10);
    const [manager1Result] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['manager1@stavebni.cz', managerPassword, 'Martin', 'Novák', '+420111222333', 'manager', adminId]
    );
    const manager1Id = (manager1Result as any).insertId;

    const [manager2Result] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['manager2@stavebni.cz', managerPassword, 'Jana', 'Svobodová', '+420444555666', 'manager', adminId]
    );
    const manager2Id = (manager2Result as any).insertId;
    console.log('✅ Manažeři vytvořeni (heslo: manager123)');

    // Vytvořit stavbyvedoucí
    const foremanPassword = await bcrypt.hash('foreman123', 10);
    const [foreman1Result] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['foreman1@stavebni.cz', foremanPassword, 'Petr', 'Dvořák', '+420777888999', 'foreman', adminId]
    );
    const foreman1Id = (foreman1Result as any).insertId;

    const [foreman2Result] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['foreman2@stavebni.cz', foremanPassword, 'Eva', 'Procházková', '+420666777888', 'foreman', adminId]
    );
    const foreman2Id = (foreman2Result as any).insertId;
    console.log('✅ Stavbyvedoucí vytvořeni (heslo: foreman123)');

    // Vytvořit dělníky
    const workerPassword = await bcrypt.hash('worker123', 10);
    const workers = [
      ['worker1@stavebni.cz', 'Jan', 'Veselý', '+420111222444'],
      ['worker2@stavebni.cz', 'Pavel', 'Černý', '+420222333555'],
      ['worker3@stavebni.cz', 'Tomáš', 'Bílý', '+420333444666'],
      ['worker4@stavebni.cz', 'Michal', 'Zelený', '+420444555777'],
      ['worker5@stavebni.cz', 'Jakub', 'Růžový', '+420555666888']
    ];

    const workerIds = [];
    for (const [email, firstName, lastName, phone] of workers) {
      const [result] = await connection.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, created_by) 
         VALUES (?, ?, ?, ?, ?, 'worker', ?)`,
        [email, workerPassword, firstName, lastName, phone, adminId]
      );
      workerIds.push((result as any).insertId);
    }
    console.log('✅ Dělníci vytvořeni (heslo: worker123)');

    // Vytvořit stavby
    const [project1Result] = await connection.query(
      `INSERT INTO projects (name, custom_id, address, start_date, planned_end_date, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'Administrativní budova Ostrava',
        'PRJ-2026-001',
        'Hlavní třída 123, 702 00 Ostrava',
        '2026-01-15',
        '2026-12-31',
        'active',
        adminId
      ]
    );
    const project1Id = (project1Result as any).insertId;

    const [project2Result] = await connection.query(
      `INSERT INTO projects (name, custom_id, address, start_date, planned_end_date, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'Rodinný dům Brno',
        'PRJ-2026-002',
        'Zahradní 456, 602 00 Brno',
        '2026-02-01',
        '2026-08-31',
        'active',
        adminId
      ]
    );
    const project2Id = (project2Result as any).insertId;

    const [project3Result] = await connection.query(
      `INSERT INTO projects (name, custom_id, address, start_date, planned_end_date, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'Bytový dům Praha',
        'PRJ-2026-003',
        'Pražská 789, 110 00 Praha 1',
        '2026-03-01',
        '2027-06-30',
        'preparation',
        adminId
      ]
    );
    const project3Id = (project3Result as any).insertId;
    console.log('✅ Stavby vytvořeny');

    // Přiřadit manažery ke stavbám
    await connection.query(
      'INSERT INTO project_managers (project_id, manager_id) VALUES (?, ?), (?, ?)',
      [project1Id, manager1Id, project2Id, manager1Id]
    );
    await connection.query(
      'INSERT INTO project_managers (project_id, manager_id) VALUES (?, ?)',
      [project3Id, manager2Id]
    );

    // Přiřadit stavbyvedoucí ke stavbám
    await connection.query(
      'INSERT INTO project_foremen (project_id, foreman_id) VALUES (?, ?), (?, ?)',
      [project1Id, foreman1Id, project2Id, foreman2Id]
    );
    await connection.query(
      'INSERT INTO project_foremen (project_id, foreman_id) VALUES (?, ?)',
      [project3Id, foreman1Id]
    );
    console.log('✅ Manažeři a stavbyvedoucí přiřazeni ke stavbám');

    // Vytvořit materiály
    const materials = [
      ['Cement portlandský 25kg', 'Cement pro běžné stavební práce', 189, 'ks', 'Cementy', 'CEM-001'],
      ['Písek říční 1m³', 'Jemný říční písek pro stavební práce', 450, 'm³', 'Kamenivo', 'PIS-001'],
      ['Cihla plná pálená', 'Klasická plná cihla 290x140x65mm', 12, 'ks', 'Zdivo', 'CIH-001'],
      ['Beton C20/25 1m³', 'Konstrukční beton pevnostní třídy C20/25', 2100, 'm³', 'Betony', 'BET-001'],
      ['Izolace pěnová PE 50mm', 'Polyetylenová pěnová izolace', 45, 'ks', 'Izolace', 'IZO-001'],
      ['Lepidlo na izolaci 300ml', 'Lepidlo na pěnové izolace', 120, 'ks', 'Lepidla', 'LEP-001'],
      ['Páska hliníková 50mm', 'Hliníková páska 50m x 50mm', 85, 'ks', 'Pásky', 'PAS-001'],
      ['Dlažba keramická 30x30cm', 'Keramická dlažba interiérová', 145, 'm²', 'Obklady', 'DLA-001'],
      ['OSB deska 15mm 250x125cm', 'Orientovaná dřevotřísková deska', 320, 'ks', 'Dřevěné materiály', 'OSB-001'],
      ['Sádrokarton GK 12,5mm', 'Standardní sádrokartonová deska', 95, 'ks', 'Sádrokartony', 'SDK-001']
    ];

    for (const [name, description, unitPrice, unit, category, sku] of materials) {
      await connection.query(
        `INSERT INTO materials (name, description, unit_price, unit, category, sku, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, description, unitPrice, unit, category, sku, adminId]
      );
    }
    console.log('✅ Materiály vytvořeny');

    await connection.commit();
    console.log('✨ Všechna testovací data úspěšně vytvořena!');
    console.log('\n📝 Přihlašovací údaje:');
    console.log('   Admin:        admin@stavebni.cz / admin123');
    console.log('   Manažeři:     manager1@stavebni.cz, manager2@stavebni.cz / manager123');
    console.log('   Stavbyvedoucí: foreman1@stavebni.cz, foreman2@stavebni.cz / foreman123');
    console.log('   Dělníci:      worker1@stavebni.cz až worker5@stavebni.cz / worker123');

  } catch (error) {
    await connection.rollback();
    console.error('❌ Chyba při vytváření testovacích dat:', error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

seed();
