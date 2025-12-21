const pool = require('../config/db');
const { sanitizeFields, buildUpdateQuery } = require('../utils/sanitize');

const TABLE_NAME = 'projects';

class ProjectModel {
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByUserId(userId, page = 1, limit = 20, search = '') {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM projects WHERE user_id = ?';
        let countQuery = 'SELECT COUNT(*) as total FROM projects WHERE user_id = ?';
        const params = [userId];
        
        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            countQuery += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
        
        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        
        return {
            projects: rows,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    }

    static async create(projectData) {
        const { user_id, title, description, genre, status, cover_image } = projectData;
        const [result] = await pool.query(
            'INSERT INTO projects (user_id, title, description, genre, status, cover_image) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, title, description || null, genre || null, status || 'planning', cover_image || null]
        );
        return result.insertId;
    }

    static async update(id, projectData) {
        // Sanitize fields to prevent SQL injection
        const sanitized = sanitizeFields(TABLE_NAME, projectData);
        
        if (Object.keys(sanitized).length === 0) return false;
        
        const updateData = buildUpdateQuery(TABLE_NAME, sanitized, 'id');
        if (!updateData) return false;
        
        await pool.query(updateData.query, [...updateData.values, id]);
        return true;
    }

    static async delete(id) {
        await pool.query('DELETE FROM projects WHERE id = ?', [id]);
        return true;
    }

    static async checkOwnership(projectId, userId) {
        const [rows] = await pool.query(
            'SELECT id FROM projects WHERE id = ? AND user_id = ?',
            [projectId, userId]
        );
        return rows.length > 0;
    }

    static async getStats(userId) {
        const [result] = await pool.query(
            `SELECT 
                COUNT(*) as total_projects,
                SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning,
                SUM(CASE WHEN status = 'writing' THEN 1 ELSE 0 END) as writing,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused
            FROM projects WHERE user_id = ?`,
            [userId]
        );
        return result[0];
    }
}

module.exports = ProjectModel;
