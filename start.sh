#!/bin/bash

# Stavební Aplikace - Start Script
# Tento skript spustí backend i frontend aplikaci

echo "╔════════════════════════════════════════════════════════╗"
echo "║   🏗️  Stavební Aplikace - Spuštění                    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Barvy pro výstup
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kontrola, zda běží MySQL
echo -e "${BLUE}🔍 Kontrola MySQL...${NC}"
if ! mysql -u root -e "SELECT 1" > /dev/null 2>&1; then
  echo -e "${RED}❌ MySQL neběží! Prosím spusťte MySQL server.${NC}"
  echo -e "${YELLOW}   macOS: brew services start mysql${NC}"
  echo -e "${YELLOW}   Linux: sudo systemctl start mysql${NC}"
  exit 1
fi
echo -e "${GREEN}✅ MySQL běží${NC}"

# Kontrola databáze
echo -e "${BLUE}🔍 Kontrola databáze stavebni_aplikace...${NC}"
if ! mysql -u root -e "USE stavebni_aplikace; SELECT 1" > /dev/null 2>&1; then
  echo -e "${RED}❌ Databáze stavebni_aplikace neexistuje!${NC}"
  echo -e "${YELLOW}   Prosím vytvořte databázi pomocí:${NC}"
  echo -e "${YELLOW}   mysql -u root < setup-db.sh${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Databáze existuje${NC}"

# Kontrola .env souboru
echo -e "${BLUE}🔍 Kontrola konfigurace...${NC}"
if [ ! -f "backend/.env" ]; then
  echo -e "${RED}❌ Soubor backend/.env neexistuje!${NC}"
  echo -e "${YELLOW}   Prosím vytvořte .env soubor v backend složce.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Konfigurace nalezena${NC}"

# Zastavení běžících procesů
echo -e "${BLUE}🛑 Zastavení starých procesů...${NC}"
pkill -9 -f "ts-node.*server.ts" 2>/dev/null
pkill -9 -f "nodemon" 2>/dev/null
pkill -9 -f "vite" 2>/dev/null
sleep 2
echo -e "${GREEN}✅ Staré procesy zastaveny${NC}"

# Spuštění backendu
echo ""
echo -e "${BLUE}🚀 Spouštím backend na portu 3001...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# Čekání na backend
echo -e "${YELLOW}⏳ Čekám na spuštění backendu...${NC}"
for i in {1..30}; do
  if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend běží (PID: $BACKEND_PID)${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ Backend se nepodařilo spustit!${NC}"
    echo -e "${YELLOW}   Zkontrolujte logy: tail -f logs/backend.log${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
  fi
  sleep 1
done

# Spuštění frontendu
echo ""
echo -e "${BLUE}🚀 Spouštím frontend na portu 5175...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

# Čekání na frontend
echo -e "${YELLOW}⏳ Čekám na spuštění frontendu...${NC}"
for i in {1..30}; do
  if lsof -ti:5175 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend běží (PID: $FRONTEND_PID)${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ Frontend se nepodařilo spustit!${NC}"
    echo -e "${YELLOW}   Zkontrolujte logy: tail -f logs/frontend.log${NC}"
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit 1
  fi
  sleep 1
done

# Výpis informací
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   ✅ Aplikace úspěšně spuštěna!                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🌐 Frontend:${NC} http://localhost:5175"
echo -e "${GREEN}🔧 Backend API:${NC} http://localhost:3001"
echo -e "${GREEN}📊 Health Check:${NC} http://localhost:3001/health"
echo ""
echo -e "${BLUE}📋 Příkazy:${NC}"
echo -e "  ${YELLOW}./stop.sh${NC}      - Zastavit aplikaci"
echo -e "  ${YELLOW}./restart.sh${NC}   - Restartovat aplikaci"
echo -e "  ${YELLOW}./status.sh${NC}    - Zkontrolovat stav"
echo ""
echo -e "${BLUE}📝 Logy:${NC}"
echo -e "  ${YELLOW}tail -f logs/backend.log${NC}   - Backend logy"
echo -e "  ${YELLOW}tail -f logs/frontend.log${NC}  - Frontend logy"
echo ""
echo -e "${GREEN}🎉 Aplikace je připravena k testování!${NC}"
echo ""
