# GitHub Secrets Setup pro Database Backup

## Jak získat Railway databázové údaje

1. **Přihlaste se do Railway Dashboard**: https://railway.app
2. Otevřete váš projekt **stavebni-aplikace**
3. Klikněte na **MySQL** service
4. V záložce **Variables** najdete tyto hodnoty:

```
MYSQL_HOST=gondola.proxy.rlwy.net (nebo podobné)
MYSQL_PORT=37102 (nebo jiný port)
MYSQL_USER=root
MYSQL_PASSWORD=... (dlouhý řetězec)
MYSQL_DATABASE=railway
```

## Jak přidat secrets do GitHub

1. **Otevřete GitHub repository**: https://github.com/Pechy92/stavebniAplikace

2. **Navigujte na Settings**:
   - Klikněte na záložku **Settings**
   - V levém menu vyberte **Secrets and variables** → **Actions**

3. **Přidejte následující secrets** (tlačítko "New repository secret"):

| Secret Name | Hodnota | Příklad |
|-------------|---------|---------|
| `RAILWAY_DB_HOST` | MYSQL_HOST z Railway | `gondola.proxy.rlwy.net` |
| `RAILWAY_DB_PORT` | MYSQL_PORT z Railway | `37102` |
| `RAILWAY_DB_USER` | MYSQL_USER z Railway | `root` |
| `RAILWAY_DB_PASSWORD` | MYSQL_PASSWORD z Railway | `A1b2C3d4E5f6...` |
| `RAILWAY_DB_NAME` | MYSQL_DATABASE z Railway | `railway` |

## Jak otestovat zálohu

Po přidání secrets:

1. **Přejděte na Actions**: https://github.com/Pechy92/stavebniAplikace/actions
2. Vyberte workflow **Database Backup**
3. Klikněte na **Run workflow** → **Run workflow**
4. Zkontrolujte, že workflow proběhlo úspěšně (zelený checkmark ✅)
5. V záložce **Summary** najdete stažený backup soubor

## Automatické zálohy

Workflow automaticky běží:
- **Každou neděli ve 3:00 UTC** (4:00 CET)
- **Uchová posledních 12 záloh** (cca 3 měsíce při týdenních zálohách)
- Zálohy jsou dostupné po dobu **90 dnů**

## Jak stáhnout zálohu

1. Přejděte na Actions → vyberte konkrétní běh workflowu
2. V sekci **Artifacts** najdete soubor `database-backup-XXX`
3. Klikněte pro stažení
4. Rozbalte `.gz` soubor:
   ```bash
   gunzip backup_YYYYMMDD_HHMMSS.sql.gz
   ```

## Jak obnovit zálohu

### Lokálně:
```bash
mysql -u root stavebni_aplikace < backup_YYYYMMDD_HHMMSS.sql
```

### Na Railway:
```bash
# Připojte se k Railway MySQL
mysql -h gondola.proxy.rlwy.net -P 37102 -u root -p railway < backup_YYYYMMDD_HHMMSS.sql
```

## Troubleshooting

### Chyba: "RAILWAY_DB_HOST not configured"
➜ Přidejte všech 5 secrets do GitHub (viz výše)

### Chyba: "Access denied"
➜ Zkontrolujte, že heslo je správné (bez uvozovek)

### Chyba: "Can't connect to MySQL server"
➜ Ověřte, že Railway MySQL běží a údaje jsou aktuální
