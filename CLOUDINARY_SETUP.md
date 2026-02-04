# Cloudinary Setup Guide

## 1. Registrace na Cloudinary

1. Jděte na https://cloudinary.com/users/register_free
2. Zaregistrujte se (lze použít Google účet)
3. Po přihlášení budete na Dashboard

## 2. Získání credentials

Na Cloudinary Dashboard najdete:

```
Cloud Name: dcxyz123abc
API Key: 123456789012345
API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz
```

**⚠️ DŮLEŽITÉ:** API Secret je tajný - nikdy ho necommitujte do Gitu!

## 3. Přidání do Railway Backend Variables

Railway Dashboard → Backend služba → Variables → přidejte:

```
CLOUDINARY_CLOUD_NAME=dcxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
```

## 4. Lokální development

Vytvořte `.env` v `/backend` složce (je již v .gitignore):

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=stavebni_aplikace

# Cloudinary
CLOUDINARY_CLOUD_NAME=dcxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz

# Other
JWT_SECRET=your-dev-secret
PORT=3001
```

## 5. Cloudinary Free Tier Limity

✅ **Zdarma dostáváte:**
- 25 GB storage
- 25 GB bandwidth/měsíc
- 25,000 transformací/měsíc
- 1,000 video sekund

**Pro vaši aplikaci (~30 uživatelů):**
- Měsíční spotřeba: ~5-10 GB
- Rok v free tieru: ✅ Stačí
- Druhý rok: možná $1-3/měsíc

## 6. Nastavení Cloudinary Dashboard

### Upload presets (volitelné):
1. Settings → Upload → Upload presets
2. Můžete vytvořit preset pro automatickou optimalizaci

### Folders (automatické):
Aplikace vytváří:
- `stavebni-aplikace/extra-work/` - fotky vícepráce
- `stavebni-aplikace/shifts/` - fotky ze směn

### Auto-backup (doporučeno):
1. Settings → Security → Auto-Backup
2. Zapnout pro produkční účet

## 7. Ověření funkčnosti

Po nasazení na Railway:

```bash
# Test upload (přes aplikaci)
1. Přihlásit se jako worker
2. Vytvořit směnu
3. Přidat fotku
4. Zkontrolovat v Cloudinary Dashboard → Media Library
```

## 8. Monitoring

Cloudinary Dashboard → Analytics:
- Storage usage
- Bandwidth
- Transformations
- API calls

**Alert:** Nastavte si v Cloudinary notifikaci na 80% limitu.

## Troubleshooting

### Fotky se nenahrávají:
- Zkontrolujte Railway logs: `Backend služba → Deployments → View logs`
- Hledejte: "Cloudinary upload error"
- Ověřte credentials v Railway Variables

### "Cloudinary not configured":
- Backend nenašel CLOUDINARY_* variables
- Přidejte je do Railway Backend Variables
- Redeploy backend služby

### Staré fotky nefungují:
- Po migraci na Cloudinary jsou staré lokální fotky nedostupné
- Buď je ručně nahrajte na Cloudinary
- Nebo nechte - nové budou fungovat

## Náklady po migraci

**Railway:**
- Backend: $5-8/měsíc (beze změny)
- Frontend: $2-4/měsíc (beze změny)
- MySQL: $3-5/měsíc (beze změny)

**Cloudinary:**
- První rok: $0 (v rámci free tieru)
- Druhý rok+: ~$2-5/měsíc (podle spotřeby)

**CELKEM: $10-22/měsíc** (včetně Cloudinary)

---

## Quick Reference

**Získat credentials:**
```
https://cloudinary.com/console → Dashboard
```

**Railway Variables:**
```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Dokumentace:**
- https://cloudinary.com/documentation/node_integration
- https://cloudinary.com/documentation/image_transformations
