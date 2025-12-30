require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function createAdmin() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const query = `
        INSERT INTO users (name, email, password_hash, role, is_approved)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
    `;
    await pool.query(query, ['Admin User', 'admin@edumaster.com', hashedPassword, 'Administrator', true]);
    console.log('Admin user created or already exists');
    pool.end();
}

createAdmin().catch(console.error);