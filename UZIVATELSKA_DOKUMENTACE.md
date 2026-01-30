# Stavební Aplikace - Uživatelská dokumentace

## Obsah
1. [Úvod](#úvod)
2. [Přihlášení a role uživatelů](#přihlášení-a-role-uživatelů)
3. [Dashboard - Přehled](#dashboard)
4. [Správa projektů](#správa-projektů)
5. [Správa směn](#správa-směn)
6. [Mimořádné práce](#mimořádné-práce)
7. [Správa materiálů](#správa-materiálů)
8. [Správa uživatelů](#správa-uživatelů)
9. [Notifikace](#notifikace)
10. [Časté problémy a řešení](#časté-problémy-a-řešení)

---

## Úvod

Stavební aplikace je komplexní systém pro řízení stavebních projektů, správu směn pracovníků, evidenci mimořádných prací a materiálů. Aplikace podporuje čtyři typy uživatelů s různými oprávněními.

**URL aplikace:** https://stavebniaplikace.up.railway.app

---

## Přihlášení a role uživatelů

### Přihlášení

1. Otevřete aplikaci v prohlížeči
2. Zadejte svůj **email** a **heslo**
3. Klikněte na tlačítko **"Přihlásit se"**

> **Poznámka:** Pokud zapomenete heslo, kontaktujte administrátora systému pro reset hesla.

### Role uživatelů

#### 🔴 Admin (Administrátor)
**Plná práva ke všem funkcím:**
- Správa všech projektů
- Správa všech směn
- Správa mimořádných prací
- Správa materiálů a ceníků
- Správa uživatelských účtů
- Přístup ke všem reportům

**Testovací účty:**
- `pecholtmartin+admin@gmail.com` / heslo: `admin123`
- `pecholtmarek+admin@gmail.com` / heslo: `admin123`

#### 🟡 Manager (Manažer)
**Správa projektů a koordinace:**
- Správa přiřazených projektů
- Schvalování mimořádných prací
- Přehled směn na projektech
- Export reportů
- Správa projektových materiálů

**Testovací účty:**
- `pecholtmartin+manager1@gmail.com` / heslo: `manager123`
- `pecholtmarek+manager1@gmail.com` / heslo: `manager123`

#### 🟢 Foreman (Stavbyvedoucí)
**Operativní řízení stavby:**
- Vytváření a správa směn
- Přidávání mimořádných prací
- Přiřazování pracovníků ke směnám
- Fotodokumentace prací
- Reportování materiálů

**Testovací účty:**
- `pecholtmartin+foreman1@gmail.com` / heslo: `foreman123`
- `pecholtmarek+foreman1@gmail.com` / heslo: `foreman123`

#### 🔵 Worker (Dělník)
**Základní přístup:**
- Zobrazení přiřazených směn
- Zobrazení úkolů
- Notifikace o nových směnách

**Testovací účty:**
- `pecholtmartin+worker1@gmail.com` až `worker5@gmail.com` / heslo: `worker123`
- `pecholtmarek+worker1@gmail.com` až `worker5@gmail.com` / heslo: `worker123`

---

## Dashboard

Po přihlášení se zobrazí **Dashboard** (hlavní stránka) s přehledem:

### Administrátor/Manažer
- **Statistiky projektů:** Počet aktivních, dokončených a připravovaných projektů
- **Statistiky směn:** Celkový počet směn, naplánované směny
- **Mimořádné práce:** Počet mimořádných prací a jejich stav
- **Rychlé akce:** Tlačítka pro vytvoření nového projektu, směny nebo mimořádné práce

### Stavbyvedoucí
- **Přehled přiřazených projektů**
- **Nadcházející směny**
- **Mimořádné práce k schválení**
- **Rychlé akce:** Vytvoření směny, přidání mimořádné práce

### Dělník
- **Moje směny:** Seznam přiřazených směn (dnešní, nadcházející)
- **Úkoly:** Seznam úkolů k vypracování
- **Notifikace:** Upozornění na nové směny

> **Tip:** Dashboard se automaticky aktualizuje podle vaší role.

---

## Správa projektů

*Pro administrátory a manažery*

### Zobrazení seznamu projektů

1. Klikněte na **"Projekty"** v levém menu
2. Zobrazí se tabulka všech projektů s informacemi:
   - **Číslo projektu** (např. PROJ-001)
   - **Název projektu**
   - **Adresa**
   - **Datum zahájení**
   - **Plánované ukončení**
   - **Stav** (Aktivní, Dokončeno, Příprava)
   - **Manažeři**
   - **Stavbyvedoucí**

### Vytvoření nového projektu

1. Klikněte na tlačítko **"+ Nový projekt"**
2. Vyplňte formulář:
   - **Název projektu:** Např. "Administrativní budova Ostrava"
   - **Číslo projektu:** Např. "PROJ-2026-001" (unikátní identifikátor)
   - **Adresa:** Např. "Hlavní třída 123, 702 00 Ostrava"
   - **Datum zahájení:** Vyberte datum ze kalendáře
   - **Plánované ukončení:** Vyberte datum ze kalendáře
   - **Stav:** Aktivní / Příprava / Dokončeno
   - **Manažeři:** Zaškrtněte jednoho nebo více manažerů (checkbox seznam)
   - **Stavbyvedoucí:** Zaškrtněte jednoho nebo více stavbyvedoucích

3. Klikněte **"Vytvořit"**

> **Poznámka:** Vybrané osoby budou zobrazeny s modrým pozadím.

### Editace projektu

1. V seznamu projektů klikněte na **"Upravit"** u příslušného projektu
2. Upravte potřebné údaje
3. Klikněte **"Uložit změny"**

> **Tip:** Při editaci se automaticky načtou aktuálně přiřazení manažeři a stavbyvedoucí.

### Mazání projektu

1. V seznamu projektů klikněte na **"Smazat"** u příslušného projektu
2. Potvrďte smazání

> **Varování:** Smazáním projektu se smažou i všechny související směny a mimořádné práce!

---

## Správa směn

*Pro administrátory, manažery a stavbyvedoucí*

### Zobrazení seznamu směn

1. Klikněte na **"Směny"** v levém menu
2. Zobrazí se seznam všech směn s informacemi:
   - **Projekt:** Název projektu
   - **Datum:** Datum směny
   - **Čas:** Začátek - konec (např. 07:00 - 15:00)
   - **Pracovníci:** Počet přiřazených pracovníků
   - **Úkoly:** Počet úkolů
   - **Stav:** Naplánováno / Probíhá / Dokončeno

### Vytvoření nové směny

1. Klikněte na tlačítko **"+ Nová směna"**
2. Vyplňte základní informace:
   - **Projekt:** Vyberte projekt ze seznamu
   - **Datum:** Vyberte datum směny
   - **Čas začátku:** Např. 07:00
   - **Čas konce:** Např. 15:00
   - **Pracovníci:** Zaškrtněte pracovníky, kteří budou na směně

3. **Přidání úkolů:**
   - Klikněte na **"+ Přidat úkol"**
   - Vyplňte:
     - **Název úkolu:** Např. "Betonáž základové desky"
     - **Popis:** Podrobný popis práce
     - **Je prioritní:** Zaškrtněte pro důležité úkoly
   - Můžete přidat více úkolů opakováním

4. **Instrukce pro pracovníky:**
   - Do pole "Instrukce pro pracovníky" napište obecné pokyny pro celou směnu
   - Např. "Nosit reflexní vesty, dodržovat BOZP"

5. Klikněte **"Vytvořit směnu"**

> **Automatické notifikace:** Všichni přiřazení pracovníci obdrží emailovou notifikaci s detaily směny, úkoly a instrukcemi.

### Detail směny

1. V seznamu směn klikněte na název projektu nebo datum
2. Zobrazí se detail směny s:
   - Kompletními informacemi o směně
   - Seznam přiřazených pracovníků
   - Seznam úkolů s možností označit jako hotové
   - Historie změn

### Editace směny

1. V detailu směny klikněte na **"Upravit"**
2. Upravte potřebné údaje
3. Můžete:
   - Přidat/odebrat pracovníky
   - Přidat/upravit/smazat úkoly
   - Změnit čas nebo datum
4. Klikněte **"Uložit změny"**

> **Poznámka:** Při změně údajů směny budou pracovníci upozorněni emailem.

---

## Mimořádné práce

*Pro všechny role s různými oprávněními*

### Co jsou mimořádné práce?

Mimořádné práce jsou neplánované úkoly mimo standard projekt, které vyžadují:
- Extra náklady
- Dodatečný materiál
- Změnu plánu
- Schválení manažerem

### Vytvoření mimořádné práce

1. Klikněte na **"Mimořádné práce"** v menu
2. Klikněte na **"+ Nová mimořádná práce"**
3. Vyplňte formulář:
   - **Projekt:** Vyberte projekt
   - **Název:** Stručný popis (např. "Dodatečné armování")
   - **Popis:** Podrobný popis práce a důvod
   - **Datum provedení:** Kdy byla práce provedena
   - **Odhadované náklady:** Částka v Kč
   - **Status:** Čeká na schválení / Schváleno / Zamítnuto

4. **Přidání fotek:**
   - Klikněte na **"Nahrát fotky"**
   - Vyberte jednu nebo více fotografií (jpg, png)
   - Max. 5 MB na fotku
   - Fotky se zobrazí jako náhledy

5. Klikněte **"Uložit"**

> **Workflow:** Stavbyvedoucí vytvoří mimořádnou práci → Manažer schválí/zamítne → Admin může upravovat vše.

### Přidání materiálů k mimořádné práci

1. Otevřete detail mimořádné práce
2. V sekci **"Použité materiály"** klikněte **"+ Přidat materiály"**
3. Vyberte materiály z ceníku:
   - Zaškrtněte materiály
   - Zadejte množství u každého materiálu
4. Klikněte **"Přidat vybrané materiály"**

> **Automatický výpočet:** Systém automaticky vypočítá celkovou cenu podle množství a jednotkových cen.

### Schvalování mimořádných prací

*Pro manažery a administrátory*

1. V seznamu mimořádných prací najděte položky se stavem **"Čeká na schválení"**
2. Klikněte na detail
3. Zkontrolujte:
   - Popis práce
   - Fotodokumentaci
   - Použité materiály
   - Celkové náklady
4. Klikněte na:
   - **"Schválit"** - práce bude provedena
   - **"Zamítnout"** - práce nebude provedena

### Export mimořádných prací

1. V seznamu mimořádných prací klikněte **"Exportovat do PDF"**
2. Vyberte:
   - Projekt (nebo všechny projekty)
   - Datum od - do
3. Stáhne se PDF report s:
   - Seznamem všech mimořádných prací
   - Fotodokumentací
   - Použitými materiály
   - Celkovými náklady

---

## Správa materiálů

*Pro administrátory*

### Zobrazení ceníku materiálů

1. Klikněte na **"Materiály"** v menu
2. Zobrazí se tabulka všech materiálů:
   - **SKU:** Jedinečný kód materiálu
   - **Název:** Název materiálu
   - **Popis:** Podrobný popis
   - **Kategorie:** Typ materiálu (Cement, Izolace, atd.)
   - **Jednotková cena:** Cena v Kč
   - **Jednotka:** ks, m³, m², kg

### Přidání nového materiálu

1. Klikněte na **"+ Nový materiál"**
2. Vyplňte formulář:
   - **Název:** Např. "Cement portlandský 25kg"
   - **SKU:** Např. "CEM-001" (unikátní kód)
   - **Popis:** Podrobný popis materiálu
   - **Kategorie:** Vyberte nebo zadejte novou kategorii
   - **Jednotková cena:** Cena v Kč (např. 189)
   - **Jednotka:** Vyberte (ks, m³, m², kg, l, m)
3. Klikněte **"Vytvořit"**

### Editace materiálu

1. V ceníku klikněte na **"Upravit"** u materiálu
2. Upravte potřebné údaje
3. Klikněte **"Uložit změny"**

> **Tip:** Při změně ceny se historická data nezmění, nová cena platí pro nové mimořádné práce.

### Mazání materiálu

1. V ceníku klikněte na **"Smazat"** u materiálu
2. Potvrďte smazání

> **Varování:** Nelze smazat materiál, který je použitý v některé mimořádné práci.

---

## Správa uživatelů

*Pro administrátory*

### Zobrazení seznamu uživatelů

1. Klikněte na **"Uživatelé"** v menu (v sekci Admin)
2. Zobrazí se tabulka všech uživatelů:
   - **Jméno a příjmení**
   - **Email**
   - **Telefon**
   - **Role:** Admin / Manager / Foreman / Worker
   - **Stav:** Aktivní / Neaktivní

### Vytvoření nového uživatele

1. Klikněte na **"+ Nový uživatel"**
2. Vyplňte formulář:
   - **Email:** Např. "novak@firma.cz"
   - **Heslo:** Dočasné heslo (doporučujeme aby si ho uživatel změnil)
   - **Jméno:** Křestní jméno
   - **Příjmení:** Příjmení
   - **Telefon:** Formát +420123456789
   - **Role:** Vyberte správnou roli
3. Klikněte **"Vytvořit"**

> **Poznámka:** Nový uživatel obdrží přihlašovací údaje emailem.

### Editace uživatele

1. V seznamu klikněte na **"Upravit"** u uživatele
2. Můžete změnit:
   - Email
   - Jméno a příjmení
   - Telefon
   - Roli
3. Klikněte **"Uložit změny"**

> **Varování:** Změna role ovlivní přístupová práva uživatele.

### Aktivace/Deaktivace uživatele

1. V seznamu klikněte na:
   - **"Deaktivovat"** u aktivního uživatele
   - **"Aktivovat"** u neaktivního uživatele

**Efekty deaktivace:**
- Uživatel se nemůže přihlásit
- Nezobrazuje se ve výběrových seznamech
- Historická data zůstávají zachována
- Lze kdykoliv znovu aktivovat

> **Tip:** Deaktivace je lepší než smazání, protože zachová historii.

### Reset hesla

1. V seznamu klikněte na **"Upravit"** u uživatele
2. Klikněte na **"Resetovat heslo"**
3. Zadejte nové dočasné heslo
4. Klikněte **"Uložit"**

> **Doporučení:** Informujte uživatele o novém heslu bezpečným způsobem.

---

## Notifikace

### Typy notifikací

#### 📧 Emailové notifikace

Systém automaticky odesílá emaily při:

1. **Vytvoření směny:**
   - Pracovníci obdrží email s detaily směny
   - Obsahuje: Projekt, datum, čas, úkoly, instrukce
   - Link na detail směny v aplikaci

2. **Změně směny:**
   - Pracovníci obdrží informaci o změně
   - Popis změn (čas, úkoly, atd.)

3. **Vytvoření mimořádné práce:**
   - Manažeři obdrží notifikaci o nové práci ke schválení
   - Obsahuje: Název, popis, náklady, fotky

4. **Schválení/Zamítnutí mimořádné práce:**
   - Stavbyvedoucí obdrží info o rozhodnutí manažera

#### 🔔 Notifikace v aplikaci

1. Klikněte na ikonu **zvonečku** v pravém horním rohu
2. Zobrazí se seznam notifikací
3. Kliknutím na notifikaci:
   - Označí se jako přečtená
   - Přesměruje na související stránku

> **Tip:** Nepřečtené notifikace jsou zvýrazněné tučně.

### Nastavení notifikací

*Funkce bude dostupná v budoucí verzi*

---

## Časté problémy a řešení

### Nemohu se přihlásit

**Možné příčiny:**
1. Špatné heslo → Kontaktujte administrátora pro reset
2. Neaktivní účet → Administrátor musí účet aktivovat
3. Neplatný email → Zkontrolujte překlepy

### Nejsou vidět všichni uživatelé v seznamech

**Důvod:** Deaktivovaní uživatelé se nezobrazují v checkboxech a dropdownech.

**Řešení:** 
- Admin musí uživatele aktivovat v sekci "Uživatelé"
- Klikněte na "Aktivovat" u příslušného uživatele

### Nedorazil email s notifikací

**Možné příčiny:**
1. Email je ve složce SPAM → Zkontrolujte spam
2. Nesprávný email v profilu → Admin upraví email v sekci "Uživatelé"
3. Problém s email službou → Kontaktujte technickou podporu

### Nevidím fotky u mimořádné práce

**Možné příčiny:**
1. Fotky jsou příliš velké (max 5 MB) → Zmenšete fotky
2. Nesprávný formát (pouze jpg, png) → Převeďte do správného formátu
3. Pomalé připojení → Počkejte na načtení

### Číslo projektu se neuloží

**Důvod:** Číslo projektu musí být unikátní.

**Řešení:** 
- Zkontrolujte, zda stejné číslo již není použito
- Zvolte jiné číslo projektu

### Nelze smazat materiál

**Důvod:** Materiál je použitý v některé mimořádné práci.

**Řešení:**
- Deaktivujte materiál místo smazání
- Nebo smažte všechny mimořádné práce používající tento materiál (nedoporučeno)

### Směna se neuloží bez úkolů

**Důvod:** Systém vyžaduje alespoň jeden úkol pro každou směnu.

**Řešení:**
- Přidejte alespoň jeden úkol před uložením
- Např. "Obecné stavební práce"

---

## Kontakt a technická podpora

**Email:** pecholtmartin@gmail.com  
**Telefon:** +420 123 456 789

**GitHub repository:** https://github.com/Pechy92/stavebniAplikace

**Provozní doba podpory:**
- Po-Pá: 8:00 - 17:00
- So-Ne: Pouze kritické problémy

---

## Verze dokumentace

**Verze:** 1.0  
**Datum:** 29. ledna 2026  
**Autor:** Systémový tým

---

## Přehled testovacích účtů

### Pro email: pecholtmartin@gmail.com

| Role | Email | Heslo | Jméno |
|------|-------|-------|-------|
| Admin | pecholtmartin+admin@gmail.com | admin123 | Admin Systému |
| Manager | pecholtmartin+manager1@gmail.com | manager123 | Martin Novák |
| Manager | pecholtmartin+manager2@gmail.com | manager123 | Jana Svobodová |
| Foreman | pecholtmartin+foreman1@gmail.com | foreman123 | Petr Dvořák |
| Foreman | pecholtmartin+foreman2@gmail.com | foreman123 | Eva Procházková |
| Worker | pecholtmartin+worker1@gmail.com | worker123 | Jan Veselý |
| Worker | pecholtmartin+worker2@gmail.com | worker123 | Pavel Černý |
| Worker | pecholtmartin+worker3@gmail.com | worker123 | Tomáš Bílý |
| Worker | pecholtmartin+worker4@gmail.com | worker123 | Michal Zelený |
| Worker | pecholtmartin+worker5@gmail.com | worker123 | Jakub Růžový |

### Pro email: pecholtmarek@gmail.com

| Role | Email | Heslo | Jméno |
|------|-------|-------|-------|
| Admin | pecholtmarek+admin@gmail.com | admin123 | Marek Správce |
| Manager | pecholtmarek+manager1@gmail.com | manager123 | Karel Manažer |
| Manager | pecholtmarek+manager2@gmail.com | manager123 | Lucie Koordinátorka |
| Foreman | pecholtmarek+foreman1@gmail.com | foreman123 | Josef Stavbyvedoucí |
| Foreman | pecholtmarek+foreman2@gmail.com | foreman123 | Alena Mistrová |
| Worker | pecholtmarek+worker1@gmail.com | worker123 | David Pracovník |
| Worker | pecholtmarek+worker2@gmail.com | worker123 | Marek Dělník |
| Worker | pecholtmarek+worker3@gmail.com | worker123 | Petr Zedník |
| Worker | pecholtmarek+worker4@gmail.com | worker123 | Lukáš Pomocník |
| Worker | pecholtmarek+worker5@gmail.com | worker123 | Vojtěch Řemeslník |

> **Poznámka:** Díky Gmail +alias funkci všechny emaily pro pecholtmartin+xxx@gmail.com přijdou na pecholtmartin@gmail.com a všechny emaily pro pecholtmarek+xxx@gmail.com přijdou na pecholtmarek@gmail.com.
