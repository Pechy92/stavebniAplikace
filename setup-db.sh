#!/bin/bash

echo "🔍 Kontroluji MySQL instalaci..."

# Zkus najít MySQL
if command -v mysql &> /dev/null; then
    echo "✅ MySQL je nainstalován"
    MYSQL_CMD="mysql"
elif [ -f "/usr/local/mysql/bin/mysql" ]; then
    echo "✅ MySQL nalezen v /usr/local/mysql/bin/"
    MYSQL_CMD="/usr/local/mysql/bin/mysql"
elif [ -f "/opt/homebrew/bin/mysql" ]; then
    echo "✅ MySQL nalezen v /opt/homebrew/bin/"
    MYSQL_CMD="/opt/homebrew/bin/mysql"
else
    echo "❌ MySQL není nainstalován!"
    echo ""
    echo "Pro instalaci MySQL na macOS:"
    echo "1. Pomocí Homebrew: brew install mysql"
    echo "2. Nebo stáhněte z: https://dev.mysql.com/downloads/mysql/"
    echo ""
    echo "Po instalaci spusťte MySQL server:"
    echo "  brew services start mysql"
    echo "  nebo"
    echo "  sudo /usr/local/mysql/support-files/mysql.server start"
    echo ""
    exit 1
fi

echo ""
echo "📦 Vytvářím databázi 'stavebni_aplikace'..."

# Vytvoř databázi
$MYSQL_CMD -u root -e "CREATE DATABASE IF NOT EXISTS stavebni_aplikace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Databáze úspěšně vytvořena"
else
    echo "⚠️  Pokus s -u root selhal, zkouším bez hesla..."
    $MYSQL_CMD -u root -p -e "CREATE DATABASE IF NOT EXISTS stavebni_aplikace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    
    if [ $? -eq 0 ]; then
        echo "✅ Databáze úspěšně vytvořena"
        echo "⚠️  UPOZORNĚNÍ: MySQL vyžaduje heslo. Nezapomeňte ho nastavit v backend/.env"
    else
        echo "❌ Nepodařilo se vytvořit databázi"
        echo "   Zkuste ručně spustit:"
        echo "   mysql -u root -p"
        echo "   CREATE DATABASE stavebni_aplikace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        exit 1
    fi
fi

echo ""
echo "✨ Databáze je připravena!"
echo ""
echo "Další kroky:"
echo "1. Zkontrolujte backend/.env (zejména DB_PASSWORD)"
echo "2. Spusťte: cd backend && npm run dev"
echo "3. V druhém terminálu: cd frontend && npm run dev"
