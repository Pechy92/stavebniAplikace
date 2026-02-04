# Produkční nasazení na stavby.cmpe.cz

## 1. Nastavení DNS u registrátora cmpe.cz

Přihlaste se ke správě domény **cmpe.cz** a přidejte tyto DNS záznamy:

### Pro Frontend (stavby.cmpe.cz)
```
Typ: CNAME
Název: stavby
Hodnota: <získáte z Railway - viz krok 3>
TTL: 3600
```

### Pro Backend API (api-stavby.cmpe.cz)
```
Typ: CNAME
Název: api-stavby
Hodnota: <získáte z Railway - viz krok 3>
TTL: 3600
```

## 2. Upgrade Railway plánu

1. Přihlaste se na https://railway.app
2. Otevřete projekt "stavebniaplikace"
3. **Settings** → **Plans** → **Upgrade to Hobby**
4. Platba: $5/měsíc + usage (~$10-20/měsíc celkem pro vaše využití)

## 3. Nastavení domén v Railway

### Frontend služba:
1. Railway Dashboard → **Frontend** service
2. **Settings** → **Domains** → **Custom Domain**
3. Zadejte: `stavby.cmpe.cz`
4. Railway zobrazí CNAME hodnotu (např. `abc123.up.railway.app`)
5. **Zkopírujte tuto hodnotu** a přidejte ji do DNS (krok 1)
6. Počkejte 5-60 minut na propagaci DNS
7. Railway automaticky zajistí SSL certifikát (Let's Encrypt)

### Backend služba:
1. Railway Dashboard → **Backend** service
2. **Settings** → **Domains** → **Custom Domain**
3. Zadejte: `api-stavby.cmpe.cz`
4. Zkopírujte CNAME hodnotu
5. Přidejte do DNS (krok 1)

## 4. Environment Variables v Railway

### Frontend service:
```
VITE_API_URL=https://api-stavby.cmpe.cz
```

### Backend service:
```
FRONTEND_URL=https://stavby.cmpe.cz
CORS_ORIGIN=https://stavby.cmpe.cz
JWT_SECRET=<změňte na silné heslo - vygenerujte nové!>
SENDGRID_API_KEY=<váš SendGrid klíč>
SENDGRID_FROM_EMAIL=viceprace@seznam.cz
```

**Vygenerování nového JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 5. Automatické zálohy - GitHub Secrets

Pro fungování automatických záloh přidejte do GitHub repository secrets:

1. GitHub → Repository → **Settings** → **Secrets and variables** → **Actions**
2. Přidejte tyto secrets (hodnoty získáte z Railway):

```
RAILWAY_DB_HOST=gondola.proxy.rlwy.net
RAILWAY_DB_PORT=37102
RAILWAY_DB_USER=root
RAILWAY_DB_PASSWORD=bJGhGwXLbForvtMjBbCJntHbpzoJLsqg
RAILWAY_DB_NAME=railway
```

**Zálohy:**
- Automaticky každou neděli ve 3:00 UTC (4:00 CET)
- Uloženo na GitHubu (90 dní)
- Uchováno posledních 12 záloh
- Manuální spuštění: GitHub → Actions → Database Backup → Run workflow

**Stažení zálohy:**
1. GitHub → **Actions** → **Database Backup** → klikněte na run
2. Scrollujte dolů → **Artifacts** → stáhněte `database-backup-XXX`
3. Rozbalte .gz soubor

## 6. Kontrola funkčnosti

Po nastavení ověřte:

- [ ] https://stavby.cmpe.cz - otevře se přihlašovací stránka
- [ ] https://api-stavby.cmpe.cz/health - vrátí `{"status":"ok"}`
- [ ] SSL certifikát je platný (zelený zámek v prohlížeči)
- [ ] Login s testovacím účtem funguje
- [ ] GitHub Actions záloha funguje (Actions tab)

## 7. Monitoring a údržba

### Railway Dashboard:
- **Metrics** - sledujte využití CPU/RAM/Network
- **Logs** - chybové hlášky
- **Deployments** - historie nasazení

### Pravidelná údržba:
- **Týdenní:** Kontrola záloh v GitHub Actions
- **Měsíční:** Kontrola Railway usage a nákladů
- **Čtvrtletně:** Aktualizace dependencies (`npm audit fix`)

## 8. Obnova ze zálohy (pokud potřeba)

```bash
# 1. Stáhněte zálohu z GitHub Artifacts
# 2. Rozbalte
gunzip backup_20260204_030000.sql.gz

# 3. Obnovte do databáze
mysql -h gondola.proxy.rlwy.net -P 37102 -u root -p railway < backup_20260204_030000.sql
```

## Kontakty a podpora

- Railway Support: https://railway.app/help
- GitHub Issues: https://github.com/Pechy92/stavebniAplikace/issues
- Dokumentace aplikace: UZIVATELSKA_DOKUMENTACE.md

---

## Rychlý checklist

- [ ] Railway upgrade na Hobby ($5/měsíc)
- [ ] DNS CNAME záznamy nastaveny
- [ ] Railway Custom Domains přidány
- [ ] Environment variables aktualizovány
- [ ] GitHub Secrets pro zálohy nastaveny
- [ ] Testovací přihlášení funguje
- [ ] První záloha úspěšná
- [ ] SendGrid sender verification dokončena

**Odhadovaný čas nasazení:** 30-60 minut (hlavně čekání na DNS propagaci)
