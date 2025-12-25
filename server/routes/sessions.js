const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'secret';

// Middleware to verify token
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
};

// Get all sessions for user
router.get('/', authenticate, (req, res) => {
    db.all('SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse the JSON data back to object
        const sessions = rows.map(row => ({
            ...row,
            data: JSON.parse(row.data_json)
        }));
        res.json(sessions);
    });
});

// Save a new session
router.post('/', authenticate, (req, res) => {
    const { role, difficulty, score, data } = req.body;
    const data_json = JSON.stringify(data);

    db.run('INSERT INTO sessions (user_id, role, difficulty, score, data_json) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, role, difficulty, score, data_json],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Session saved', id: this.lastID });
        }
    );
});

module.exports = router;
