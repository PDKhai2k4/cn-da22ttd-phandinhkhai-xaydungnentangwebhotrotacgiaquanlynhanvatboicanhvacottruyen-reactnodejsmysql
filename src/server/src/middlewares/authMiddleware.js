const { verifyToken } = require('../utils/helpers');
const pool = require('../config/db');

// Middleware xác thực JWT
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Không có token xác thực' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        
        // Kiểm tra user còn tồn tại và active
        const [users] = await pool.query(
            'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
            [decoded.id]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Người dùng không tồn tại' });
        }
        
        if (!users[0].is_active) {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
        }
        
        req.user = users[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Lỗi xác thực' });
    }
};

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    next();
};

module.exports = { authenticate, isAdmin };
