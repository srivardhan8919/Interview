const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    ssl: (isProduction || process.env.DB_SSL === 'true') ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database.');
});

const initializeDB = async () => {
    try {
        // Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create Sessions Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                role VARCHAR(255) NOT NULL,
                difficulty VARCHAR(255) NOT NULL,
                score INTEGER,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_json JSONB
            )
        `);

        console.log('Database tables initialized.');
    } catch (err) {
        console.error('Error initializing database tables:', err);
    }
};

initializeDB();

module.exports = {
    query: (text, params) => pool.query(text, params),
};

