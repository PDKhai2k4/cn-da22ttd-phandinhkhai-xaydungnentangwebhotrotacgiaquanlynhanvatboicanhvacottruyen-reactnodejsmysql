const pool = require('../config/db');
const { sanitizeFields, buildUpdateQuery } = require('../utils/sanitize');

const TABLE_NAME = 'notes';

class NoteModel {
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByProjectId(projectId, page = 1, limit = 20, search = '') {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM notes WHERE project_id = ?';
        let countQuery = 'SELECT COUNT(*) as total FROM notes WHERE project_id = ?';
        const params = [projectId];
        
        if (search) {
            query += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
            countQuery += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
        
        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        
        return { notes: rows, total: countResult[0].total, page, totalPages: Math.ceil(countResult[0].total / limit) };
    }

    static async create(data) {
        const { project_id, title, content, note_type, tags } = data;
        const [result] = await pool.query(
            'INSERT INTO notes (project_id, title, content, note_type, tags) VALUES (?, ?, ?, ?, ?)',
            [project_id, title, content, note_type || 'idea', tags]
        );
        return result.insertId;
    }

    static async update(id, data) {
        // Sanitize fields to prevent SQL injection
        const sanitized = sanitizeFields(TABLE_NAME, data);
        
        if (Object.keys(sanitized).length === 0) return false;
        
        const updateData = buildUpdateQuery(TABLE_NAME, sanitized, 'id');
        if (!updateData) return false;
        
        await pool.query(updateData.query, [...updateData.values, id]);
        return true;
    }

    static async delete(id) {
        await pool.query('DELETE FROM notes WHERE id = ?', [id]);
        return true;
    }
}

module.exports = NoteModel;
