const express = require('express');
const path = require('path');
require('dotenv').config();

// Import DB to test connection
const db = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

// 1. Global Middleware
app.use(express.json()); // Parses JSON data from frontend Fetch calls
app.use(express.urlencoded({ extended: true })); // Parses form data

// 2. Serve Static Files (HTML, CSS, JS)
// This makes the 'public' folder the root for the browser
app.use(express.static(path.join(__dirname, 'public')));

// 3. API Routes (The "Logic" Layer)
app.use('/api/auth', authRoutes);       // Login/Signup
app.use('/api/courses', courseRoutes); // Instructor Course management
app.use('/api/admin', adminRoutes);     // Approvals and Moderation
app.use('/api/student', studentRoutes); // Enrollment and Progress

// 4. Page Routing (Since it's a Multi-Page App)
// These routes just send the HTML files when you visit the URL
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public/signup.html')));
app.get('/dashboard', (req, res) => {
    // Note: The specific dashboard redirection happens via JS in the browser 
    // based on the role stored in localStorage.
    res.sendFile(path.join(__dirname, 'public/index.html')); 
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke! Check the server console.');
});

// 6. Start the Server
const PORT = process.env.PORT || 3000;

// Test DB connection
db.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    } else {
        console.log('Database connected successfully at', res.rows[0].now);
    }
});

app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`EduMaster LMS Server is running on:`);
    console.log(`http://localhost:${PORT}`);
    console.log(`-------------------------------------------`);
});