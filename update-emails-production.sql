-- Aktualizace emailů pro testování notifikací
-- Všechny emaily budou ve formátu pecholtmartin+userX@gmail.com
-- Díky Gmail +alias funkci všechny emaily přijdou na pecholtmartin@gmail.com

UPDATE users SET email = CONCAT('pecholtmartin+user', id, '@gmail.com');

-- Zkontrolovat výsledek:
SELECT id, first_name, last_name, email, role FROM users ORDER BY id;
