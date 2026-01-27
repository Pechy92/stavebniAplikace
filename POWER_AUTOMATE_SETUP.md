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

### Krok 3: Přidej akce pro notifikace

#### Varianta A: Poslat Email
1. Klikni **+ New step**
2. Vyhledej **Office 365 Outlook** → **Send an email (V2)**
3. Nastav:
   - **To**: vložit dynamic content `recipientEmail`
   - **Subject**: vložit dynamic content `subject`
   - **Body**: vložit dynamic content `htmlBody`
   - **Is HTML**: Zapnout (Yes)

#### Varianta B: Poslat Teams zprávu
1. Klikni **+ New step**
2. Vyhledej **Microsoft Teams** → **Post message in a chat or channel**
3. Nastav:
   - **Post as**: Flow bot
   - **Post in**: Channel
   - **Team**: Vyber svůj tým
   - **Channel**: Vyber kanál
   - **Message**: 
     ```
     📧 Nová notifikace ze stavební aplikace
     
     Příjemce: @{triggerBody()?['recipientEmail']}
     Předmět: @{triggerBody()?['subject']}
     Typ: @{triggerBody()?['notificationType']}
     
     Čas: @{triggerBody()?['timestamp']}
     ```

#### Varianta C: Oboje (Email + Teams)
Přidej obě akce za sebe - nejdříve Email, pak Teams

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

✅ **Žádné limity** - Power Automate má velmi vysoké limity (tisíce requestů/den)
✅ **Email + Teams** - můžeš posílat na oba kanály najednou
✅ **Zdarma** - základní Power Automate je součástí Microsoft 365
✅ **Flexibilní** - můžeš přidat další akce (uložit do SharePointu, poslat SMS, atd.)
✅ **Spolehlivé** - Microsoft infrastruktura
