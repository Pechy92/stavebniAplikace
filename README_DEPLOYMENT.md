# Stavební Aplikace

Full-stack aplikace pro správu víceprací, směn a projektů ve stavebnictví.

## 🚀 Deployment na Railway.com

Podrobné instrukce pro nasazení najdete v souboru [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

### Rychlý start pro Railway:

1. **Vytvořte GitHub repository a nahrajte kód**
2. **Přihlaste se na Railway.app**
3. **Vytvořte nový projekt a přidejte MySQL databázi**
4. **Nasaďte backend** z `backend/` složky
5. **Nasaďte frontend** z `frontend/` složky
6. **Nastavte environment proměnné** (viz RAILWAY_DEPLOYMENT.md)

## 📦 Lokální development

### Backend
```bash
cd backend
npm install
cp .env.example .env  # a vyplňte hodnoty
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Technologie

- **Backend**: Node.js, Express, TypeScript, MySQL
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Database**: MySQL
- **Authentication**: JWT
- **File uploads**: Multer

## 📝 Features

- ✅ Správa projektů
- ✅ Evidence víceprací
- ✅ Plánování směn
- ✅ Fotodokumentace
- ✅ Správa materiálů
- ✅ Notifikace
- ✅ Vícejazyčnost (CS, EN, UK)
- ✅ Dark mode
- ✅ PDF export dokumentace
- ✅ Překlad z ukrajinštiny

## 👥 Role

- **Manager** - Plný přístup
- **Foreman** (Stavbyvedoucí) - Správa projektů a schvalování
- **Worker** (Dělník) - Zadávání víceprací a směn

## 📄 License

ISC
