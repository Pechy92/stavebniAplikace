#!/bin/bash

# Stavební Aplikace - Status Script
# Tento skript kontroluje stav aplikace

echo "╔════════════════════════════════════════════════════════╗"
echo "║   📊 Stavební Aplikace - Stav                          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Barvy pro výstup
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

ALL_OK=1

# Kontrola MySQL
echo -e "${BLUE}🔍 MySQL Server:${NC}"
if mysql -u root -e "SELECT 1" > /dev/null 2>&1; then
  echo -e "   ${GREEN}✅ Běží${NC}"
  
  # Kontrola databáze
  if mysql -u root -e "USE stavebni_aplikace; SELECT 1" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Databáze stavebni_aplikace existuje${NC}"
    
    # Počet uživatelů
    USER_COUNT=$(mysql -u root -e "USE stavebni_aplikace; SELECT COUNT(*) FROM users;" -s -N 2>/dev/null)
    echo -e "   ${BLUE}👥 Počet uživatelů: ${USER_COUNT}${NC}"
  else
    echo -e "   ${RED}❌ Databáze stavebni_aplikace neexistuje${NC}"
    ALL_OK=0
  fi
else
  echo -e "   ${RED}❌ Neběží${NC}"
  ALL_OK=0
fi

echo ""

# Kontrola backendu
echo -e "${BLUE}🔧 Backend (port 3001):${NC}"
if lsof -ti:3001 > /dev/null 2>&1; then
  echo -e "   ${GREEN}✅ Běží${NC}"
  
  # PID backendu
  BACKEND_PID=$(lsof -ti:3001)
  echo -e "   ${BLUE}🆔 PID: ${BACKEND_PID}${NC}"
  
  # Health check
  if command -v curl > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null)
    if [ $? -eq 0 ]; then
      echo -e "   ${GREEN}✅ Health check OK${NC}"
      echo -e "   ${BLUE}🌐 URL: http://localhost:3001${NC}"
    else
      echo -e "   ${RED}⚠️  Health check selhal${NC}"
      ALL_OK=0
    fi
  fi
else
  echo -e "   ${RED}❌ Neběží${NC}"
  ALL_OK=0
fi

echo ""

# Kontrola frontendu
echo -e "${BLUE}🌐 Frontend (port 5175):${NC}"
if lsof -ti:5175 > /dev/null 2>&1; then
  echo -e "   ${GREEN}✅ Běží${NC}"
  
  # PID frontendu
  FRONTEND_PID=$(lsof -ti:5175)
  echo -e "   ${BLUE}🆔 PID: ${FRONTEND_PID}${NC}"
  echo -e "   ${BLUE}🌐 URL: http://localhost:5175${NC}"
else
  echo -e "   ${RED}❌ Neběží${NC}"
  ALL_OK=0
fi

echo ""

# Kontrola logů
echo -e "${BLUE}📝 Logy:${NC}"
if [ -f "logs/backend.log" ]; then
  BACKEND_LOG_SIZE=$(du -h logs/backend.log | cut -f1)
  BACKEND_LOG_LINES=$(wc -l < logs/backend.log)
  echo -e "   ${BLUE}📄 Backend log: ${BACKEND_LOG_SIZE} (${BACKEND_LOG_LINES} řádků)${NC}"
else
  echo -e "   ${YELLOW}⚠️  Backend log neexistuje${NC}"
fi

if [ -f "logs/frontend.log" ]; then
  FRONTEND_LOG_SIZE=$(du -h logs/frontend.log | cut -f1)
  FRONTEND_LOG_LINES=$(wc -l < logs/frontend.log)
  echo -e "   ${BLUE}📄 Frontend log: ${FRONTEND_LOG_SIZE} (${FRONTEND_LOG_LINES} řádků)${NC}"
else
  echo -e "   ${YELLOW}⚠️  Frontend log neexistuje${NC}"
fi

echo ""

# Celkový stav
if [ $ALL_OK -eq 1 ]; then
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║   ✅ Aplikace běží správně                             ║"
  echo "╚════════════════════════════════════════════════════════╝"
else
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║   ⚠️  Aplikace má problémy                             ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
  echo -e "${YELLOW}💡 Spusťte aplikaci pomocí: ./start.sh${NC}"
fi

echo ""
