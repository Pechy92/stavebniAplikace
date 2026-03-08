# 👥 Testovací účty - Rychlá reference

## 🔓 Přihlašovací údaje

### 🔴 Admin (Správce)
```
📧 Email:  admin@example.com
🔑 Heslo:  admin123
```
**Může:**
- ✅ Správa všech uživatelů
- ✅ Správa všech projektů
- ✅ Správa materiálů
- ✅ Schvalování víceprací
- ✅ Přístup ke všemu

---

### 🟠 Manager (Vedoucí projektu)
```
📧 Email:  manager1@example.com  nebo  manager2@example.com
🔑 Heslo:  manager123
```
**Může:**
- ✅ Správa přiřazených projektů
- ✅ Plánování směn
- ✅ Přiřazování dělníků a stavbyvedoucích
- ✅ Schvalování víceprací
- ✅ Správa materiálů na projektu

---

### 🟡 Foreman (Stavbyvedoucí)
```
📧 Email:  foreman1@example.com  nebo  foreman2@example.com
🔑 Heslo:  foreman123
```
**Může:**
- ✅ Vytváření směn
- ✅ Přiřazování úkolů dělníkům
- ✅ Kontrola víceprací
- ✅ Vrácení víceprací k úpravě
- ✅ Schvalování víceprací na vyšší úroveň

---

### 🟢 Worker (Dělník)
```
📧 Email:  worker1@example.com  až  worker6@example.com
🔑 Heslo:  worker123  (pro všechny)
```
**Může:**
- ✅ Zobrazení vlastních směn
- ✅ Vytváření víceprací
- ✅ Nahrávání fotografií
- ✅ Úprava konceptů víceprací
- ✅ Zobrazení historie vlastních víceprací

---

## 🔄 Schvalovací workflow

### Vícepráce - Životní cyklus:

1. **Worker vytvoří vícepráci** ✏️
   - Status: `draft` (koncept)
   - Může upravovat a nahrávat fotografie
   
2. **Worker odešle ke schválení** 📤
   - Status: `submitted` (odesláno)
   - Už nemůže upravovat

3. **Foreman kontroluje** 👀
   - Status: `under_review` (v kontrole)
   - Může:
     - ✅ Schválit → `approved_by_foreman`
     - ❌ Vrátit k úpravě → `returned_to_worker`
     - 🚫 Zamítnout → `rejected`

4. **Manager/Admin schvaluje** ✅
   - Status: `approved_by_manager` nebo `approved_by_admin`
   - Finální schválení

---

## 🧪 Testovací scénáře

### Scénář 1: Kompletní vícepráce
1. Přihlaste se jako **worker1@example.com**
2. Vytvořte novou vícepráci
3. Přidejte popis, hodiny, materiály
4. Nahrajte fotografie
5. Odešlete ke schválení
6. Odhlaste se
7. Přihlaste se jako **foreman1@example.com**
8. Zkontrolujte vícepráci
9. Schvalte nebo vraťte k úpravě

### Scénář 2: Plánování směny
1. Přihlaste se jako **manager1@example.com**
2. Vytvořte nový projekt (pokud neexistuje)
3. Naplánujte směnu
4. Přiřaďte stavbyvedoucího (foreman1)
5. Přiřaďte dělníky (worker1, worker2)
6. Odhlaste se
7. Přihlaste se jako **worker1@example.com**
8. Zkontrolujte, že vidíte novou směnu

### Scénář 3: Správa uživatelů
1. Přihlaste se jako **admin@example.com**
2. Přejděte do Admin sekce
3. Vytvořte nového uživatele
4. Upravte existujícího uživatele
5. Zkontrolujte seznam všech uživatelů

### Scénář 4: Materiály
1. Přihlaste se jako **admin@example.com**
2. Přidejte nový materiál (např. "Cement", "CEM", 25kg)
3. Odhlaste se
4. Přihlaste se jako **worker1@example.com**
5. Vytvořte vícepráci
6. Přidejte materiál z databáze
7. Přidejte vlastní text materiálu

---

## 🎯 Rychlý start

### Pro testování základních funkcí:
```bash
# 1. Spusťte aplikaci
./start.sh

# 2. Otevřete prohlížeč
http://localhost:5175

# 3. Přihlaste se jako:
admin@example.com / admin123
```

### Pro testování víceprací:
```bash
# 1. Přihlaste se jako worker1
worker1@example.com / worker123

# 2. Vytvořte vícepráci + fotky

# 3. Přihlaste se jako foreman1
foreman1@example.com / foreman123

# 4. Schvalte vícepráci
```

---

## 📊 Co testovat

### ✅ Základní funkce
- [ ] Přihlášení všemi rolemi
- [ ] Tmavý/světlý režim
- [ ] Změna jazyků (CS/EN/UK)
- [ ] Responsivní design (mobil/tablet/desktop)

### ✅ Projekty
- [ ] Vytvoření projektu (Manager/Admin)
- [ ] Úprava projektu
- [ ] Přiřazení managera
- [ ] Přiřazení stavbyvedoucího

### ✅ Směny
- [ ] Vytvoření směny (Manager/Foreman)
- [ ] Přiřazení dělníků
- [ ] Přidání úkolů
- [ ] Zobrazení detailu směny
- [ ] Nahrání fotek ke směně

### ✅ Vícepráce
- [ ] Vytvoření vícepráce (Worker)
- [ ] Přidání materiálů
- [ ] Nahrání fotografií
- [ ] Odeslání ke schválení
- [ ] Kontrola stavbyvedoucím
- [ ] Vrácení k úpravě
- [ ] Schválení managrem
- [ ] Zobrazení historie

### ✅ Materiály
- [ ] Přidání materiálu (Admin)
- [ ] Úprava materiálu
- [ ] Použití v vícepráci
- [ ] Filtrování materiálů

### ✅ Uživatelé
- [ ] Vytvoření uživatele (Admin)
- [ ] Úprava profilu
- [ ] Změna hesla
- [ ] Změna role
- [ ] Deaktivace uživatele

### ✅ Notifikace
- [ ] Zobrazení notifikací
- [ ] Označení jako přečtené
- [ ] Filtrování notifikací

---

## 🐛 Hlášení problémů

Pokud najdete chybu, poznamenejte si:

1. **Co jste dělali?** (krok za krokem)
2. **Co se stalo?** (chybová hláška, nesprávné chování)
3. **Co jste očekávali?**
4. **Jakou roli jste používali?**
5. **Screenshot** (pokud možno)

**Logy:**
```bash
# Backend logy
tail -50 logs/backend.log

# Frontend logy (v konzoli prohlížeče - F12)
```

---

## 💡 Tipy

- **Tmavý režim:** Klikněte na měsíc/slunce v pravém horním rohu
- **Jazyk:** Přepínač vlajek v pravém horním rohu
- **Odhlášení:** Vaše jméno → Odhlásit se
- **Notifikace:** Ikona zvonku v pravém horním rohu
- **Profil:** Vaše jméno v pravém horním rohu

---

**Veselé testování! 🎉**
