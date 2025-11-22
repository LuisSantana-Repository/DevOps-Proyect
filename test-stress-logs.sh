#!/bin/bash

# Script de stress test para generar muchos logs en Sentry
# Útil para probar el volumen de logs y rendimiento

export SENTRY_DSN="http://localhost:3001"

echo "=========================================="
echo "Sentry Stress Test - Generating Logs"
echo "=========================================="
echo ""

# ==========================================
# Test 1: Generar muchos logs de diferentes niveles
# ==========================================
echo "📊 Test 1: Generating 20 log entries..."
for i in {1..20}; do
  curl -s "$SENTRY_DSN/api/debug/log" > /dev/null &
  echo -n "."
done
wait
echo " ✓ Done"
echo ""

# ==========================================
# Test 2: Generar múltiples errores
# ==========================================
echo "🔴 Test 2: Generating 15 error entries..."
for i in {1..5}; do
  curl -s "$SENTRY_DSN/api/debug/error/type-error" > /dev/null &
  curl -s "$SENTRY_DSN/api/debug/error/server-error" > /dev/null &
  curl -s "$SENTRY_DSN/api/debug/error/database" > /dev/null &
  echo -n "."
done
wait
echo " ✓ Done"
echo ""

# ==========================================
# Test 3: Generar logs con múltiples niveles
# ==========================================
echo "📝 Test 3: Generating 10 multi-level logs..."
for i in {1..10}; do
  curl -s "$SENTRY_DSN/api/debug/log/multiple" > /dev/null &
  echo -n "."
done
wait
echo " ✓ Done"
echo ""

# ==========================================
# Test 4: Errores personalizados con contexto
# ==========================================
echo "⚙️  Test 4: Generating 15 custom errors with context..."
for i in {1..15}; do
  USER_ID="USER_$i"
  ACTIONS=("create" "update" "delete" "read" "share")
  ACTION=${ACTIONS[$RANDOM % ${#ACTIONS[@]}]}

  curl -s "$SENTRY_DSN/api/debug/error/custom?userId=$USER_ID&action=$ACTION" > /dev/null &
  echo -n "."
done
wait
echo " ✓ Done"
echo ""

# ==========================================
# Test 5: Combinación de diferentes tipos de errores
# ==========================================
echo "🎯 Test 5: Mixed error types (20 requests)..."
for i in {1..20}; do
  # Seleccionar aleatoriamente un tipo de error
  ENDPOINTS=(
    "/api/debug/error/bad-request"
    "/api/debug/error/not-found"
    "/api/debug/error/server-error"
    "/api/debug/error/type-error"
    "/api/debug/error/reference-error"
    "/api/debug/error/async"
    "/api/debug/error/database"
  )

  ENDPOINT=${ENDPOINTS[$RANDOM % ${#ENDPOINTS[@]}]}
  curl -s "$SENTRY_DSN$ENDPOINT" > /dev/null &
  echo -n "."
done
wait
echo " ✓ Done"
echo ""

# ==========================================
# Test 6: Burst de logs
# ==========================================
echo "💥 Test 6: Burst test - 50 rapid requests..."
for i in {1..50}; do
  curl -s "$SENTRY_DSN/api/debug/log" > /dev/null &
done
wait
echo " ✓ Done"
echo ""

# ==========================================
# Test 7: Health checks intercalados
# ==========================================
echo "💚 Test 7: Health checks (10 requests)..."
for i in {1..10}; do
  curl -s "$SENTRY_DSN/api/debug/health" > /dev/null &
  echo -n "."
done
wait
echo " ✓ Done"
echo ""

echo "=========================================="
echo "✓ Stress test completed!"
echo ""
echo "Total requests sent: ~160+"
echo "  - Logs: ~80"
echo "  - Errors: ~70"
echo "  - Health checks: ~10"
echo ""
echo "Check your Sentry dashboard to see all events!"
echo "=========================================="
