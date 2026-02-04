#!/bin/bash

# Skript pro manuální zálohu Railway databáze
# Použití: ./manual-backup.sh

# Barvy pro výstup
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🗄️  Záloha Railway databáze${NC}"
echo "=================================="

# Kontrola mysql client
if ! command -v mysqldump &> /dev/null; then
    echo -e "${RED}❌ mysqldump není nainstalován${NC}"
    echo "Instalace:"
    echo "  macOS: brew install mysql-client"
    echo "  Linux: sudo apt-get install mysql-client"
    exit 1
fi

# Vytvoření složky pro zálohy
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Název souboru se současným datem
BACKUP_FILE="$BACKUP_DIR/railway_backup_$(date +%Y%m%d_%H%M%S).sql"

# Railway DB credentials (můžete zadat přímo nebo načíst z .env)
DB_HOST="${RAILWAY_DB_HOST:-gondola.proxy.rlwy.net}"
DB_PORT="${RAILWAY_DB_PORT:-37102}"
DB_USER="${RAILWAY_DB_USER:-root}"
DB_NAME="${RAILWAY_DB_NAME:-railway}"

# Prompt pro heslo (bezpečnější než ukládat do souboru)
echo -e "${YELLOW}Zadejte heslo k Railway databázi:${NC}"
read -s DB_PASSWORD
echo ""

echo -e "${YELLOW}📥 Stahuji data z databáze...${NC}"

# Vytvoření zálohy
if mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${GREEN}✅ Záloha vytvořena: $BACKUP_FILE${NC}"
    
    # Velikost souboru
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}📦 Velikost: $FILE_SIZE${NC}"
    
    # Komprese
    echo -e "${YELLOW}🗜️  Kompresuji...${NC}"
    gzip "$BACKUP_FILE"
    COMPRESSED_FILE="$BACKUP_FILE.gz"
    COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    
    echo -e "${GREEN}✅ Komprimováno: $COMPRESSED_FILE${NC}"
    echo -e "${GREEN}📦 Velikost po kompresi: $COMPRESSED_SIZE${NC}"
    
    # Výpis všech záloh
    echo ""
    echo -e "${YELLOW}📋 Existující zálohy:${NC}"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    
    echo ""
    echo -e "${GREEN}✨ Hotovo!${NC}"
else
    echo -e "${RED}❌ Chyba při vytváření zálohy${NC}"
    echo "Zkontrolujte připojení a přihlašovací údaje"
    rm -f "$BACKUP_FILE" 2>/dev/null
    exit 1
fi
