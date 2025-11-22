#!/bin/bash

# ============================================================
# MongoDB Atlas Database Clear Script
# ============================================================
# This script clears all collections in your MongoDB Atlas database
#
# Usage:
#   chmod +x scripts/clear-atlas.sh
#   ./scripts/clear-atlas.sh
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║      MongoDB Atlas Database Clear Script             ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Load .env if exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Check for connection string
if [ -z "$MONGODB_URI" ]; then
    if [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ] && [ -n "$DB_HOST" ]; then
        DB_NAME="${DB_NAME:-app}"
        DB_OPTIONS="${DB_OPTIONS:-retryWrites=true&w=majority}"
        MONGODB_URI="mongodb+srv://$DB_USER:$DB_PASSWORD@$DB_HOST/$DB_NAME?$DB_OPTIONS"
    else
        echo -e "${RED}✗${NC} Error: MongoDB connection string not found!"
        exit 1
    fi
fi

# Extract database name
if [[ $MONGODB_URI =~ mongodb.*://[^/]+/([^?]+) ]]; then
    DB_NAME="${BASH_REMATCH[1]}"
else
    DB_NAME="${DB_NAME:-app}"
fi

echo -e "${RED}⚠ WARNING: This will DELETE ALL DATA from database: ${YELLOW}$DB_NAME${NC}"
echo -e "${RED}⚠ This action CANNOT be undone!${NC}"
echo ""
read -p "$(echo -e ${RED}Are you SURE you want to continue? Type 'yes' to confirm:${NC} )" confirmation

if [ "$confirmation" != "yes" ]; then
    echo -e "${BLUE}ℹ${NC}  Operation cancelled."
    exit 0
fi
echo ""

# Collections to clear
declare -a COLLECTIONS=("users" "classes" "classrooms" "courses" "schedules")

echo -e "${BLUE}Clearing collections...${NC}"
echo ""

for collection in "${COLLECTIONS[@]}"; do
    echo -e "${BLUE}→${NC} Clearing ${YELLOW}${collection}${NC}..."

    result=$(mongosh "$MONGODB_URI" --quiet --eval "
        const result = db.${collection}.deleteMany({});
        print(result.deletedCount);
    " 2>&1 | tail -1)

    echo -e "${GREEN}✓${NC} Deleted ${result} documents from ${collection}"
done

echo ""
echo -e "${GREEN}✓ Database cleared successfully!${NC}"
echo ""
