const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const statusRoutes = require('./routes/statusRoutes');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const briefRoutes = require('./routes/briefRoutes'); // Import brief router
const adminRoutes = require('./routes/adminRoutes'); // Import admin router
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL // Your Vercel URL e.g. https://your-app.vercel.app
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json()); // Crucial for parsing req.body JSON details

// API Routing Mount
app.use('/api/status', statusRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', briefRoutes); // Public project brief submission
app.use('/api/admin', adminRoutes);    // Protected admin routes (JWT required)

// Serve uploaded files as static assets
// e.g. GET http://localhost:5000/uploads/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Protected health check route to verify auth middleware works
const { authenticateToken } = require('./middleware/auth'); // Import our auth middleware
app.get('/api/protected-route', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "You have accessed a protected route successfully!",
        userId: req.user.id // This matches user.id inside JWT payload
    });
});

// Basic Route for verification
app.get('/', (req, res) => {
    res.json({ message: "Server is running successfully!" });
});

// Test route to verify PostgreSQL database connection
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            success: true,
            message: "Connected to PostgreSQL database successfully!",
            time: result.rows[0].now
        });
    } catch (err) {
        console.error("Database connection error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to connect to the database",
            error: err.message || err
        });
    }
});

// Test route to verify table query capability
app.get('/api/test-tables', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM clients');
        res.json({
            success: true,
            message: "Successfully queried clients table!",
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error("Query tables error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to query clients table",
            error: err.message || err
        });
    }
});

// Start Server listening (local dev only)
// On Vercel, the serverless runtime handles this — we just export `app`
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;

