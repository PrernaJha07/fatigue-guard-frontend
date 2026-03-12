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

// --- 1. UPDATED CORS FOR CLOUD ---
// This allows your Vercel/Render frontend to talk to this backend
app.use(cors({
    origin: '*', // For testing, we allow all. Later, you can put your specific Vercel URL here.
    credentials: true
}));

// --- 2. DATABASES ---

// MySQL Connection (Cloud Aiven)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 13102 // Added Port for Aiven
});

db.connect((err) => {
    if (err) return console.error('❌ MySQL Connection Failed:', err.message);
    console.log('✅ Connected to MySQL Database (Aiven)');
});

// MongoDB Connection (Cloud Atlas)
// CHANGED: Removed 127.0.0.1 and used the .env variable
const mongoURI = process.env.MONGODB_URI; 
mongoose.connect(mongoURI)
    .then(() => console.log('🍃 Connected to MongoDB (Atlas)'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 3. MONGODB SCHEMA ---
const ReportSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    fatigueLevel: String,   
    fatigueScore: Number,   
    mousePrecision: Number,
    typingGap: Number,
    recommendation: String, 
    createdAt: { type: Date, default: Date.now }
});

const AIReport = mongoose.model('AIReport', ReportSchema);

// --- 4. SERVICES ---
const resend = new Resend(process.env.RESEND_API_KEY);

// --- 5. AUTH ROUTES --- (Signup/Login code remains the same as yours)
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
        db.query(query, [username, email, hashedPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Email already exists" });
                return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json({ message: "User created successfully" });
        });
    } catch (err) { res.status(500).json({ error: "Internal error" }); }
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

// --- 6. REPORT ROUTES ---
app.get('/api/reports/:userId', async (req, res) => {
    try {
        const reports = await AIReport.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) { res.status(500).json({ error: "Failed to fetch reports" }); }
});

// --- 7. AI INTEGRATION PROXY (UPDATED FOR CLOUD) ---

app.post('/api/predict-fatigue', async (req, res) => {
    try {
        const { ear, mar, userId, typing_gap, typing_std, mouse_precision } = req.body;

        // CHANGED: Using process.env.PYTHON_ENGINE_URL instead of 127.0.0.1
        const pythonUrl = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:5001';
        
        const aiResponse = await axios.post(`${pythonUrl}/predict`, { 
            ear: ear, 
            mar: mar, 
            typing_gap: typing_gap || 400, 
            typing_std: typing_std || 50 
        });

        const result = aiResponse.data;

        if (userId) {
            let level = "Low";
            let recommendation = "You are alert and focused.";

            if (result.score >= 0.75) {
                level = "High";
                recommendation = "CRITICAL: Please take a 15-minute break.";
            } else if (result.score >= 0.40) {
                level = "Medium";
                recommendation = "Warning: Signs of fatigue detected.";
            }

            const report = new AIReport({
                userId: userId,
                fatigueLevel: level,
                fatigueScore: (result.score * 100).toFixed(0),
                mousePrecision: mouse_precision || 100,
                typingGap: typing_gap || 400,
                recommendation: recommendation
            });
            
            await report.save();
        }
        res.json(result);

    } catch (err) {
        console.error("AI Bridge Error:", err.message);
        res.status(500).json({ error: "AI Engine is offline" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));