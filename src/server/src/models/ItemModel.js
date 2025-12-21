const pool = require('../config/db');
const { sanitizeFields, buildUpdateQuery } = require('../utils/sanitize');

const TABLE_NAME = 'items';

class ItemModel {
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByProjectId(projectId, page = 1, limit = 20, search = '') {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM items WHERE project_id = ?';
        let countQuery = 'SELECT COUNT(*) as total FROM items WHERE project_id = ?';
        const params = [projectId];
        
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            countQuery += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        
        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        
        return { items: rows, total: countResult[0].total, page, totalPages: Math.ceil(countResult[0].total / limit) };
    }

    static async create(data) {
        const { project_id, name, description, properties, image, item_type, rarity } = data;
        const [result] = await pool.query(
            'INSERT INTO items (project_id, name, description, properties, image, item_type, rarity) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [project_id, name, description, properties, image, item_type || 'other', rarity || 'common']
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
        await pool.query('DELETE FROM items WHERE id = ?', [id]);
        return true;
    }
}

module.exports = ItemModel;
