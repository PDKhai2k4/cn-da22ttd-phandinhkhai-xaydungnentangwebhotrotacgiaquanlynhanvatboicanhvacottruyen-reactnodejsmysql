require('dotenv').config();

// Kiểm tra JWT_SECRET bắt buộc phải được set
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
    console.error('Please set JWT_SECRET in your .env file');
    process.exit(1);
}

module.exports = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
