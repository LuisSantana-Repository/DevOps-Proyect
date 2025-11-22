#!/bin/bash

# ============================================================
# MongoDB Atlas Seed Script
# ============================================================
# This script populates your MongoDB Atlas database with seed data
# from the /db/seeds directory.
#
# Usage:
#   1. Make sure you have .env file with MONGODB_URI configured
#   2. Run: chmod +x scripts/seed-atlas.sh
#   3. Run: ./scripts/seed-atlas.sh
#
# Requirements:
#   - mongosh (MongoDB Shell) installed
#   - Valid MongoDB Atlas connection string in .env or environment
# ============================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SEEDS_DIR="$PROJECT_ROOT/db/seeds"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      MongoDB Atlas Database Seeding Script           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================
# 1. Load environment variables
# ============================================================
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${GREEN}✓${NC} Loading environment variables from .env file..."
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
else
    echo -e "${YELLOW}⚠${NC}  .env file not found. Using environment variables."
fi

# ============================================================
# 2. Check for MongoDB connection string
# ============================================================
if [ -z "$MONGODB_URI" ]; then
    # Try to construct from components
    if [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ] && [ -n "$DB_HOST" ]; then
        DB_NAME="${DB_NAME:-app}"
        DB_OPTIONS="${DB_OPTIONS:-retryWrites=true&w=majority}"
        MONGODB_URI="mongodb+srv://$DB_USER:$DB_PASSWORD@$DB_HOST/$DB_NAME?$DB_OPTIONS"
        echo -e "${GREEN}✓${NC} Constructed MongoDB URI from environment components"
    else
        echo -e "${RED}✗${NC} Error: MongoDB connection string not found!"
        echo -e "${YELLOW}Please set one of the following:${NC}"
        echo -e "  1. MONGODB_URI environment variable with full connection string"
        echo -e "  2. DB_USER, DB_PASSWORD, DB_HOST environment variables"
        echo -e ""
        echo -e "${YELLOW}Example in .env file:${NC}"
        echo -e "  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority"
        exit 1
    fi
fi

# Extract database name from URI
if [[ $MONGODB_URI =~ mongodb.*://[^/]+/([^?]+) ]]; then
    DB_NAME="${BASH_REMATCH[1]}"
else
    DB_NAME="${DB_NAME:-app}"
fi

echo -e "${GREEN}✓${NC} MongoDB URI configured"
echo -e "${BLUE}ℹ${NC}  Database: ${YELLOW}$DB_NAME${NC}"
echo ""

# ============================================================
# 3. Check if mongosh is installed
# ============================================================
if ! command -v mongosh &> /dev/null; then
    echo -e "${RED}✗${NC} Error: mongosh (MongoDB Shell) is not installed!"
    echo -e "${YELLOW}Please install it from:${NC}"
    echo -e "  https://www.mongodb.com/docs/mongodb-shell/install/"
    echo -e ""
    echo -e "${YELLOW}Installation commands:${NC}"
    echo -e "  # Ubuntu/Debian:"
    echo -e "  wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -"
    echo -e "  echo \"deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse\" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list"
    echo -e "  sudo apt-get update"
    echo -e "  sudo apt-get install -y mongodb-mongosh"
    echo -e ""
    echo -e "  # macOS:"
    echo -e "  brew install mongosh"
    echo -e ""
    echo -e "  # Or download from: https://www.mongodb.com/try/download/shell"
    exit 1
fi

echo -e "${GREEN}✓${NC} mongosh is installed ($(mongosh --version | head -1))"
echo ""

# ============================================================
# 4. Test connection to MongoDB Atlas
# ============================================================
echo -e "${BLUE}Testing connection to MongoDB Atlas...${NC}"
if mongosh "$MONGODB_URI" --quiet --eval "db.runCommand({ ping: 1 })" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Successfully connected to MongoDB Atlas!"
else
    echo -e "${RED}✗${NC} Failed to connect to MongoDB Atlas"
    echo -e "${YELLOW}Please check:${NC}"
    echo -e "  1. Your connection string is correct"
    echo -e "  2. Your IP address is whitelisted in MongoDB Atlas Network Access"
    echo -e "  3. Your database user credentials are correct"
    exit 1
fi
echo ""

# ============================================================
# 5. Confirm before seeding
# ============================================================
echo -e "${YELLOW}⚠${NC}  ${RED}WARNING:${NC} This will insert seed data into your database: ${YELLOW}$DB_NAME${NC}"
echo -e "${YELLOW}⚠${NC}  If the data already exists, this may create duplicates."
echo ""
read -p "$(echo -e ${YELLOW}Continue with seeding? [y/N]:${NC} )" -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}ℹ${NC}  Seeding cancelled."
    exit 0
fi
echo ""

# ============================================================
# 6. Import seed data in correct order
# ============================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Starting Database Seeding                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Collection order matters for referential integrity
declare -a COLLECTIONS=("users" "classes" "classrooms" "courses" "schedules")

for collection in "${COLLECTIONS[@]}"; do
    seed_file="$SEEDS_DIR/${collection}.json"

    if [ ! -f "$seed_file" ]; then
        echo -e "${YELLOW}⚠${NC}  Skipping ${collection}: seed file not found"
        continue
    fi

    echo -e "${BLUE}→${NC} Importing ${YELLOW}${collection}${NC} collection..."

    # Import the data with Extended JSON conversion
    result=$(mongosh "$MONGODB_URI" --quiet --eval "
        // Function to recursively convert Extended JSON to native MongoDB types
        function convertExtendedJSON(obj) {
            if (obj === null || obj === undefined) return obj;

            // Handle ObjectId
            if (obj.\$oid) {
                return new ObjectId(obj.\$oid);
            }

            // Handle arrays
            if (Array.isArray(obj)) {
                return obj.map(item => convertExtendedJSON(item));
            }

            // Handle objects
            if (typeof obj === 'object') {
                const converted = {};
                for (const key in obj) {
                    converted[key] = convertExtendedJSON(obj[key]);
                }
                return converted;
            }

            return obj;
        }

        // Read and convert the JSON data
        const rawData = $(cat "$seed_file");
        const data = convertExtendedJSON(rawData);

        try {
            const result = db.${collection}.insertMany(data, { ordered: false });
            print('SUCCESS:' + result.insertedCount);
        } catch (err) {
            if (err.code === 11000) {
                // Duplicate key error - count how many were actually inserted
                const inserted = err.result?.nInserted || 0;
                print('PARTIAL:' + inserted);
            } else {
                print('ERROR:' + err.message);
            }
        }
    " 2>&1)

    # Parse the result
    if echo "$result" | grep -q "SUCCESS:"; then
        count=$(echo "$result" | grep "SUCCESS:" | cut -d':' -f2)
        echo -e "${GREEN}✓${NC} Inserted ${count} documents"
    elif echo "$result" | grep -q "PARTIAL:"; then
        count=$(echo "$result" | grep "PARTIAL:" | cut -d':' -f2)
        echo -e "${YELLOW}⚠${NC}  Inserted ${count} documents (some duplicates skipped)"
    elif echo "$result" | grep -q "ERROR:"; then
        error=$(echo "$result" | grep "ERROR:" | cut -d':' -f2-)
        echo -e "${RED}✗${NC} Error: ${error}"
    fi

    echo -e "${GREEN}✓${NC} ${collection} collection processed"
    echo ""
done

# ============================================================
# 7. Verify seeded data
# ============================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Database Summary                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

for collection in "${COLLECTIONS[@]}"; do
    count=$(mongosh "$MONGODB_URI" --quiet --eval "print(db.${collection}.countDocuments())")
    printf "${BLUE}%-15s${NC} : ${GREEN}%s${NC} documents\n" "$collection" "$count"
done

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✓ Seeding Completed Successfully!           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}ℹ${NC}  Your MongoDB Atlas database is now populated with seed data."
echo -e "${BLUE}ℹ${NC}  Database: ${YELLOW}$DB_NAME${NC}"
echo ""
