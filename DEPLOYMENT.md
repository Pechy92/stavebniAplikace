# 🚀 Deployment Guide - Stavební Aplikace

Tento dokument obsahuje kompletní návod na nasazení a spuštění aplikace pro testování.

## 📋 Obsah

1. [Systémové požadavky](#systémové-požadavky)
2. [Rychlé spuštění](#rychlé-spuštění)
3. [Testovací účty](#testovací-účty)
4. [Správa aplikace](#správa-aplikace)
5. [Řešení problémů](#řešení-problémů)
6. [Produkční nasazení](#produkční-nasazení)

## 🖥️ Systémové požadavky

### Minimální požadavky:
- **Node.js**: 18.x nebo vyšší
- **MySQL**: 8.0 nebo vyšší
- **npm**: 9.x nebo vyšší
- **Operační systém**: macOS, Linux, Windows (s WSL)
- **RAM**: 4 GB (doporučeno 8 GB)
- **Volné místo**: 500 MB

### Verifikace instalace:
```bash
node --version    # v18.x nebo vyšší
npm --version     # v9.x nebo vyšší
mysql --version   # 8.0 nebo vyšší
```

## ⚡ Rychlé spuštění

### 1. Kontrola stavu

Před spuštěním zkontrolujte, zda je vše připraveno:

```bash
./status.sh
```

Tento příkaz zkontroluje:
- ✅ MySQL server běží
- ✅ Databáze existuje a obsahuje data
- ✅ Backend běží (pokud již byl spuštěn)
- ✅ Frontend běží (pokud již byl spuštěn)

### 2. Spuštění aplikace

Spusťte celou aplikaci jedním příkazem:

```bash
./start.sh
```

**Co se stane:**
1. Kontrola MySQL serveru
2. Kontrola databáze a konfigurace
3. Zastavení starých procesů
4. Spuštění backendu na portu 3001
5. Spuštění frontendu na portu 5175
6. Zobrazení přístupových URL

**Po úspěšném spuštění:**
- 🌐 **Frontend**: http://localhost:5175
- 🔧 **Backend API**: http://localhost:3001
- 📊 **Health Check**: http://localhost:3001/health

### 3. Přístup do aplikace

Otevřete prohlížeč a přejděte na:
```
http://localhost:5175
```

Přihlaste se pomocí testovacího účtu (viz секci [Testovací účty](#testovací-účty)).

## 👥 Testovací účty

Aplikace obsahuje předvytvořené testovací účty pro všechny role:

### 🔴 Admin (Správce)
```
Email: admin@example.com
Heslo: admin123
```
**Práva:**
- Správa uživatelů (přidání, úprava, smazání)
- Správa projektů
- Správa materiálů
- Zobrazení všech směn a víceprací
- Schvalování víceprací

### 🟠 Manager (Vedoucí)
```
Email: manager1@example.com
Heslo: manager123
```
**Práva:**
- Správa přiřazených projektů
- Schvalování víceprací
- Plánování směn
- Přiřazování dělníků
- Správa materiálů na projektu

### 🟡 Foreman (Stavbyvedoucí)
```
Email: foreman1@example.com
Heslo: foreman123
```
**Práva:**
- Vytváření směn
- Přiřazování úkolů
- Kontrola víceprací
- Vrácení víceprací k úpravě
- Schvalování víceprací na vyšší úroveň

### 🟢 Worker (Dělník)
```
Email: worker1@example.com
Heslo: worker123
```
**Práva:**
- Zobrazení vlastních směn
- Vytváření víceprací
- Nahrávání fotografií
- Úprava konceptů víceprací

### Další testovací účty:

**Manager 2:**
```
Email: manager2@example.com
Heslo: manager123
```

**Foreman 2:**
```
Email: foreman2@example.com
Heslo: foreman123
```

**Workers (2-6):**
```
Email: worker2@example.com až worker6@example.com
Heslo: worker123 (pro všechny)
```

## 🎮 Správa aplikace

### Zastavení aplikace

Zastavte backend i frontend:

```bash
./stop.sh
```

### Restart aplikace

Restartujte celou aplikaci:

```bash
./restart.sh
```

### Kontrola stavu

Zjistěte aktuální stav všech služeb:

```bash
./status.sh
```

**Výstup obsahuje:**
- Stav MySQL serveru
- Počet uživatelů v databázi
- Stav backendu (běží/neběží, PID, health check)
- Stav frontendu (běží/neběží, PID, URL)
- Velikost a počet řádků logů

### Zobrazení logů

#### Backend logy (real-time):
```bash
tail -f logs/backend.log
```

#### Frontend logy (real-time):
```bash
tail -f logs/frontend.log
```

#### Poslední chyby v backendu:
```bash
grep "ERROR\|Error" logs/backend.log | tail -20
```

#### Všechny logy najednou:
```bash
tail -f logs/backend.log logs/frontend.log
```

## 🔧 Řešení problémů

### ❌ MySQL neběží

**Příznaky:**
```
❌ MySQL neběží! Prosím spusťte MySQL server.
```

**Řešení na macOS:**
```bash
# Spuštění MySQL
brew services start mysql

# Kontrola stavu
brew services list
```

**Řešení na Linux:**
```bash
# Spuštění MySQL
sudo systemctl start mysql

# Kontrola stavu
sudo systemctl status mysql
```

### ❌ Databáze neexistuje

**Příznaky:**
```
❌ Databáze stavebni_aplikace neexistuje!
```

**Řešení:**
```bash
# Import databázového schématu
mysql -u root < setup-db.sh

# Nebo ruční vytvoření
mysql -u root -e "CREATE DATABASE stavebni_aplikace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root stavebni_aplikace < database-schema.sql
```

### ❌ Port již používán

**Příznaky:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Řešení:**
```bash
# Najděte proces na portu 3001
lsof -ti:3001

# Ukončete proces
lsof -ti:3001 | xargs kill -9

# Nebo pro oba porty
lsof -ti:3001,5175 | xargs kill -9

# Potom restartujte aplikaci
./restart.sh
```

### ❌ Backend se nepodařilo spustit

**Diagnóza:**
```bash
# Zkontrolujte logy
tail -50 logs/backend.log

# Zkontrolujte .env soubor
cat backend/.env | grep -v "PASSWORD\|SECRET"

# Zkuste backend spustit ručně
cd backend
npm run dev
```

**Časté příčiny:**
1. Chybí node_modules: `cd backend && npm install`
2. Špatné DB přihlášení: zkontrolujte `backend/.env`
3. Port již používán: viz výše

### ❌ Frontend se nepodařilo spustit

**Diagnóza:**
```bash
# Zkontrolujte logy
tail -50 logs/frontend.log

# Zkuste frontend spustit ručně
cd frontend
npm run dev
```

**Časté příčiny:**
1. Chybí node_modules: `cd frontend && npm install`
2. Port 5175 již používán: viz výše

### ⚠️ Health check selhal

**Diagnóza:**
```bash
# Zkontrolujte health endpoint ručně
curl http://localhost:3001/health

# Zkontrolujte DB připojení
mysql -u root -e "USE stavebni_aplikace; SELECT COUNT(*) FROM users;"
```

### 🔐 Nemohu se přihlásit

**Kontrolní seznam:**
1. Používáte správné přihlašovací údaje?
   - Zkontrolujte секci [Testovací účty](#testovací-účty)
2. Backend běží?
   - Spusťte `./status.sh`
3. Databáze obsahuje uživatele?
   - `mysql -u root -e "USE stavebni_aplikace; SELECT email FROM users;"`

**Reset hesla uživatele:**
```bash
cd backend
npm run seed
# Toto resetuje všechny uživatele na výchozí hesla
```

## 🌐 Produkční nasazení

Pro produkční nasazení je potřeba provést následující úpravy:

### 1. Bezpečnostní konfigurace

**Backend (.env):**
```bash
# Změňte JWT secret na silné heslo
JWT_SECRET=<generujte-silne-nahodne-heslo-min-64-znaku>

# Nastavte produkční databázové přihlášení
DB_PASSWORD=<silne-heslo>

# Vypněte debug mód
NODE_ENV=production
```

**Generování bezpečného JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Build pro produkci

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Výstup v dist/ složce
```

### 3. Doporučené nástroje

- **Process Manager**: PM2 pro správu Node.js procesů
- **Reverse Proxy**: Nginx nebo Apache
- **SSL/TLS**: Let's Encrypt certifikáty
- **Monitoring**: Sentry, New Relic, nebo Datadog
- **Backup**: Automatické zálohování databáze

### 4. PM2 Setup (doporučeno)

```bash
# Instalace PM2
npm install -g pm2

# Spuštění backendu
cd backend
pm2 start dist/server.js --name stavebni-backend

# Spuštění frontendu s serve
cd ../frontend
pm2 serve dist 5175 --name stavebni-frontend

# Uložení konfigurace
pm2 save

# Automatický start po restartu
pm2 startup
```

### 5. Nginx konfigurace

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📞 Podpora

### Užitečné příkazy

```bash
# Kompletní restart všeho
./stop.sh && sleep 3 && ./start.sh

# Vyčištění logů
rm -f logs/*.log logs/*.pid

# Zkontrolovat verze
node --version && npm --version && mysql --version

# Reinstalace závislostí
cd backend && npm ci && cd ../frontend && npm ci && cd ..

# Velikost databáze
mysql -u root -e "SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'stavebni_aplikace'
GROUP BY table_schema;"
```

### Časté dotazy

**Q: Aplikace běží pomalu**
A: Zkontrolujte:
1. Velikost databáze a indexy
2. Logy na chyby
3. Systémové prostředky (RAM, CPU)

**Q: Fotografie se nenahrávají**
A: Zkontrolujte:
1. Cloudinary credentials v backend/.env
2. Backend logy při pokusu o upload
3. Velikost souboru (max 10 MB)

**Q: Notifikace nepřicházejí**
A: Zkontrolujte:
1. Email konfigurace v backend/.env
2. Notifikace jsou vypnuté pro vývoj
3. Zkontrolujte tabulku `notifications` v DB

## 📝 Changelog

**Aktuální verze: 1.0.0**

- ✅ Kompletní multi-role systém (Admin, Manager, Foreman, Worker)
- ✅ Správa projektů a směn
- ✅ Vícepráce s fotografiemi
- ✅ Schvalovací workflow
- ✅ Správa materiálů
- ✅ Notifikace
- ✅ Dark mode
- ✅ Glassmorphism design
- ✅ Vícejazyčnost (CS, EN, UK)

---

**Poslední aktualizace:** 15. února 2026
**Autor:** GitHub Copilot & Martin
