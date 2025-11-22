#!/bin/bash

export SENTRY_DSN="http://localhost:3001"
echo "Testing Sentry Debug Routes..."
echo ""

echo "1. Health Check"
curl -s $SENTRY_DSN/api/debug/health
echo ""

echo "2. Simple Logs"
curl -s $SENTRY_DSN/api/debug/log
echo ""

echo "3. Multiple Logs"
curl -s $SENTRY_DSN/api/debug/log/multiple
echo ""

echo "4. 400 Bad Request"
curl -s $SENTRY_DSN/api/debug/error/bad-request
echo ""

echo "5. 404 Not Found"
curl -s $SENTRY_DSN/api/debug/error/not-found
echo ""

echo "6. 500 Server Error"
curl -s $SENTRY_DSN/api/debug/error/server-error
echo ""

echo "7. TypeError"
curl -s $SENTRY_DSN/api/debug/error/type-error
echo ""

echo "8. ReferenceError"
curl -s $SENTRY_DSN/api/debug/error/reference-error
echo ""

echo "9. Uncaught Exception"
curl -s $SENTRY_DSN/api/debug/error/uncaught
echo ""

echo "10. Async Error"
curl -s $SENTRY_DSN/api/debug/error/async
echo ""

echo "11. Database Error"
curl -s $SENTRY_DSN/api/debug/error/database
echo ""

echo "12. Custom Error (default)"
curl -s $SENTRY_DSN/api/debug/error/custom
echo ""

echo "13. Custom Error (with params)"
curl -s "$SENTRY_DSN/api/debug/error/custom?userId=TEST123&action=delete"
echo ""

echo "All requests sent to Sentry!"
