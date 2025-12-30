require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const schema = fs.readFileSync('./schema.sql', 'utf8');

pool.query(schema, (err, res) => {
    if (err) {
        console.error('Error creating tables:', err);
    } else {
        console.log('Tables created successfully');
    }
    pool.end();
});