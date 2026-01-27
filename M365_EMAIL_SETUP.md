# Microsoft 365 Email Setup - Návod

## Nastavení Azure AD aplikace pro odesílání emailů

### Krok 1: Vytvoř Azure AD aplikaci
1. Jdi na https://portal.azure.com
2. Přihlaš se s M365 Business Standard účtem
3. V menu vlevo vyber **Azure Active Directory** (nebo **Microsoft Entra ID**)
4. Klikni na **App registrations** (Registrace aplikací)
5. Klikni **+ New registration** (Nová registrace)
6. Vyplň:
   - **Name**: Stavební aplikace - Email Service
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: nech prázdné
7. Klikni **Register**

### Krok 2: Získej Client ID a Tenant ID
1. Po vytvoření aplikace se zobrazí stránka **Overview**
2. Zkopíruj:
   - **Application (client) ID** → tohle je tvůj `AZURE_CLIENT_ID`
   - **Directory (tenant) ID** → tohle je tvůj `AZURE_TENANT_ID`

### Krok 3: Vytvoř Client Secret
1. V levém menu klikni na **Certificates & secrets** (Certifikáty a tajné klíče)
2. V záložce **Client secrets** klikni **+ New client secret**
3. Popis: "Email service secret"
4. Expirace: **24 months** (nebo podle potřeby)
5. Klikni **Add**
6. **DŮLEŽITÉ**: Hned zkopíruj **Value** (zobrazí se jen jednou!) → tohle je tvůj `AZURE_CLIENT_SECRET`

### Krok 4: Nastav API oprávnění
1. V levém menu klikni na **API permissions** (Oprávnění rozhraní API)
2. Klikni **+ Add a permission** (Přidat oprávnění)
3. Vyber **Microsoft Graph**
4. Vyber **Application permissions** (ne Delegated!)
5. Vyhledej a zaškrtni:
   - **Mail.Send** (umožňuje posílat emaily jako aplikace)
6. Klikni **Add permissions**
7. **KRITICKÉ**: Klikni **Grant admin consent for [tvoje organizace]** (Udělit souhlas správce)
   - Potvrdí **Yes**
   - Musíš být admin, jinak požádej IT administrátora

### Krok 5: Nastav v aplikaci

**Lokálně** - upravit `.env`:
```bash
AZURE_TENANT_ID=12345678-1234-1234-1234-123456789abc
AZURE_CLIENT_ID=87654321-4321-4321-4321-cba987654321
AZURE_CLIENT_SECRET=abc~123DEF456ghi789JKL~xyz
SENDER_EMAIL=noreply@vasefirma.cz
```

**Railway** - přidat proměnné:
- `AZURE_TENANT_ID` = tvoje Tenant ID
- `AZURE_CLIENT_ID` = tvoje Client ID
- `AZURE_CLIENT_SECRET` = tvoje Client Secret
- `SENDER_EMAIL` = email schránka, ze které se budou posílat emaily (např. noreply@firma.cz)

> **SENDER_EMAIL** musí být existující schránka v tvé M365 organizaci!

### Krok 6: Testování
1. Restartuj backend
2. Vytvoř vícepráci a odešli ji stavbyvedoucímu
3. Email by měl přijít z `SENDER_EMAIL` na příjemce

## Výhody tohoto řešení

✅ **Neomezené emaily** - M365 Business Standard nemá praktické limity
✅ **Firemní schránka** - Profesionální vzhled s vaší doménou
✅ **Bezpečné** - OAuth2 autentizace, žádná hesla v kódu
✅ **Spolehlivé** - Microsoft infrastruktura
✅ **Jednoduché** - Nastavení jednou, pak už funguje automaticky
✅ **Žádné další služby** - Vše v rámci M365, žádné třetí strany

## Řešení problémů

### "Insufficient privileges"
- Chybí admin consent pro Mail.Send oprávnění
- Řešení: Požádej IT admina, aby klikl na "Grant admin consent"

### "Mailbox not found"
- SENDER_EMAIL neexistuje v organizaci
- Řešení: Použij existující M365 schránku (třeba vytvořit noreply@firma.cz)

### "AADSTS700016: Application not found"
- Špatné AZURE_CLIENT_ID nebo AZURE_TENANT_ID
- Řešení: Zkontroluj hodnoty v Azure Portal
