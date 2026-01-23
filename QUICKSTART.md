# Rychlý start

## Krok 1: Nastavení databáze

Vytvořte MySQL databázi:

```sql
CREATE DATABASE stavebni_aplikace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Krok 2: Konfigurace prostředí

### Backend
Editujte `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=vaše_heslo
DB_NAME=stavebni_aplikace
JWT_SECRET=zmenit_v_produkci_na_bezpecny_klic
```

### Frontend
Soubor `frontend/.env` je již nastaven:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## Krok 3: Spuštění

### Terminál 1 - Backend
```bash
cd backend
npm run dev
```
Server poběží na http://localhost:3001

### Terminál 2 - Frontend
```bash
cd frontend
npm run dev
```
Aplikace poběží na http://localhost:3000

## Krok 4: Vytvoření testovacích dat (volitelné)

```bash
cd backend
npm run seed
```

## Přihlášení

Po vytvoření seed dat použijte:

- **Admin**: admin@stavebni.cz / admin123
- **Manažer**: manager1@stavebni.cz / manager123
- **Stavbyvedoucí**: foreman1@stavebni.cz / foreman123
- **Dělník**: worker1@stavebni.cz / worker123

## Poznámky

- Aplikace automaticky vytvoří databázové tabulky při prvním spuštění
- Pro e-mailové notifikace nakonfigurujte SMTP v `backend/.env`
- Pro produkční nasazení změňte všechny výchozí hodnoty v `.env`
