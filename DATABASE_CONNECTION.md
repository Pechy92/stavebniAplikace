# Připojení k MySQL databázi

## Údaje pro připojení:

- **Host:** localhost
- **Port:** 3306
- **Uživatel:** root
- **Heslo:** (prázdné)
- **Databáze:** stavebni_aplikace

## Doporučené programy:

### 1. TablePlus (Doporučeno)
- **Web:** https://tableplus.com
- **Instalace:** `brew install --cask tableplus`
- **Výhody:** Moderní UI, rychlý, intuitivní
- **Poznámka:** Free verze má limit 2 otevřených tabů

### 2. DBeaver (Zdarma)
- **Web:** https://dbeaver.io
- **Instalace:** `brew install --cask dbeaver-community`
- **Výhody:** Zcela zdarma, velmi výkonný, cross-platform

### 3. MySQL Workbench (Oficiální)
- **Web:** https://dev.mysql.com/downloads/workbench/
- **Instalace:** `brew install --cask mysql-workbench`
- **Výhody:** Oficiální nástroj od MySQL, zdarma

### 4. Sequel Ace (macOS only, zdarma)
- **Web:** https://sequel-ace.com
- **Instalace:** `brew install --cask sequel-ace`
- **Výhody:** Open-source, rychlý, jednoduchý

## Připojení přes terminál:

```bash
mysql -u root stavebni_aplikace
```

## Užitečné SQL příkazy:

```sql
-- Zobrazit všechny tabulky
SHOW TABLES;

-- Zobrazit strukturu tabulky
DESCRIBE users;

-- Zobrazit všechny uživatele
SELECT id, email, first_name, last_name, role FROM users;

-- Zobrazit všechny projekty
SELECT * FROM projects;

-- Zobrazit vícepráce s detaily
SELECT ew.*, p.name as project_name, u.first_name, u.last_name 
FROM extra_work ew 
JOIN projects p ON ew.project_id = p.id 
JOIN users u ON ew.worker_id = u.id;
```

## Rychlé otevření v TablePlus:

Po instalaci TablePlus:
1. Otevřete aplikaci
2. Klikněte na "Create a new connection"
3. Vyberte "MySQL"
4. Vyplňte údaje:
   - Name: Stavební Aplikace
   - Host: localhost
   - Port: 3306
   - User: root
   - Password: (nechte prázdné)
   - Database: stavebni_aplikace
5. Klikněte "Test" a pak "Connect"
