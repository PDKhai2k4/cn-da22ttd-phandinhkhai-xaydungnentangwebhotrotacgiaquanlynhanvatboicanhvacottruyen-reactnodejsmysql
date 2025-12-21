const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const pool = require('../config/db');

// Tất cả routes đều yêu cầu admin
router.use(authenticate, isAdmin);

// GET /admin/stats - Thống kê tổng quan
router.get('/stats', async (req, res) => {
    try {
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [projectCount] = await pool.query('SELECT COUNT(*) as count FROM projects');
        const [pendingFeedbacks] = await pool.query(
            "SELECT COUNT(*) as count FROM feedbacks WHERE status = 'pending'"
        );
        const [recentUsers] = await pool.query(
            'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5'
        );

        res.json({
            totalUsers: userCount[0].count,
            totalProjects: projectCount[0].count,
            pendingFeedbacks: pendingFeedbacks[0].count,
            recentUsers
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// GET /admin/users - Danh sách người dùng
router.get('/users', async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// PUT /admin/users/:id/status - Cập nhật trạng thái user
router.put('/users/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        // Không cho phép khóa chính mình
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'Không thể thay đổi trạng thái của chính mình' });
        }

        // Kiểm tra user tồn tại và không phải admin
        const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        if (users[0].role === 'admin') {
            return res.status(400).json({ message: 'Không thể thay đổi trạng thái admin' });
        }

        await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


// DELETE /admin/users/:id - Xóa user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'Không thể xóa chính mình' });
        }

        const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        if (users[0].role === 'admin') {
            return res.status(400).json({ message: 'Không thể xóa admin' });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// GET /admin/feedbacks - Danh sách phản hồi
router.get('/feedbacks', async (req, res) => {
    try {
        const [feedbacks] = await pool.query(`
            SELECT f.*, u.username, u.email 
            FROM feedbacks f 
            JOIN users u ON f.user_id = u.id 
            ORDER BY 
                CASE f.status WHEN 'pending' THEN 0 ELSE 1 END,
                f.created_at DESC
        `);
        res.json({ feedbacks });
    } catch (error) {
        console.error('Get feedbacks error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// PUT /admin/feedbacks/:id/respond - Phản hồi feedback
router.put('/feedbacks/:id/respond', async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_response, status } = req.body;

        const [feedbacks] = await pool.query('SELECT id FROM feedbacks WHERE id = ?', [id]);
        if (feedbacks.length === 0) {
            return res.status(404).json({ message: 'Phản hồi không tồn tại' });
        }

        await pool.query(
            `UPDATE feedbacks SET admin_response = ?, status = ?, responded_by = ?, responded_at = NOW() WHERE id = ?`,
            [admin_response, status || 'resolved', req.user.id, id]
        );
        res.json({ message: 'Đã gửi phản hồi' });
    } catch (error) {
        console.error('Respond feedback error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// DELETE /admin/feedbacks/:id - Xóa feedback
router.delete('/feedbacks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [feedbacks] = await pool.query('SELECT id FROM feedbacks WHERE id = ?', [id]);
        if (feedbacks.length === 0) {
            return res.status(404).json({ message: 'Phản hồi không tồn tại' });
        }

        await pool.query('DELETE FROM feedbacks WHERE id = ?', [id]);
        res.json({ message: 'Xóa phản hồi thành công' });
    } catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// GET /admin/settings - Lấy cài đặt hệ thống
router.get('/settings', async (req, res) => {
    try {
        const [settings] = await pool.query('SELECT * FROM system_settings ORDER BY id');
        res.json({ settings });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// PUT /admin/settings/:key - Cập nhật cài đặt
router.put('/settings/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        const [result] = await pool.query(
            'UPDATE system_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?',
            [value, req.user.id, key]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cài đặt không tồn tại' });
        }

        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;
