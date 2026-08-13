const db = require('../db');
const { sendSystemAlert } = require('../services/emailService');

// Controller function to handle health checks (pings both server & PostgreSQL DB)
const getStatus = async (req, res) => {
    try {
        const dbResult = await db.query('SELECT 1 AS alive');
        const dbAlive = dbResult.rows[0]?.alive === 1;

        if (!dbAlive) {
            throw new Error('PostgreSQL Database ping failed to return expected heartbeat signal');
        }

        res.json({
            success: true,
            status: "OK",
            message: "Server and PostgreSQL database are healthy and active!",
            database: "CONNECTED",
            timestamp: new Date()
        });
    } catch (err) {
        console.error('Health check failed:', err);

        // Send alert email directly to Super Admin
        await sendSystemAlert(
            'System Health Check Failed (Database / Server Disconnected)',
            err.message || 'Unknown database/server connection failure'
        );

        res.status(500).json({
            success: false,
            status: "DOWN",
            message: "Status check failed - server or database error",
            error: err.message
        });
    }
};

module.exports = {
    getStatus
};
