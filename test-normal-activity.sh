#!/bin/bash

# Script para simular actividad normal de usuarios
# Genera logs de actividad típica en Sentry

BASE_URL="http://localhost:3001"
COOKIE_FILE="cookies_normal.txt"

echo "=========================================="
echo "Simulating Normal User Activity"
echo "=========================================="
echo ""

# Limpiar cookies
rm -f $COOKIE_FILE

# ==========================================
# Simulación de Usuario 1: Alice (Estudiante)
# ==========================================
echo "👤 User: Alice (Student)"
echo "------------------------------------------"

echo "1. Alice logs in..."
curl -s -c $COOKIE_FILE -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@student.edu","password":"password123"}' > /dev/null
echo "   ✓ Logged in successfully"

echo "2. Alice views her courses..."
curl -s -b $COOKIE_FILE "$BASE_URL/api/Course" > /dev/null
echo "   ✓ Viewed course list"

echo "3. Alice checks her schedule..."
curl -s -b $COOKIE_FILE "$BASE_URL/api/Schedule" > /dev/null
echo "   ✓ Checked schedule"

echo "4. Alice views class information..."
curl -s -b $COOKIE_FILE "$BASE_URL/api/Class" > /dev/null
echo "   ✓ Viewed classes"

echo "5. Alice logs out..."
curl -s -b $COOKIE_FILE "$BASE_URL/api/login/logout" > /dev/null
echo "   ✓ Logged out"
echo ""

sleep 1

# ==========================================
# Simulación de Usuario 2: Bob (Profesor)
# ==========================================
echo "👤 User: Bob (Professor)"
echo "------------------------------------------"

echo "1. Bob logs in..."
curl -s -c $COOKIE_FILE -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@professor.edu","password":"profpass456"}' > /dev/null
echo "   ✓ Logged in successfully"

echo "2. Bob views all users..."
curl -s -b $COOKIE_FILE "$BASE_URL/api/User" > /dev/null
echo "   ✓ Viewed user list"

echo "3. Bob checks classroom availability..."
curl -s -b $COOKIE_FILE "$BASE_URL/api/Classroom" > /dev/null
echo "   ✓ Checked classrooms"

echo "4. Bob views course schedule..."
curl -s -b $COOKIE_FILE "$BASE_URL/api/Schedule" > /dev/null
echo "   ✓ Viewed schedule"

echo "5. Bob logs out..."
curl -s -b $COOKIE_FILE "$BASE_URL/api/login/logout" > /dev/null
echo "   ✓ Logged out"
echo ""

sleep 1

# ==========================================
# Simulación de Errores Comunes
# ==========================================
echo "⚠️  Common Error Scenarios"
echo "------------------------------------------"

echo "1. Failed login attempt (wrong password)..."
curl -s -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@student.edu","password":"wrongpassword"}' > /dev/null
echo "   ✓ Invalid credentials error logged"

echo "2. Unauthorized access attempt..."
curl -s "$BASE_URL/api/User" > /dev/null
echo "   ✓ Unauthorized access error logged"

echo "3. Accessing non-existent resource..."
curl -s -b $COOKIE_FILE "$BASE_URL/api/User/nonexistent@test.com" > /dev/null
echo "   ✓ Not found error logged"

echo "4. Invalid endpoint access..."
curl -s "$BASE_URL/api/invalidendpoint" > /dev/null
echo "   ✓ 404 error logged"

echo ""

# Limpiar cookies
rm -f $COOKIE_FILE

echo "=========================================="
echo "✓ Normal activity simulation completed!"
echo "Check Sentry for:"
echo "  - Login events"
echo "  - Page views"
echo "  - API calls"
echo "  - Authentication errors"
echo "  - 404 errors"
echo "=========================================="
