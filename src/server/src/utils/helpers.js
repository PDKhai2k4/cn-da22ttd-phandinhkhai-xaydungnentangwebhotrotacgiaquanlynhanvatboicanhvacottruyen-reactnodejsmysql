const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');

// Generate JWT Token
const generateToken = (payload) => {
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

// Verify JWT Token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
        return null;
    }
};

// Hash password with configurable rounds
const hashPassword = async (password, rounds = 12) => {
    return bcrypt.hash(password, rounds);
};

// Compare password
const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

// Generate OTP (6 digits)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Strip HTML tags from text
const stripHtml = (html) => {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
        .replace(/&nbsp;/g, ' ')    // Replace &nbsp; with space
        .replace(/&amp;/g, '&')     // Decode &amp;
        .replace(/&lt;/g, '<')      // Decode &lt;
        .replace(/&gt;/g, '>')      // Decode &gt;
        .replace(/&quot;/g, '"')    // Decode &quot;
        .replace(/&#39;/g, "'")     // Decode &#39;
        .replace(/\s+/g, ' ')       // Normalize whitespace
        .trim();
};

// Count words in text (supports HTML content)
const countWords = (text) => {
    if (!text) return 0;
    const plainText = stripHtml(text);
    if (!plainText) return 0;
    return plainText.split(/\s+/).filter(word => word.length > 0).length;
};

// Validate password strength
const validatePasswordStrength = (password) => {
    const errors = [];
    
    if (password.length < 6) {
        errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }
    
    // Optional: Add more strength requirements
    // if (!/[A-Z]/.test(password)) {
    //     errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    // }
    // if (!/[0-9]/.test(password)) {
    //     errors.push('Mật khẩu phải có ít nhất 1 số');
    // }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Generate random string
const generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Slugify string
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    generateOTP,
    countWords,
    stripHtml,
    validatePasswordStrength,
    generateRandomString,
    slugify
};
