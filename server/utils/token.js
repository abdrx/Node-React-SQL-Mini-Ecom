const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file

// Secret key for JWT
const JWT_SECRET_KEY_ACCESS_TOKEN = process.env.JWT_SECRET_KEY_ACCESS_TOKEN; // Replace this with your secret key
const JWT_SECRET_KEY_REFRESH_TOKEN = process.env.JWT_SECRET_KEY_REFRESH_TOKEN;

// Generate JWT token
exports.generateAccessAndRefreshToken = (payload) => {
    // More practical expiries: access 1h, refresh 7d
    const token = jwt.sign(payload, JWT_SECRET_KEY_ACCESS_TOKEN, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, JWT_SECRET_KEY_REFRESH_TOKEN, { expiresIn: '7d' });
    return { token, refreshToken };
};


// Verify JWT token
exports.verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET_KEY_ACCESS_TOKEN, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};

// Refresh JWT token
// Refresh JWT token
exports.refreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, JWT_SECRET_KEY_REFRESH_TOKEN, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                // Generate new access and refresh tokens
                const { userId, isAdmin } = decoded;
                const newTokens = this.generateAccessAndRefreshToken({ userId, isAdmin });
                resolve(newTokens);
            }
        });
    });
};
