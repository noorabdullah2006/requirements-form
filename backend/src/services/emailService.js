const nodemailer = require('nodemailer');
require('dotenv').config();

// Admin Email Target
const ADMIN_EMAIL = 'noorabdullah.qr10@gmail.com';

// Cooldown timer to prevent spamming emails every few seconds (e.g. max 1 alert per 5 minutes)
let lastAlertTime = 0;
const ALERT_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Sends a system alert email to the Super Admin
 * @param {string} subject - Alert title
 * @param {string} errorDetails - Detailed error description
 */
const sendSystemAlert = async (subject, errorDetails) => {
    const now = Date.now();
    if (now - lastAlertTime < ALERT_COOLDOWN_MS) {
        console.log('Alert email skipped due to 5-minute cooldown period.');
        return;
    }

    lastAlertTime = now;

    // Transporter configuration (using SMTP settings or Gmail App Password)
    // Environment variables ALERT_EMAIL_USER and ALERT_EMAIL_PASS can be set in .env
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ALERT_EMAIL_USER || 'noorabdullah.qr10@gmail.com',
            pass: process.env.ALERT_EMAIL_PASS || ''
        }
    });

    const mailOptions = {
        from: `"Agency System Alert" <${process.env.ALERT_EMAIL_USER || 'noorabdullah.qr10@gmail.com'}>`,
        to: ADMIN_EMAIL,
        subject: `⚠️ [CRITICAL ALERT] ${subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 10px;">
                <h2 style="color: #ef4444; margin-top: 0;">⚠️ System Health Failure Detected</h2>
                <p>Hello Super Admin,</p>
                <p>An error was detected in your Agency Project System. Here are the failure details:</p>
                <div style="background-color: #1e293b; padding: 15px; border-left: 4px solid #ef4444; border-radius: 6px; font-family: monospace; font-size: 13px;">
                    <strong>Error Issue:</strong> ${subject}<br/><br/>
                    <strong>Details:</strong> ${errorDetails}<br/><br/>
                    <strong>Timestamp:</strong> ${new Date().toISOString()}
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
                    This is an automated emergency system alert sent directly from your backend monitor.
                </p>
            </div>
        `
    };

    try {
        if (!process.env.ALERT_EMAIL_PASS) {
            console.log(`[ALERT LOGGED] To ${ADMIN_EMAIL}: ${subject} | ${errorDetails}`);
            console.log(`Note: Set ALERT_EMAIL_PASS in .env to send real SMTP emails via Gmail.`);
            return;
        }
        await transporter.sendMail(mailOptions);
        console.log(`Alert email sent successfully to ${ADMIN_EMAIL}`);
    } catch (err) {
        console.error('Failed to send alert email:', err.message);
    }
};

module.exports = {
    sendSystemAlert,
    ADMIN_EMAIL
};
