#!/bin/bash

# Script para probar todos los endpoints públicos (sin autenticación/cookies)
# Estos endpoints no requieren login

export SENTRY_DSN="http://localhost:3001"

echo "=========================================="
echo "Testing Public Endpoints (No Auth)"
echo "=========================================="
echo ""

# ==========================================
# HEALTH & STATUS
# ==========================================
echo "📊 Health & Status"
echo "=========================================="

echo "1. Health Check"
curl -s $SENTRY_DSN/api/debug/health
echo ""

echo "2. Root Endpoint"
curl -s $SENTRY_DSN/
echo ""

# ==========================================
# DEBUG - LOGS
# ==========================================
echo "📝 Debug - Logs"
echo "=========================================="

echo "3. Simple Logs"
curl -s $SENTRY_DSN/api/debug/log
echo ""

echo "4. Multiple Logs"
curl -s $SENTRY_DSN/api/debug/log/multiple
echo ""

# ==========================================
# DEBUG - HTTP ERRORS
# ==========================================
echo "⚠️  Debug - HTTP Errors"
echo "=========================================="

echo "5. 400 Bad Request"
curl -s $SENTRY_DSN/api/debug/error/bad-request
echo ""

echo "6. 404 Not Found"
curl -s $SENTRY_DSN/api/debug/error/not-found
echo ""

echo "7. 500 Server Error"
curl -s $SENTRY_DSN/api/debug/error/server-error
echo ""

# ==========================================
# DEBUG - JAVASCRIPT ERRORS
# ==========================================
echo "🔴 Debug - JavaScript Errors"
echo "=========================================="

echo "8. TypeError"
curl -s $SENTRY_DSN/api/debug/error/type-error
echo ""

echo "9. ReferenceError"
curl -s $SENTRY_DSN/api/debug/error/reference-error
echo ""

echo "10. Uncaught Exception"
curl -s $SENTRY_DSN/api/debug/error/uncaught
echo ""

echo "11. Async Error"
curl -s $SENTRY_DSN/api/debug/error/async
echo ""

# ==========================================
# DEBUG - DATABASE & CUSTOM ERRORS
# ==========================================
echo "💾 Debug - Database & Custom Errors"
echo "=========================================="

echo "12. Database Error"
curl -s $SENTRY_DSN/api/debug/error/database
echo ""

echo "13. Custom Error (default)"
curl -s $SENTRY_DSN/api/debug/error/custom
echo ""

echo "14. Custom Error (with userId and action)"
curl -s "$SENTRY_DSN/api/debug/error/custom?userId=USER123&action=delete"
echo ""

echo "15. Custom Error (with different action)"
curl -s "$SENTRY_DSN/api/debug/error/custom?userId=USER456&action=update"
echo ""

# ==========================================
# PUBLIC API ENDPOINTS
# ==========================================
echo "🌐 Public API Endpoints"
echo "=========================================="

echo "16. Get Courses (public)"
curl -s $SENTRY_DSN/api/Course
echo ""

echo "17. Login Attempt (invalid credentials)"
curl -s -X POST $SENTRY_DSN/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrongpassword"}'
echo ""

# ==========================================
# UNAUTHORIZED ACCESS TESTS
# ==========================================
echo "🔒 Unauthorized Access Tests (Should Fail)"
echo "=========================================="

echo "18. Access Users without auth (should fail)"
curl -s $SENTRY_DSN/api/User
echo ""

echo "19. Access Classes without auth (should fail)"
curl -s $SENTRY_DSN/api/Class
echo ""

echo "20. Access Classrooms without auth (should fail)"
curl -s $SENTRY_DSN/api/Classroom
echo ""

echo "21. Access Schedule without auth (should fail)"
curl -s $SENTRY_DSN/api/Schedule
echo ""

# ==========================================
# INVALID ENDPOINTS (404 Tests)
# ==========================================
echo "❌ Invalid Endpoints (404 Tests)"
echo "=========================================="

echo "22. Non-existent endpoint"
curl -s $SENTRY_DSN/api/nonexistent
echo ""

echo "23. Invalid API route"
curl -s $SENTRY_DSN/api/invalid/path/here
echo ""

echo "24. Random path"
curl -s $SENTRY_DSN/random/endpoint
echo ""

echo ""
echo "=========================================="
echo "✓ All public endpoint tests completed!"
echo ""
echo "Total requests: 24"
echo "  - Debug routes: 14"
echo "  - Public API: 2"
echo "  - Auth tests: 4"
echo "  - 404 tests: 3"
echo ""
echo "Check your Sentry dashboard for all events!"
echo "=========================================="
