const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // Hash the password for security [cite: 9]
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Logic: Instructors start as 'unapproved' [cite: 40]
        const isApproved = (role === 'Instructor') ? false : true;

        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role, is_approved) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, hashedPassword, role, isApproved]
        );

        res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Email already exists or server error" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) return res.status(401).json({ error: "Invalid password" });

        // Check if instructor is approved
        if (user.rows[0].role === 'Instructor' && !user.rows[0].is_approved) {
            return res.status(403).json({ error: "Your instructor account is pending approval." });
        }

        // Check if user is blocked
        if (user.rows[0].is_blocked) {
            return res.status(403).json({ error: "Your account has been blocked." });
        }

        // Generate JWT Token [cite: 37]
        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, role: user.rows[0].role });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
        if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};