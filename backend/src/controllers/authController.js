const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken to create signed session tokens

// Registration controller (with bcrypt password hashing)
const register = async (req, res) => {
    const { name, email, password } = req.body;

    // Basic Backend Validation
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide name, email, and password"
        });
    }

    // Minimum password length validation
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long"
        });
    }

    try {
        // Check if user already exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ // 409 Conflict
                success: false,
                message: "A user with this email already exists"
            });
        }

        // Hash the password with bcrypt (10 rounds of salting)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into PostgreSQL (saving the encrypted hash!)
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, hashedPassword]
        );

        res.status(201).json({ // 201 Created
            success: true,
            message: "User registered successfully!",
            data: newUser.rows[0]
        });

    } catch (err) {
        console.error("Registration error:", err);
        
        let clientMessage = "Server error during registration";
        let statusCode = 500;

        // Check if database is offline/unreachable
        const isDbOffline = 
            err.code === 'ECONNREFUSED' || 
            (err.message && err.message.includes('ECONNREFUSED')) ||
            (err instanceof AggregateError && err.errors.some(e => e.code === 'ECONNREFUSED')) ||
            (err.message && err.message.includes('connection refused'));

        if (isDbOffline) {
            clientMessage = "Database connection failed";
            statusCode = 503; // Service Unavailable
        }

        res.status(statusCode).json({
            success: false,
            message: clientMessage
        });
    }
};

// Login controller (with JWT token generation)
const login = async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide email and password"
        });
    }

    try {
        // Find user by email
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        // Check if user exists
        if (result.rows.length === 0) {
            // General error message for account-enumeration safety
            return res.status(401).json({ // 401 Unauthorized
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Compare entered password with stored bcrypt hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ // 401 Unauthorized
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        // Include user.id, email, and role in payload, sign with JWT_SECRET (24h expiration)
        const userRole = user.role || (user.email === 'noorabdullah.qr10@gmail.com' ? 'super_admin' : 'admin');

        const token = jwt.sign(
            { id: user.id, email: user.email, role: userRole },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return token and safe user details to frontend
        res.status(200).json({ // 200 OK
            success: true,
            message: "Login successful!",
            token,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: userRole
            }
        });


    } catch (err) {
        console.error("Login error:", err);
        
        let clientMessage = "Server error during login";
        let statusCode = 500;

        // Check if database is offline/unreachable
        const isDbOffline = 
            err.code === 'ECONNREFUSED' || 
            (err.message && err.message.includes('ECONNREFUSED')) ||
            (err instanceof AggregateError && err.errors.some(e => e.code === 'ECONNREFUSED')) ||
            (err.message && err.message.includes('connection refused'));

        if (isDbOffline) {
            clientMessage = "Database connection failed";
            statusCode = 503; // Service Unavailable
        }

        res.status(statusCode).json({
            success: false,
            message: clientMessage
        });
    }
};

module.exports = {
    register,
    login
};
