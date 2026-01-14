const express = require('express');
const mysql = require('mysql2');
const mongoose = require('mongoose'); 
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- 1. DATABASES ---

// MySQL Connection (For User Accounts)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) return console.error('❌ MySQL Connection Failed:', err.message);
    console.log('✅ Connected to MySQL Database');
});

// MongoDB Connection (For AI Reports)
mongoose.connect('mongodb://127.0.0.1:27017/fatigue_db')
    .then(() => console.log('🍃 Connected to MongoDB (Ready for AI Reports)'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 2. MONGODB SCHEMA ---
const ReportSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    fatigueLevel: String,   
    fatigueScore: Number,   
    recommendation: String, 
    createdAt: { type: Date, default: Date.now }
});

const AIReport = mongoose.model('AIReport', ReportSchema);

// --- 3. SERVICES ---
const resend = new Resend(process.env.RESEND_API_KEY);

// --- 4. AUTH ROUTES (MySQL + Resend) ---

app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
        db.query(query, [username, email, hashedPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Email already exists" });
                return res.status(500).json({ error: "Database error occurred" });
            }
            res.status(201).json({ message: "User created successfully" });
        });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: "User not found" });
        const match = await bcrypt.compare(password, results[0].password_hash);
        if (!match) return res.status(401).json({ error: "Incorrect password" });
        const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token, user: { id: results[0].id, username: results[0].username } });
    });
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: "User not found" });
        try {
            await resend.emails.send({
                from: 'FatigueGuard <onboarding@resend.dev>',
                to: email,
                subject: 'Password Reset Request',
                html: `<h3>Reset Password</h3><p>Click <a href="http://localhost:5173/reset-password?email=${email}">here</a> to reset.</p>`
            });
            res.json({ message: "Reset link sent!" });
        } catch (mailErr) {
            res.status(500).json({ error: "Email delivery failed" });
        }
    });
});

app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const query = "UPDATE users SET password_hash = ? WHERE email = ?";
        db.query(query, [hashedPassword, email], (err) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json({ message: "Password updated successfully!" });
        });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// --- 5. REPORT ROUTES (MongoDB) ---

// FETCH Reports (For Website Dashboard)
app.get('/api/reports/:userId', async (req, res) => {
    try {
        const reports = await AIReport.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch AI reports" });
    }
});

// INSERT Report (For App/Testing)
app.post('/api/reports', async (req, res) => {
    try {
        const newReport = new AIReport(req.body);
        await newReport.save();
        res.status(201).json({ message: "Report saved successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save report" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));