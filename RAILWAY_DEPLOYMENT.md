# Railway Deployment Instructions

## Nasazení aplikace na Railway.com

### 1. Připravte GitHub repository
```bash
cd /Users/martin/Desktop/Práce/Marek/Aplikace
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Vytvořte Railway projekt

1. Přejděte na https://railway.app/
2. Přihlaste se pomocí GitHub účtu
3. Klikněte na "New Project"

### 3. Nasazení databáze

1. V Railway projektu klikněte na "+ New"
2. Vyberte "Database" → "MySQL"
3. Počkejte na vytvoření databáze
4. Zkopírujte connection string

### 4. Nasazení backendu

1. Klikněte na "+ New" → "GitHub Repo"
2. Vyberte váš repository
3. Vyberte složku `backend` jako Root Directory
4. Přidejte environment proměnné:
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=<railway-mysql-host>
   DB_PORT=3306
   DB_USER=<railway-mysql-user>
   DB_PASSWORD=<railway-mysql-password>
   DB_NAME=railway
   JWT_SECRET=<vygenrujte-silny-secret>
   JWT_EXPIRES_IN=7d
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   EMAIL_HOST=<smtp-server>
   EMAIL_PORT=587
   EMAIL_USER=<email>
   EMAIL_PASSWORD=<email-password>
   EMAIL_FROM=<from-email>
   ```
5. Klikněte na "Deploy"

### 5. Nasazení frontendu

1. Klikněte na "+ New" → "GitHub Repo"
2. Vyberte váš repository
3. Vyberte složku `frontend` jako Root Directory
4. Přidejte environment proměnné:
   ```
   VITE_API_URL=<backend-railway-url>
   ```
5. Změňte Build Command na: `npm run build`
6. Změňte Start Command na: `npm run preview`
7. Klikněte na "Deploy"

### 6. Konfigurace frontendu pro produkci

Frontend potřebuje použít API URL z Railway backendu.

### 7. Spuštění migrací

Po nasazení backendu se databáze automaticky inicializuje při prvním startu díky `createTables()` v `server.ts`.

### 8. Vytvoření prvního admin uživatele

Přihlaste se do Railway backendu přes Railway CLI nebo přes Railway dashboard a spusťte seed:
```bash
railway run npm run seed
```

## Alternativa: Manuální nasazení bez GitHub

### Instalace Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### Nasazení backendu
```bash
cd backend
railway init
railway add mysql
railway up
```

### Nasazení frontendu
```bash
cd frontend
railway init
railway up
```

## Poznámky

- **Databáze**: Railway MySQL je automaticky zálohovaná
- **Uploads**: Pro produkci doporučuji použít S3/Cloudinary místo lokálního filesystému
- **Domain**: Railway poskytuje automatickou doménu, můžete přidat vlastní
- **Environment variables**: Nikdy necommitujte `.env` soubory do Gitu
- **CORS**: Ujistěte se, že backend má správně nastavený CORS pro frontend URL

## Ceny Railway

- **Starter**: $5/měsíc pro hobby projekty
- **Developer**: $20/měsíc
- Pro produkční nasazení zvažte **Team** plán

## Troubleshooting

### Backend se nespustí
- Zkontrolujte logy v Railway dashboard
- Ověřte, že všechny environment proměnné jsou správně nastavené
- Ujistěte se, že `npm run build` proběhl úspěšně

### Frontend se nepřipojí k backendu
- Zkontrolujte `VITE_API_URL` environment proměnnou
- Ověřte CORS nastavení v backendu
- Zkontrolujte Network tab v Developer Tools

### Database connection error
- Ověřte správnost DB credentials
- Zkontrolujte, že MySQL service běží
- Ověřte connection string format
