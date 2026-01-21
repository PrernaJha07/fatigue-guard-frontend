const express = require('express');
const mysql = require('mysql2');
const mongoose = require('mongoose'); 
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const axios = require('axios'); 
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

// --- 4. AUTH ROUTES ---

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

// --- 5. REPORT ROUTES ---

app.get('/api/reports/:userId', async (req, res) => {
    try {
        const reports = await AIReport.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch AI reports" });
    }
});

// --- 6. AI INTEGRATION PROXY (LOGS EVERYTHING) ---

app.post('/api/predict-fatigue', async (req, res) => {
    try {
        const { ear, mar, userId } = req.body;

        // 1. Forward data to Python AI Bridge
        const aiResponse = await axios.post('http://127.0.0.1:5001/predict', { 
            ear: ear, 
            mar: mar, 
            typing_gap: 400, 
            typing_std: 50 
        });

        const result = aiResponse.data;

        // 2. Logic to determine severity and save to MongoDB
        if (userId) {
            let level = "Low";
            let recommendation = "You are alert and focused. Keep it up!";

            if (result.score >= 0.75) {
                level = "High";
                recommendation = "CRITICAL: Please take a 15-minute break immediately.";
            } else if (result.score >= 0.40) {
                level = "Medium";
                recommendation = "Warning: Signs of fatigue detected. Consider a short rest.";
            }

            // Persistence Logic: Saving EVERY check (Low, Medium, and High)
            const report = new AIReport({
                userId: userId,
                fatigueLevel: level,
                fatigueScore: (result.score * 100).toFixed(0), // Percentage for dashboard/MongoDB
                recommendation: recommendation
            });
            
            await report.save();
            console.log(`✅ [MongoDB] Logged ${level} state (${(result.score * 100).toFixed(0)}%) for User: ${userId}`);
        }

        res.json(result);

    } catch (err) {
        console.error("AI Bridge Error:", err.message);
        res.status(500).json({ error: "AI Engine is offline" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));