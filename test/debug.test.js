const request = require('supertest');
const express = require('express');
const DebugRoutes = require('../routes/DebugRoutes');
const cookieParser = require('cookie-parser');

// Mock Sentry to avoid sending data during tests
jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
}));

// Create Express app for testing
const app = express();
app.use(cookieParser());
app.use(express.json());

// Setup debug routes
app.use('/api/debug', DebugRoutes);

// ─────────────────────────────────────
//   HEALTH CHECK ENDPOINT
// ─────────────────────────────────────

describe('Debug Routes - Health Check', () => {

  test('GET /api/debug/health should return OK status', async () => {
    const response = await request(app).get('/api/debug/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('message', 'Debug routes are active');
  });

});

// ─────────────────────────────────────
//   LOG GENERATION ENDPOINTS
// ─────────────────────────────────────

describe('Debug Routes - Log Generation', () => {

  test('GET /api/debug/log should generate logs successfully', async () => {
    const response = await request(app).get('/api/debug/log');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('sent to Sentry');
    expect(response.body).toHaveProperty('logs');
    expect(response.body.logs).toEqual(['info', 'warning', 'error']);
  });

  test('GET /api/debug/log/multiple should generate multiple logs', async () => {
    const response = await request(app).get('/api/debug/log/multiple');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('sent to Sentry');
    expect(response.body).toHaveProperty('levels');
    expect(response.body.levels).toEqual(['log', 'info', 'warn', 'error', 'debug']);
  });

});

// ─────────────────────────────────────
//   HTTP ERROR ENDPOINTS
// ─────────────────────────────────────

describe('Debug Routes - HTTP Errors', () => {

  test('GET /api/debug/error/bad-request should return 400 error', async () => {
    const response = await request(app).get('/api/debug/error/bad-request');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Bad Request');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('code', 400);
  });

  test('GET /api/debug/error/not-found should return 404 error', async () => {
    const response = await request(app).get('/api/debug/error/not-found');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('code', 404);
  });

  test('GET /api/debug/error/server-error should return 500 error', async () => {
    const response = await request(app).get('/api/debug/error/server-error');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('code', 500);
  });

});

// ─────────────────────────────────────
//   JAVASCRIPT ERROR ENDPOINTS
// ─────────────────────────────────────

describe('Debug Routes - JavaScript Errors', () => {

  test('GET /api/debug/error/type-error should return TypeError', async () => {
    const response = await request(app).get('/api/debug/error/type-error');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'TypeError');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Cannot read properties of null');
    expect(response.body).toHaveProperty('stack');
  });

  test('GET /api/debug/error/reference-error should return ReferenceError', async () => {
    const response = await request(app).get('/api/debug/error/reference-error');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'ReferenceError');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('undefinedVariable');
    expect(response.body).toHaveProperty('stack');
  });

  test('GET /api/debug/error/async should handle async error', async () => {
    const response = await request(app).get('/api/debug/error/async');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'AsyncError');
    expect(response.body).toHaveProperty('message', 'Async operation failed');
    expect(response.body).toHaveProperty('stack');
  });

});

// ─────────────────────────────────────
//   DATABASE ERROR ENDPOINT
// ─────────────────────────────────────

describe('Debug Routes - Database Errors', () => {

  test('GET /api/debug/error/database should return database error', async () => {
    const response = await request(app).get('/api/debug/error/database');

    expect(response.status).toBe(503);
    expect(response.body).toHaveProperty('error', 'Database Error');
    expect(response.body).toHaveProperty('message', 'Database connection timeout');
    expect(response.body).toHaveProperty('code', 503);
  });

});

// ─────────────────────────────────────
//   CUSTOM ERROR ENDPOINT
// ─────────────────────────────────────

describe('Debug Routes - Custom Errors', () => {

  test('GET /api/debug/error/custom should return custom error with default context', async () => {
    const response = await request(app).get('/api/debug/error/custom');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Custom Error');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('context');
    expect(response.body.context).toHaveProperty('userId', 'unknown');
    expect(response.body.context).toHaveProperty('action', 'unknown_action');
    expect(response.body.context).toHaveProperty('timestamp');
  });

  test('GET /api/debug/error/custom with query params should return custom error with provided context', async () => {
    const response = await request(app)
      .get('/api/debug/error/custom')
      .query({ userId: '12345', action: 'delete' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Custom Error');
    expect(response.body).toHaveProperty('message', 'Failed to perform action: delete');
    expect(response.body).toHaveProperty('context');
    expect(response.body.context).toHaveProperty('userId', '12345');
    expect(response.body.context).toHaveProperty('action', 'delete');
    expect(response.body.context).toHaveProperty('timestamp');
  });

});

// ─────────────────────────────────────
//   UNCAUGHT EXCEPTION ENDPOINT
// ─────────────────────────────────────

describe('Debug Routes - Uncaught Exceptions', () => {

  test('GET /api/debug/error/uncaught should trigger uncaught exception', async () => {
    // Add error handler middleware to catch the error
    const testApp = express();
    testApp.use(cookieParser());
    testApp.use(express.json());
    testApp.use('/api/debug', DebugRoutes);

    // Add error handler to catch the uncaught exception
    testApp.use((err, req, res, next) => {
      res.status(err.statusCode || 500).json({
        error: err.name || 'Error',
        message: err.message,
      });
    });

    const response = await request(testApp).get('/api/debug/error/uncaught');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'This is an uncaught exception for testing');
  });

});

// ─────────────────────────────────────
//   SENTRY INTEGRATION VERIFICATION
// ─────────────────────────────────────

describe('Debug Routes - Sentry Integration', () => {

  beforeEach(() => {
    // Clear mock calls before each test
    const Sentry = require('@sentry/node');
    Sentry.captureException.mockClear();
    Sentry.captureMessage.mockClear();
  });

  test('Log endpoint should call Sentry.captureMessage', async () => {
    const Sentry = require('@sentry/node');

    await request(app).get('/api/debug/log');

    // Verify Sentry.captureMessage was called
    expect(Sentry.captureMessage).toHaveBeenCalledTimes(3);
    expect(Sentry.captureMessage).toHaveBeenCalledWith('Info log endpoint called', 'info');
    expect(Sentry.captureMessage).toHaveBeenCalledWith('Warning message from debug route', 'warning');
    expect(Sentry.captureMessage).toHaveBeenCalledWith('Error message from debug route', 'error');
  });

  test('Error endpoints should call Sentry.captureException', async () => {
    const Sentry = require('@sentry/node');

    await request(app).get('/api/debug/error/type-error');

    // Verify Sentry.captureException was called
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Cannot read properties of null')
      })
    );
  });

  test('Custom error endpoint should call Sentry.captureException with context', async () => {
    const Sentry = require('@sentry/node');

    await request(app)
      .get('/api/debug/error/custom')
      .query({ userId: '789', action: 'update' });

    // Verify Sentry.captureException was called with context
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Failed to perform action: update'
      }),
      expect.objectContaining({
        contexts: expect.objectContaining({
          custom: expect.objectContaining({
            userId: '789',
            action: 'update'
          })
        }),
        tags: expect.objectContaining({
          userId: '789',
          action: 'update'
        })
      })
    );
  });

});
