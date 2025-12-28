const express = require('express');
const router = express.Router();

// Health check endpoint to wake up the server
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: Date.now(),
        message: 'Server is ready'
    });
});

module.exports = router;
