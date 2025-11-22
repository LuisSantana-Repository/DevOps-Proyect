const router = require("express").Router();

/**
 * Debug Routes for Testing Sentry Error Tracking and Logging
 * These endpoints generate various types of logs and errors for testing purposes
 */

// Health check endpoint
router.get('/health', async (req, res) => {
    console.log('[DEBUG] Health check endpoint called');
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Debug routes are active'
    });
});

// Generate a simple error log
router.get('/log', async (req, res) => {
    console.log('[INFO] Log endpoint called');
    console.warn('[WARN] This is a warning message');
    console.error('[ERROR] This is an error message');

    res.status(200).json({
        message: 'Logs generated successfully',
        logs: ['info', 'warning', 'error']
    });
});

// Generate a 400 Bad Request error
router.get('/error/bad-request', async (req, res) => {
    console.error('[ERROR] Bad Request error triggered');
    res.status(400).json({
        error: 'Bad Request',
        message: 'This is a simulated bad request error',
        code: 400
    });
});

// Generate a 404 Not Found error
router.get('/error/not-found', async (req, res) => {
    console.error('[ERROR] Not Found error triggered');
    res.status(404).json({
        error: 'Not Found',
        message: 'This is a simulated not found error',
        code: 404
    });
});

// Generate a 500 Internal Server Error
router.get('/error/server-error', async (req, res) => {
    console.error('[ERROR] Internal Server Error triggered');
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'This is a simulated internal server error',
        code: 500
    });
});

// Throw a TypeError
router.get('/error/type-error', async (req, res) => {
    try {
        console.error('[ERROR] Attempting to trigger TypeError');
        const obj = null;
        obj.someMethod(); // This will throw TypeError
    } catch (error) {
        console.error('[ERROR] TypeError caught:', error.message);
        res.status(500).json({
            error: 'TypeError',
            message: error.message,
            stack: error.stack
        });
    }
});

// Throw a ReferenceError
router.get('/error/reference-error', async (req, res) => {
    try {
        console.error('[ERROR] Attempting to trigger ReferenceError');
        undefinedVariable.someMethod(); // This will throw ReferenceError
    } catch (error) {
        console.error('[ERROR] ReferenceError caught:', error.message);
        res.status(500).json({
            error: 'ReferenceError',
            message: error.message,
            stack: error.stack
        });
    }
});

// Throw an uncaught exception (will crash if not handled by Express error middleware)
router.get('/error/uncaught', async (req, res, next) => {
    console.error('[ERROR] Throwing uncaught exception');
    const error = new Error('This is an uncaught exception for testing');
    error.statusCode = 500;
    next(error); // Pass to Express error handler
});

// Simulate async error
router.get('/error/async', async (req, res) => {
    console.error('[ERROR] Simulating async error');

    try {
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Async operation failed'));
            }, 100);
        });
    } catch (error) {
        console.error('[ERROR] Async error caught:', error.message);
        res.status(500).json({
            error: 'AsyncError',
            message: error.message,
            stack: error.stack
        });
    }
});

// Generate multiple logs with different levels
router.get('/log/multiple', async (req, res) => {
    console.log('[LOG] Starting multiple log generation');
    console.info('[INFO] User action tracked');
    console.warn('[WARN] Resource usage at 75%');
    console.error('[ERROR] Failed to connect to external service');
    console.debug('[DEBUG] Variable state:', { foo: 'bar', count: 42 });

    res.status(200).json({
        message: 'Multiple logs generated',
        levels: ['log', 'info', 'warn', 'error', 'debug']
    });
});

// Simulate a database error
router.get('/error/database', async (req, res) => {
    console.error('[ERROR] Simulating database error');

    const dbError = new Error('Database connection timeout');
    dbError.name = 'MongoNetworkError';
    dbError.code = 'ETIMEDOUT';

    console.error('[ERROR] Database error:', dbError);

    res.status(503).json({
        error: 'Database Error',
        message: dbError.message,
        code: 503
    });
});

// Generate a custom error with context
router.get('/error/custom', async (req, res) => {
    const userId = req.query.userId || 'unknown';
    const action = req.query.action || 'unknown_action';

    console.error('[ERROR] Custom error triggered', {
        userId,
        action,
        timestamp: new Date().toISOString()
    });

    res.status(400).json({
        error: 'Custom Error',
        message: `Failed to perform action: ${action}`,
        context: {
            userId,
            action,
            timestamp: new Date().toISOString()
        }
    });
});

module.exports = router;
