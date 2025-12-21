const pool = require('../config/db');
const { sanitizeFields, buildUpdateQuery } = require('../utils/sanitize');

const TABLE_NAME = 'feedbacks';

class FeedbackModel {
    static async findById(id) {
        const [rows] = await pool.query(`
            SELECT f.*, u.username, u.email as user_email, a.username as admin_username
            FROM feedbacks f
            JOIN users u ON f.user_id = u.id
            LEFT JOIN users a ON f.responded_by = a.id
            WHERE f.id = ?
        `, [id]);
        return rows[0];
    }

    static async findByUserId(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [rows] = await pool.query(
            'SELECT * FROM feedbacks WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [userId, limit, offset]
        );
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM feedbacks WHERE user_id = ?', [userId]);
        return { feedbacks: rows, total: countResult[0].total, page, totalPages: Math.ceil(countResult[0].total / limit) };
    }

    static async getAll(page = 1, limit = 20, status = null) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT f.*, u.username, u.email as user_email
            FROM feedbacks f
            JOIN users u ON f.user_id = u.id
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM feedbacks';
        const params = [];
        
        if (status) {
            query += ' WHERE f.status = ?';
            countQuery += ' WHERE status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
        
        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        
        return { feedbacks: rows, total: countResult[0].total, page, totalPages: Math.ceil(countResult[0].total / limit) };
    }

    static async create(data) {
        const { user_id, subject, content, feedback_type } = data;
        const [result] = await pool.query(
            'INSERT INTO feedbacks (user_id, subject, content, feedback_type) VALUES (?, ?, ?, ?)',
            [user_id, subject, content, feedback_type || 'other']
        );
        return result.insertId;
    }

    static async respond(id, adminId, response, status) {
        await pool.query(
            'UPDATE feedbacks SET admin_response = ?, responded_by = ?, responded_at = NOW(), status = ? WHERE id = ?',
            [response, adminId, status, id]
        );
        return true;
    }

    static async updateStatus(id, status) {
        await pool.query('UPDATE feedbacks SET status = ? WHERE id = ?', [status, id]);
        return true;
    }

    static async getStats() {
        const [result] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
            FROM feedbacks
        `);
        return result[0];
    }
}

module.exports = FeedbackModel;
