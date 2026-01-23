# Návod na připojení k databázi v Sequel Ace

## Krok za krokem:

### 1. Otevřete Sequel Ace
Pokud už je otevřený, měli byste vidět okno pro připojení.

### 2. V připojovacím okně vyplňte:

**Záložka: Standard (TCP/IP)**

- **Name:** Stavební Aplikace
- **Host:** 127.0.0.1 (nebo localhost)
- **Username:** root
- **Password:** (nechte prázdné - neklikejte do pole)
- **Database:** stavebni_aplikace
- **Port:** 3306

### 3. Test připojení
- Klikněte na tlačítko "Test Connection"
- Mělo by se objevit "Connection succeeded"

### 4. Připojte se
- Klikněte na "Connect"

## Pokud to stále nefunguje:

### Alternativa 1: Připojení přes Socket
Místo Standard zkuste **Socket**:
- **Name:** Stavební Aplikace (Socket)
- **Username:** root  
- **Password:** (prázdné)
- **Database:** stavebni_aplikace
- **Socket:** /tmp/mysql.sock

### Alternativa 2: Použít TablePlus
```bash
# Stáhněte TablePlus
open https://tableplus.com
```

### Alternativa 3: Terminál
```bash
# Otevřít MySQL klienta
mysql -u root stavebni_aplikace

# Pak můžete psát SQL příkazy:
SHOW TABLES;
SELECT * FROM users;
```

## Rychlá kontrola připojení:
```bash
mysql -u root -e "SELECT VERSION();"
```
