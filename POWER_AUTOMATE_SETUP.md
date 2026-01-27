# Power Automate Setup - Návod

## Co aplikace posílá na webhook

Když dojde ke změně statusu vícepráce nebo přiřazení směny, aplikace pošle POST request s těmito daty:

```json
{
  "recipientEmail": "pecholtmartin+user3@gmail.com",
  "subject": "Změna statusu vícepráce",
  "htmlBody": "<html>...</html>",
  "notificationType": "extra_work_status_change",
  "relatedEntityType": "extra_work",
  "relatedEntityId": 123,
  "timestamp": "2026-01-27T15:30:00.000Z"
}
```

## Jak nastavit Power Automate Flow

### Krok 1: Vytvoř nový Flow
1. Jdi na https://make.powerautomate.com
2. Klikni na **+ Create** → **Automated cloud flow**
3. Pojmenuj ho např. "Stavební aplikace - Notifikace"
4. Vyber trigger: **When a HTTP request is received**
5. Klikni **Create**

### Krok 2: Nastav HTTP trigger
1. V triggeru **When a HTTP request is received** klikni na **Generate from sample**
2. Vlož tento JSON:
```json
{
  "recipientEmail": "test@example.com",
  "subject": "Test předmět",
  "htmlBody": "<p>Test tělo emailu</p>",
  "notificationType": "extra_work_status_change",
  "relatedEntityType": "extra_work",
  "relatedEntityId": 1,
  "timestamp": "2026-01-27T12:00:00Z"
}
```
3. Klikni **Done** - Power Automate vygeneruje schéma

### Krok 3: Přidej akci pro poslání emailu

1. Klikni **+ New step**
2. Vyhledej **Office 365 Outlook** → **Send an email (V2)**
3. Nastav:
   - **To**: vložit dynamic content `recipientEmail`
   - **Subject**: vložit dynamic content `subject`
   - **Body**: vložit dynamic content `htmlBody`
   - **Is HTML**: Zapnout (Yes)
4. (Volitelně) **From (Send as)**: Můžeš nastavit konkrétní odesílací schránku, pokud máš více účtů

> **Poznámka:** Email se pošle z tvého M365 účtu, který máš připojený k Power Automate. Můžeš použít jakoukoliv schránku z tvé M365 organizace.

### Krok 4: Ulož a získej webhook URL
1. Klikni **Save** v pravém horním rohu
2. Flow se uloží a vygeneruje **HTTP POST URL**
3. Zkopíruj tuto URL (začíná `https://prod-...`)

### Krok 5: Nastav v aplikaci

**Lokálně** - upravit `.env`:
```bash
POWER_AUTOMATE_WEBHOOK=https://prod-XX.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...
```

**Railway** - přidat proměnnou:
- Name: `POWER_AUTOMATE_WEBHOOK`
- Value: tvoje webhook URL

## Testování

Po nastavení zkus odeslat vícepráci stavbyvedoucímu - měl by přijít email i Teams zpráva (podle toho, co jsi nastavil).

## Výhody tohoto řešení

✅ **Neomezené emaily** - Microsoft 365 Business Standard nemá praktické limity na odesílání
✅ **Firemní schránka** - Emaily jdou z tvé firemní schránky, vypadají profesionálně
✅ **Zdarma** - Power Automate je součástí M365 Business Standard
✅ **Spolehlivé** - Microsoft infrastruktura s 99.9% SLA
✅ **Flexibilní** - Později můžeš přidat Teams, SharePoint, nebo jiné akce
✅ **Jednoduché** - Nastavení zabere pár minut
