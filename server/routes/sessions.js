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
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY date DESC', [req.user.id]);
        console.log('[SESSION GET] Found', result.rows.length, 'sessions for user', req.user.id);

        // pg parser automatically parses JSONB columns into objects
        const sessions = result.rows.map(row => {
            // data_json now contains { data: [...], report: {...} }
            const sessionInfo = row.data_json || {};
            return {
                id: row.id,
                user_id: row.user_id,
                role: row.role,
                difficulty: row.difficulty,
                score: row.score,
                date: row.date,
                data: sessionInfo.data || [],
                report: sessionInfo.report || null
            };
        });
        res.json(sessions);
    } catch (err) {
        console.error('[SESSION GET] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Save a new session
router.post('/', authenticate, async (req, res) => {
    const { role, difficulty, score, data, report } = req.body;

    console.log('[SESSION SAVE] Received data:', { role, difficulty, score, hasData: !!data, hasReport: !!report });

    // Store the complete session info (including report) in JSONB
    const sessionInfo = { data, report };

    try {
        const result = await db.query(
            'INSERT INTO sessions (user_id, role, difficulty, score, data_json) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [req.user.id, role, difficulty, score, sessionInfo]
        );
        console.log('[SESSION SAVE] Success! ID:', result.rows[0].id);
        res.status(201).json({ message: 'Session saved', id: result.rows[0].id });
    } catch (err) {
        console.error('[SESSION SAVE] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
