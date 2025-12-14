
// Example usage of DexterLogger SDK
const express = require('express');
const DexterLogger = require('../index');

const app = express();
app.use(express.json());

// Example custom service with functions to override
const myService = {
    processOrder(orderId, items) {
        console.log(`Processing order ${orderId}`);
        return { success: true, orderId };
    },
    sendNotification(userId, message) {
        console.log(`Sending notification to ${userId}: ${message}`);
        return { sent: true };
    }
};

// Initialize DexterLogger with options
const logger = new DexterLogger('your-access-token', 'order-service', {
    // Override these console methods
    overrideConsoleMethods: ['log', 'error', 'warn', 'info'],

    // Override these custom functions
    customFunctionsToOverride: [
        { target: myService, fnName: 'processOrder' },
        { target: myService, fnName: 'sendNotification' }
    ]
});

// Use unified middleware - handles both request and response
app.use(logger.middleware());

// Example routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/orders', (req, res) => {
    console.log('Received order request'); // Captured to consoleQueue

    const result = myService.processOrder(req.body.orderId, req.body.items); // Captured to customFunctionQueue
    myService.sendNotification(req.body.userId, 'Order received'); // Captured to customFunctionQueue

    res.json(result);
});

app.get('/error-test', (req, res) => {
    console.error('Something went wrong!'); // Captured to consoleQueue
    res.status(500).json({ error: 'Test error' });
});

// Manual span example for custom operations
app.post('/complex-operation', async (req, res) => {
    // Start a child span for database operation
    const dbSpan = logger.startSpan('database-query');

    // Simulate DB operation
    await new Promise(resolve => setTimeout(resolve, 100));

    logger.endSpan(dbSpan, 'OK');

    // Log a custom metric
    logger.logMetric('db_query_count', 1, { table: 'orders' });

    res.json({ success: true });
});

// Cleanup on shutdown
process.on('SIGTERM', () => {
    logger.destroy();
    process.exit(0);
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
