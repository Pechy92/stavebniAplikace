#!/bin/bash

# Stavební Aplikace - Stop Script
# Tento skript zastaví backend i frontend aplikaci

echo "╔════════════════════════════════════════════════════════╗"
echo "║   🛑 Stavební Aplikace - Zastavení                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Barvy pro výstup
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

STOPPED=0

# Zastavení backendu
if lsof -ti:3001 > /dev/null 2>&1; then
  echo -e "${YELLOW}🛑 Zastavuji backend (port 3001)...${NC}"
  lsof -ti:3001 | xargs kill -9 2>/dev/null
  pkill -9 -f "ts-node.*server.ts" 2>/dev/null
  pkill -9 -f "nodemon.*backend" 2>/dev/null
  echo -e "${GREEN}✅ Backend zastaven${NC}"
  STOPPED=1
else
  echo -e "${YELLOW}ℹ️  Backend neběží${NC}"
fi

# Zastavení frontendu
if lsof -ti:5175 > /dev/null 2>&1; then
  echo -e "${YELLOW}🛑 Zastavuji frontend (port 5175)...${NC}"
  lsof -ti:5175 | xargs kill -9 2>/dev/null
  pkill -9 -f "vite" 2>/dev/null
  echo -e "${GREEN}✅ Frontend zastaven${NC}"
  STOPPED=1
else
  echo -e "${YELLOW}ℹ️  Frontend neběží${NC}"
fi

# Vyčištění PID souborů
rm -f logs/backend.pid logs/frontend.pid 2>/dev/null

sleep 2

# Kontrola, že vše je zastaveno
if lsof -ti:3001 > /dev/null 2>&1 || lsof -ti:5175 > /dev/null 2>&1; then
  echo ""
  echo -e "${RED}⚠️  Nějaké procesy stále běží!${NC}"
  echo -e "${YELLOW}   Zkuste ručně: pkill -9 -f \"ts-node|vite\"${NC}"
  exit 1
fi

echo ""
if [ $STOPPED -eq 1 ]; then
  echo -e "${GREEN}✅ Aplikace úspěšně zastavena${NC}"
else
  echo -e "${YELLOW}ℹ️  Žádná aplikace neběžela${NC}"
fi
echo ""
