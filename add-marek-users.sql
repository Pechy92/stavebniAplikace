-- Přidání testovacích uživatelů pro email pecholtmarek@gmail.com
-- Všechny emaily budou ve formátu pecholtmarek+userX@gmail.com
-- Díky Gmail +alias funkci všechny emaily přijdou na pecholtmarek@gmail.com

-- Admin
-- Heslo: admin123
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) 
VALUES ('pecholtmarek+admin@gmail.com', '$2b$10$5JF.yHxCELx2lLZXGQZo5.ZjNhxvY5mKKYBJ6x8HnXqYqZjY6F6xa', 'Marek', 'Správce', '+420123456700', 'admin', TRUE);

-- Manažeři
-- Heslo: manager123
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) 
VALUES 
('pecholtmarek+manager1@gmail.com', '$2b$10$5JF.yHxCELx2lLZXGQZo5.ZjNhxvY5mKKYBJ6x8HnXqYqZjY6F6xa', 'Karel', 'Manažer', '+420123456701', 'manager', TRUE),
('pecholtmarek+manager2@gmail.com', '$2b$10$5JF.yHxCELx2lLZXGQZo5.ZjNhxvY5mKKYBJ6x8HnXqYqZjY6F6xa', 'Lucie', 'Koordinátorka', '+420123456702', 'manager', TRUE);

-- Stavbyvedoucí
-- Heslo: foreman123  
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) 
VALUES 
('pecholtmarek+foreman1@gmail.com', '$2b$10$5JF.yHxCELx2lLZXGQZo5.ZjNhxvY5mKKYBJ6x8HnXqYqZjY6F6xa', 'Josef', 'Stavbyvedoucí', '+420123456703', 'foreman', TRUE),
('pecholtmarek+foreman2@gmail.com', '$2b$10$5JF.yHxCELx2lLZXGQZo5.ZjNhxvY5mKKYBJ6x8HnXqYqZjY6F6xa', 'Alena', 'Mistrová', '+420123456704', 'foreman', TRUE);

-- Dělníci
-- Heslo: worker123
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) 
VALUES 
('pecholtmarek+worker1@gmail.com', '$2b$10$5JF.yHxCELx2lLZXGQZo5.ZjNhxvY5mKKYBJ6x8HnXqYqZjY6F6xa', 'David', 'Pracovník', '+420123456705', 'worker', TRUE),
('pecholtmarek+worker2@gmail.com', '$2b$10$5JF.yHxCELx2lLZXGQZo5.ZjNhxvY5mKKYBJ6x8HnXqYqZjY6F6xa', 'Marek', 'Dělník', '+420123456706', 'worker', TRUE),
('pecholtmarek+worker3@gmail.com', '$2b$10$5JF.yHxCELx2lLZXGQZo5.ZjNhxvY5mKKYBJ6x8HnXqYqZjY6F6xa', 'Petr', 'Zedník', '+420123456707', 'worker', TRUE),
('pecholtmarek+worker4@gmail.com', '$2b$10$5JF.yHxCELx2lLZXGQZo5.ZjNhxvY5mKKYBJ6x8HnXqYqZjY6F6xa', 'Lukáš', 'Pomocník', '+420123456708', 'worker', TRUE),
('pecholtmarek+worker5@gmail.com', '$2b$10$5JF.yHxCELx2lLZXGQZo5.ZjNhxvY5mKKYBJ6x8HnXqYqZjY6F6xa', 'Vojtěch', 'Řemeslník', '+420123456709', 'worker', TRUE);

-- Výpis vytvořených uživatelů
SELECT 
    id,
    email,
    CONCAT(first_name, ' ', last_name) as name,
    role,
    phone,
    CASE 
        WHEN role = 'admin' THEN 'admin123'
        WHEN role = 'manager' THEN 'manager123'
        WHEN role = 'foreman' THEN 'foreman123'
        WHEN role = 'worker' THEN 'worker123'
    END as password
FROM users 
WHERE email LIKE 'pecholtmarek%'
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'foreman' THEN 3
        WHEN 'worker' THEN 4
    END,
    id;
