#!/bin/bash

# Stavební Aplikace - Restart Script
# Tento skript restartuje backend i frontend aplikaci

echo "╔════════════════════════════════════════════════════════╗"
echo "║   🔄 Stavební Aplikace - Restart                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Zastavení aplikace
./stop.sh

echo ""
echo "⏳ Čekám 3 sekundy před restartem..."
sleep 3
echo ""

# Spuštění aplikace
./start.sh
