#!/bin/bash

# Script para probar todos los endpoints de la API y generar logs en Sentry
# Asegúrate de que el servidor esté corriendo: node server.js

BASE_URL="http://localhost:3001"
COOKIE_FILE="cookies.txt"

echo "=========================================="
echo "Testing API Endpoints with Sentry Logging"
echo "=========================================="
echo ""

# Limpiar archivo de cookies
rm -f $COOKIE_FILE

# ==========================================
# 1. AUTHENTICATION - Login
# ==========================================
echo "1. Testing Login Endpoint"
echo "=========================================="

echo "  → POST /api/login (valid credentials)"
curl -s -c $COOKIE_FILE -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@student.edu","password":"password123"}' | jq .
echo ""

echo "  → POST /api/login (invalid credentials - should fail)"
curl -s -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@test.com","password":"wrongpassword"}' | jq .
echo ""

echo "  → POST /api/login (missing fields - should fail)"
curl -s -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}' | jq .
echo ""

# ==========================================
# 2. USER ENDPOINTS
# ==========================================
echo "2. Testing User Endpoints"
echo "=========================================="

echo "  → GET /api/User (with authentication)"
curl -s -b $COOKIE_FILE "$BASE_URL/api/User" | jq .
echo ""

echo "  → GET /api/User (without authentication - should fail)"
curl -s "$BASE_URL/api/User" | jq .
echo ""

echo "  → GET /api/User/:email (with authentication)"
curl -s -b $COOKIE_FILE "$BASE_URL/api/User/alice@student.edu" | jq .
echo ""

echo "  → GET /api/User/:email (non-existent user - should fail)"
curl -s -b $COOKIE_FILE "$BASE_URL/api/User/nonexistent@test.com" | jq .
echo ""

echo "  → POST /api/User (create user - may require admin)"
curl -s -b $COOKIE_FILE -X POST "$BASE_URL/api/User" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@test.com",
    "password": "test123",
    "userType": 1
  }' | jq .
echo ""

# ==========================================
# 3. CLASS ENDPOINTS
# ==========================================
echo "3. Testing Class Endpoints"
echo "=========================================="

echo "  → GET /api/Class (with authentication)"
curl -s -b $COOKIE_FILE "$BASE_URL/api/Class" | jq .
echo ""

echo "  → GET /api/Class (without authentication - should fail)"
curl -s "$BASE_URL/api/Class" | jq .
echo ""

echo "  → POST /api/Class (create class - may require admin)"
curl -s -b $COOKIE_FILE -X POST "$BASE_URL/api/Class" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Class",
    "schedule": "Monday 10:00 AM"
  }' | jq .
echo ""

# ==========================================
# 4. COURSE ENDPOINTS
# ==========================================
echo "4. Testing Course Endpoints"
echo "=========================================="

echo "  → GET /api/Course (list all courses)"
curl -s "$BASE_URL/api/Course" | jq .
echo ""

echo "  → POST /api/Course (create course - may require admin)"
curl -s -b $COOKIE_FILE -X POST "$BASE_URL/api/Course" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Course",
    "code": "TEST101",
    "credits": 3
  }' | jq .
echo ""

# ==========================================
# 5. CLASSROOM ENDPOINTS
# ==========================================
echo "5. Testing Classroom Endpoints"
echo "=========================================="

echo "  → GET /api/Classroom (with authentication)"
curl -s -b $COOKIE_FILE "$BASE_URL/api/Classroom" | jq .
echo ""

echo "  → GET /api/Classroom (without authentication - should fail)"
curl -s "$BASE_URL/api/Classroom" | jq .
echo ""

echo "  → POST /api/Classroom (create classroom - may require admin)"
curl -s -b $COOKIE_FILE -X POST "$BASE_URL/api/Classroom" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Room 101",
    "capacity": 30,
    "building": "Main Building"
  }' | jq .
echo ""

# ==========================================
# 6. SCHEDULE ENDPOINTS
# ==========================================
echo "6. Testing Schedule Endpoints"
echo "=========================================="

echo "  → GET /api/Schedule (with authentication)"
curl -s -b $COOKIE_FILE "$BASE_URL/api/Schedule" | jq .
echo ""

echo "  → GET /api/Schedule (without authentication - should fail)"
curl -s "$BASE_URL/api/Schedule" | jq .
echo ""

echo "  → POST /api/Schedule (create schedule - may require admin)"
curl -s -b $COOKIE_FILE -X POST "$BASE_URL/api/Schedule" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Schedule",
    "startDate": "2025-01-01",
    "endDate": "2025-06-30"
  }' | jq .
echo ""

echo "  → POST /api/Schedule (invalid data - should fail)"
curl -s -b $COOKIE_FILE -X POST "$BASE_URL/api/Schedule" \
  -H "Content-Type: application/json" \
  -d '{"invalidField": "test"}' | jq .
echo ""

# ==========================================
# 7. INVALID ENDPOINTS (404 Errors)
# ==========================================
echo "7. Testing Invalid Endpoints (404 Errors)"
echo "=========================================="

echo "  → GET /api/nonexistent"
curl -s "$BASE_URL/api/nonexistent" | jq .
echo ""

echo "  → GET /api/User/invalid/route"
curl -s -b $COOKIE_FILE "$BASE_URL/api/User/invalid/route" | jq .
echo ""

# ==========================================
# 8. MALFORMED REQUESTS
# ==========================================
echo "8. Testing Malformed Requests"
echo "=========================================="

echo "  → POST /api/User (invalid JSON - should fail)"
curl -s -b $COOKIE_FILE -X POST "$BASE_URL/api/User" \
  -H "Content-Type: application/json" \
  -d '{invalid json}' 2>&1 | head -1
echo ""

echo "  → POST /api/Class (missing required fields - should fail)"
curl -s -b $COOKIE_FILE -X POST "$BASE_URL/api/Class" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
echo ""

# ==========================================
# 9. LOGOUT
# ==========================================
echo "9. Testing Logout"
echo "=========================================="

echo "  → GET /api/login/logout"
curl -s -b $COOKIE_FILE "$BASE_URL/api/login/logout" | jq .
echo ""

# Limpiar archivo de cookies
rm -f $COOKIE_FILE

echo ""
echo "=========================================="
echo "All API endpoint tests completed!"
echo "Check your Sentry dashboard for logs and errors"
echo "=========================================="
