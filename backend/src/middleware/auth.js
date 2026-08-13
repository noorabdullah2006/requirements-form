const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Look for Token in the Authorization header
    // Header format: Bearer <token>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // If token doesn't exist, block entry immediately
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied: No token provided"
        });
    }

    try {
        // Verify key and extract payload (contains user ID)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach decoded user info to request object so route controllers can see it
        req.user = decoded;
        
        // Let request continue to its actual route handler
        next();
    } catch (err) {
        console.error("JWT verification error:", err.message);
        return res.status(401).json({
            success: false,
            message: "Access denied: Invalid or expired token"
        });
    }
};

// Middleware to ensure user is Super Admin (abdullah)
const requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ // 403 Forbidden
            success: false,
            message: "Access denied: Super Admin (abdullah) privileges required"
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireSuperAdmin
};

