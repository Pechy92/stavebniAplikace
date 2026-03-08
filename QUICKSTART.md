# ⚡ QUICKSTART - Začněte testovat hned!

**Aplikace je připravena k okamžitému testování!** 🎉

## 🚀 Rychlé spuštění (30 sekund)

### 1. Spusťte aplikaci
```bash
./start.sh
```

### 2. Otevřete prohlížeč
```
http://localhost:5175
```

### 3. Přihlaste se
```
Email: admin@example.com
Heslo: admin123
```

**Hotovo!** Můžete začít testovat. 🎊

---

## 🎯 Co dál?

### První kroky po přihlášení:

#### 👤 Jako Admin (admin@example.com)
1. **Přejděte do Admin sekce** (v menu)
2. **Prozkoumejte:**
   - 👥 Správa uživatelů - vidíte všech 10 testovacích uživatelů
   - 📦 Správa materiálů - přidejte nový materiál
   - 📁 Správa projektů - vytvořte nový projekt

#### 👨‍💼 Vyzkoušejte jiné role
1. **Odhlaste se** (pravý horní roh → Odhlásit se)
2. **Přihlaste se jako:**
   - 🟠 **Manager:** `manager1@example.com` / `manager123`
   - 🟡 **Foreman:** `foreman1@example.com` / `foreman123`
   - 🟢 **Worker:** `worker1@example.com` / `worker123`

#### 📸 Vyzkoušejte vícepráce s fotografiemi
1. Přihlaste se jako **worker1** (`worker1@example.com` / `worker123`)
2. Klikněte na **"Nová vícepráce"**
3. Vyplňte:
   - Název: "Testovací vícepráce"
   - Popis: "Dodatečná práce na projektu"
   - Hodiny: 8
   - Vyberte materiály nebo přidejte vlastní
4. **Nahrajte fotografie** (📷 sekce)
5. **Odešlete ke schválení**
6. Odhlaste se a přihlaste jako **foreman1**
7. Zkontrolujte a schvalte vícepráci

---

## 📋 Kompletní seznam testovacích účtů

| Role | Email | Heslo |
|------|-------|-------|
| 🔴 **Admin** | admin@example.com | admin123 |
| 🟠 **Manager 1** | manager1@example.com | manager123 |
| 🟠 **Manager 2** | manager2@example.com | manager123 |
| 🟡 **Foreman 1** | foreman1@example.com | foreman123 |
| 🟡 **Foreman 2** | foreman2@example.com | foreman123 |
| 🟢 **Worker 1** | worker1@example.com | worker123 |
| 🟢 **Worker 2** | worker2@example.com | worker123 |
| 🟢 **Worker 3** | worker3@example.com | worker123 |
| 🟢 **Worker 4** | worker4@example.com | worker123 |
| 🟢 **Worker 5** | worker5@example.com | worker123 |
| 🟢 **Worker 6** | worker6@example.com | worker123 |

> 💡 **Tip:** Otevřete více oken prohlížeče v anonymním režimu a přihlaste se různými rolemi najednou!

---

## 🎨 Funkce k vyzkoušení

### ✨ Design a UX
- [ ] **Glassmorphism design** - moderní skleněný efekt všude
- [ ] **Dark Mode** - přepněte měsíc/slunce v pravém horním rohu
- [ ] **Vícejazyčnost** - přepněte vlajky (🇨🇿 CS / 🇬🇧 EN / 🇺🇦 UK)
- [ ] **Responsivní design** - zkuste na mobilu/tabletu

### 👥 Správa uživatelů (Admin)
- [ ] Vytvořit nového uživatele
- [ ] Upravit existujícího uživatele
- [ ] Změnit roli uživatele
- [ ] Zobrazit seznam všech uživatelů

### 📁 Projekty (Manager/Admin)
- [ ] Vytvořit nový projekt
- [ ] Přiřadit manažera k projektu
- [ ] Přiřadit stavbyvedoucího (foreman)
- [ ] Zobrazit detail projektu

### 📅 Směny (Manager/Foreman)
- [ ] Naplánovat novou směnu
- [ ] Přiřadit dělníky ke směně
- [ ] Přidat úkoly
- [ ] Nahrát fotografie ze směny
- [ ] Zobrazit detail směny

### 🔧 Vícepráce (Worker → Foreman → Manager)
- [ ] Worker vytvoří vícepráci
- [ ] Worker nahraje fotografie
- [ ] Worker přidá materiály
- [ ] Worker odešle ke schválení
- [ ] Foreman zkontroluje
- [ ] Foreman schválí nebo vrátí
- [ ] Manager finálně schválí
- [ ] Zobrazit historii víceprací

### 📦 Materiály (Admin)
- [ ] Přidat nový materiál (název, jednotka, množství)
- [ ] Upravit materiál
- [ ] Použít materiál ve vícepráci
- [ ] Přidat vlastní text materiálu

### 🔔 Notifikace (všechny role)
- [ ] Zobrazit notifikace (ikona zvonku)
- [ ] Označit jako přečtené
- [ ] Filtrovat notifikace

---

## 🛠️ Správa aplikace

### Základní příkazy

```bash
# Spustit aplikaci
./start.sh

# Zastavit aplikaci
./stop.sh

# Restartovat aplikaci
./restart.sh

# Zkontrolovat stav
./status.sh
```

### Zobrazení logů

```bash
# Backend logy (real-time)
tail -f logs/backend.log

# Frontend logy (real-time)
tail -f logs/frontend.log

# Oba najednou
tail -f logs/backend.log logs/frontend.log
```

### Kontrola stavu

```bash
# Rychlá kontrola
./status.sh

# Detailní kontrola
curl http://localhost:3001/health
```

---

## ❓ Časté otázky

### Q: Aplikace nejde spustit
**A:** Zkontrolujte, že běží MySQL:
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Q: Nemohu se přihlásit
**A:** Zkontrolujte:
1. Používáte správné přihlašovací údaje (viz tabulka výše)
2. Backend běží: `./status.sh`
3. Health check: `curl http://localhost:3001/health`

### Q: Port již používán
**A:** Zastavte všechny procesy:
```bash
./stop.sh
# Nebo manuálně:
lsof -ti:3001,5175 | xargs kill -9
```

### Q: Kde najdu fotografie?
**A:** Fotografie jsou nahrány do Cloudinary (viz backend/.env)
- Lokálně se ukládají v `backend/uploads/` a `backend/temp/uploads/`

### Q: Jak resetovat hesla?
**A:** Spusťte seed script:
```bash
cd backend
npm run seed
```

---

## 📚 Dokumentace

Pro více informací:

- **📘 README.md** - Kompletní dokumentace projektu
- **🚀 DEPLOYMENT.md** - Detailní návod na nasazení a troubleshooting
- **👥 TEST-ACCOUNTS.md** - Detailní popis všech testovacích účtů a scénářů
- **📊 DATABASE_CONNECTION.md** - Návod na připojení k databázi

---

## 🎮 Testovací scénáře

### 🟢 Scénář 1: Základní tour (5 minut)
1. Přihlaste se jako admin
2. Projeďte všechny sekce v menu
3. Přepněte dark mode
4. Přepněte jazyk
5. Zkontrolujte responsivní design (zmenšete okno)

### 🟡 Scénář 2: Kompletní workflow vícepráce (10 minut)
1. **Worker** vytvoří vícepráci + fotky → odešle
2. **Foreman** zkontroluje → schválí
3. **Manager** finálně schválí
4. Worker vidí schválenou vícepráci v historii

### 🟠 Scénář 3: Správa projektu (15 minut)
1. **Admin** vytvoří nový projekt
2. **Admin** přiřadí managera
3. **Manager** přiřadí foremana
4. **Foreman** naplánuje směnu
5. **Foreman** přiřadí workery
6. **Worker** vidí směnu v kalendáři

---

## 🎉 Shrnutí

✅ **Aplikace běží na:**
- Frontend: http://localhost:5175
- Backend: http://localhost:3001

✅ **Testovací účty připraveny:**
- 1× Admin, 2× Manager, 2× Foreman, 6× Worker

✅ **Vše funguje:**
- ✅ Databáze s testovacími daty
- ✅ Backend API
- ✅ Frontend aplikace
- ✅ Nahrávání fotografií
- ✅ Schvalovací workflow
- ✅ Multi-role systém

---

**🚀 Veselé testování!**

Pokud narazíte na problém, podívejte se do DEPLOYMENT.md nebo zkontrolujte logy:
```bash
tail -f logs/backend.log
```

---

**Poslední kontrola:** 15. února 2026
**Status:** ✅ Připraveno k testování
