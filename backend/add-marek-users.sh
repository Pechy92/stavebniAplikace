#!/bin/bash

# Script pro přidání testovacích uživatelů pro pecholtmarek@gmail.com do Railway databáze

echo "🚀 Přidání testovacích uživatelů pro pecholtmarek@gmail.com"
echo "============================================================"
echo ""
echo "📝 Připojovací údaje k Railway MySQL databázi najdete na:"
echo "   https://railway.app → Váš projekt → MySQL → Variables"
echo ""
echo "Příklad:"
echo "   MYSQLHOST=junction.proxy.rlwy.net"
echo "   MYSQLPORT=52695"
echo "   MYSQLUSER=root"
echo "   MYSQLPASSWORD=xxxxx"
echo "   MYSQLDATABASE=railway"
echo ""

read -p "DB_HOST (např. junction.proxy.rlwy.net): " DB_HOST
read -p "DB_PORT (např. 52695): " DB_PORT
read -p "DB_USER (např. root): " DB_USER
read -sp "DB_PASSWORD: " DB_PASSWORD
echo ""
read -p "DB_NAME (např. railway): " DB_NAME

echo ""
echo "🔗 Připojuji se k databázi $DB_HOST:$DB_PORT..."

DB_HOST=$DB_HOST DB_PORT=$DB_PORT DB_USER=$DB_USER DB_PASSWORD=$DB_PASSWORD DB_NAME=$DB_NAME node add-marek-users-railway.js
