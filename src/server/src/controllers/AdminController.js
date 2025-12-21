const pool = require('../config/db');

class AdminController {
    // Dashboard tổng quan
    static async getDashboard(req, res) {
        try {
            // Thống kê users
            const [userStats] = await pool.query(`
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
                    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
                    SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today
                FROM users
            `);
            
            // Thống kê projects
            const [projectStats] = await pool.query(`
                SELECT 
                    COUNT(*) as total_projects,
                    SUM(CASE WHEN status = 'writing' THEN 1 ELSE 0 END) as writing,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
                FROM projects
            `);
            
            // Thống kê feedbacks
            const [feedbackStats] = await pool.query(`
                SELECT 
                    COUNT(*) as total_feedbacks,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
                FROM feedbacks
            `);
            
            // Users mới nhất
            const [recentUsers] = await pool.query(`
                SELECT id, username, email, created_at 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT 5
            `);
            
            // Feedbacks mới nhất
            const [recentFeedbacks] = await pool.query(`
                SELECT f.id, f.subject, f.status, f.created_at, u.username
                FROM feedbacks f
                JOIN users u ON f.user_id = u.id
                ORDER BY f.created_at DESC 
                LIMIT 5
            `);
            
            res.json({
                users: userStats[0],
                projects: projectStats[0],
                feedbacks: feedbackStats[0],
                recentUsers,
                recentFeedbacks
            });
        } catch (error) {
            console.error('Get dashboard error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Thống kê chi tiết
    static async getDetailedStats(req, res) {
        try {
            // Thống kê theo tháng (6 tháng gần nhất)
            const [monthlyUsers] = await pool.query(`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as count
                FROM users
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month
            `);
            
            const [monthlyProjects] = await pool.query(`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as count
                FROM projects
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month
            `);
            
            // Top users theo số dự án
            const [topUsers] = await pool.query(`
                SELECT u.id, u.username, u.email, COUNT(p.id) as project_count
                FROM users u
                LEFT JOIN projects p ON u.id = p.user_id
                GROUP BY u.id
                ORDER BY project_count DESC
                LIMIT 10
            `);
            
            res.json({
                monthlyUsers,
                monthlyProjects,
                topUsers
            });
        } catch (error) {
            console.error('Get detailed stats error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = AdminController;
