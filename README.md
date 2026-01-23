# Stavební aplikace

Moderní webová aplikace pro správu víceprací a plánování pracovních směn ve stavební firmě.

## Technologie

### Backend
- Node.js + Express
- TypeScript
- MySQL databáze
- JWT autentizace
- Nodemailer (e-mailové notifikace)
- Multer (upload souborů)

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- React Query

## Funkce

### Uživatelské role
- **Administrátor** - správa uživatelů, staveb, materiálů
- **Manažer stavby** - schvalování víceprací, plánování směn
- **Stavbyvedoucí** - kontrola víceprací, přidávání materiálů, plánování směn
- **Dělník** - vytváření víceprací, nahrávání fotodokumentace, zobrazení přiřazených směn

### Moduly
- **Vícepráce** - kompletní workflow od vytvoření po schválení s fotodokumentací
- **Plánování směn** - kalendářní zobrazení, přiřazování dělníků, to-do listy
- **Správa staveb** - CRUD operace, přiřazování manažerů a stavbyvedoucích
- **Správa materiálů** - databáze materiálů s cenami
- **E-mailové notifikace** - automatické upozornění při změnách statusů

## Instalace

### Předpoklady
- Node.js 18+
- MySQL 8.0+
- npm nebo yarn

### Backend

1. Přejděte do adresáře backend:
```bash
cd backend
```

2. Nainstalujte závislosti:
```bash
npm install
```

3. Vytvořte `.env` soubor (zkopírujte z `.env.example`):
```bash
cp .env.example .env
```

4. Upravte `.env` soubor s vašimi údaji:
- Nastavte přístup k MySQL databázi
- Nastavte JWT secret
- Nakonfigurujte SMTP pro e-maily

5. Vytvořte MySQL databázi:
```sql
CREATE DATABASE stavebni_aplikace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

6. Spusťte server (automaticky vytvoří tabulky):
```bash
npm run dev
```

Server poběží na `http://localhost:3001`

### Frontend

1. Přejděte do adresáře frontend:
```bash
cd frontend
```

2. Nainstalujte závislosti:
```bash
npm install
```

3. Vytvořte `.env` soubor:
```bash
cp .env.example .env
```

4. Spusťte vývojový server:
```bash
npm run dev
```

Frontend poběží na `http://localhost:3000`

## Vývoj

### Backend
```bash
cd backend
npm run dev          # Spustit dev server s hot reload
npm run build        # Build pro production
npm start            # Spustit production server
```

### Frontend
```bash
cd frontend
npm run dev          # Spustit dev server
npm run build        # Build pro production
npm run preview      # Preview production buildu
```

## Databázový model

Aplikace obsahuje následující hlavní tabulky:
- `users` - uživatelé s rolemi
- `projects` - stavební projekty
- `materials` - databáze materiálů
- `extra_work` - vícepráce
- `extra_work_materials` - materiály použité při vícepráci
- `extra_work_photos` - fotodokumentace víceprací
- `extra_work_history` - historie schvalovacího procesu
- `shifts` - pracovní směny
- `shift_workers` - přiřazení dělníků na směny
- `shift_tasks` - úkoly v rámci směny
- `shift_photos` - fotodokumentace ze směn
- `email_notifications` - log odeslaných e-mailů

## API Endpointy

### Autentizace
- `POST /api/auth/register` - Registrace nového uživatele
- `POST /api/auth/login` - Přihlášení
- `GET /api/auth/profile` - Získání profilu
- `PUT /api/auth/profile` - Aktualizace profilu
- `POST /api/auth/change-password` - Změna hesla

### Projekty
- `GET /api/projects` - Seznam projektů
- `GET /api/projects/:id` - Detail projektu
- `POST /api/projects` - Vytvoření projektu (admin, manager)
- `PUT /api/projects/:id` - Aktualizace projektu (admin, manager)
- `DELETE /api/projects/:id` - Smazání projektu (admin)

### Vícepráce
- `GET /api/extra-work` - Seznam víceprací
- `GET /api/extra-work/:id` - Detail vícepráce
- `POST /api/extra-work` - Vytvoření vícepráce (worker)
- `POST /api/extra-work/:id/submit-to-foreman` - Odeslání ke kontrole
- `POST /api/extra-work/:id/materials` - Přidání materiálů (foreman)
- `POST /api/extra-work/:id/submit-to-manager` - Odeslání ke schválení
- `POST /api/extra-work/:id/approve` - Schválení (manager)

## Bezpečnost

- Hesla jsou hashována pomocí bcrypt
- JWT tokeny pro autentizaci
- Role-based access control (RBAC)
- Validace vstupu na backend i frontend
- CORS ochrana
- Rate limiting
- SQL injection prevence

## Produkční nasazení

### Backend
1. Nastavte production proměnné prostředí
2. Build: `npm run build`
3. Spusťte: `npm start`
4. Použijte process manager (PM2, systemd)
5. Nastavte reverse proxy (nginx)
6. Zapněte HTTPS

### Frontend
1. Build: `npm run build`
2. Nasaďte `dist` složku na statický hosting
3. Nastavte správné API URL v `.env`

## Testovací data

Pro vytvoření testovacích dat vytvořte seed skripty v `backend/src/seeds/`

## Licence

Tento projekt je vytvořen pro interní použití stavební firmy.

## Kontakt

Pro otázky a podporu kontaktujte administrátora.
