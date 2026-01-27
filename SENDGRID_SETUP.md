# SendGrid Email Setup

## Registrace (2 minuty)

1. **Jdi na** https://signup.sendgrid.com/
2. **Vyplň registraci:**
   - Email: pecholtmartin@gmail.com
   - Password: (nějaké bezpečné heslo)
   - Potvrdíš email
3. **Ověření účtu:**
   - SendGrid tě možná požádá o telefonní číslo
   - Vyplníš základní info o firmě (název, adresa)

## Vytvoření API klíče (1 minuta)

1. **Po přihlášení:**
   - Jdi na **Settings** → **API Keys** (vlevo v menu)
   - Klikni na tlačítko **"Create API Key"**
2. **Nastav:**
   - API Key Name: `Stavebni-Aplikace`
   - API Key Permissions: **Full Access** (nebo jen "Mail Send" stačí)
   - Klikni **"Create & View"**
3. **DŮLEŽITÉ:** Zkopíruj API klíč hned (ukáže se jen jednou!)
   - Formát: `SG.xxxxxxxxxxxxxxxxxxxxxxxxx`

## Ověření odesílatele

1. **Jdi na** Settings → **Sender Authentication**
2. **Single Sender Verification:**
   - Klikni **"Verify a Single Sender"**
   - From Name: `Stavební Aplikace`
   - From Email: `pecholtmartin@gmail.com` (tvůj Gmail)
   - Reply To: `pecholtmartin@gmail.com`
   - Vyplň firmu a adresu
3. **Potvrď email** - SendGrid pošle potvrzovací email na tvůj Gmail
4. **Klikni na link v emailu** - teprve pak můžeš posílat

## Railway Configuration

V Railway nastav tyto proměnné:

```
SENDER_EMAIL=pecholtmartin@gmail.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
```

**ODSTRANIT** staré proměnné:
- `SENDER_PASSWORD`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`

## Limity Free Tier

- **100 emailů/den** zdarma navždy
- Bez kreditní karty
- Žádné časové omezení

## Test

Po nastavení zkus test email:
```bash
curl -X POST https://tvoje-aplikace.railway.app/api/admin/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"pecholtmartin@gmail.com"}'
```

Měl by přijít email od `pecholtmartin@gmail.com` do tvé schránky!
