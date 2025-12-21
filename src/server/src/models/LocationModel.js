const pool = require('../config/db');
const { sanitizeFields, buildUpdateQuery } = require('../utils/sanitize');

const TABLE_NAME = 'locations';

class LocationModel {
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM locations WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByProjectId(projectId, page = 1, limit = 50, search = '') {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM locations WHERE project_id = ?';
        let countQuery = 'SELECT COUNT(*) as total FROM locations WHERE project_id = ?';
        const params = [projectId];
        
        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            countQuery += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY parent_id IS NULL DESC, name ASC LIMIT ? OFFSET ?';
        
        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        
        return { 
            locations: rows, 
            total: countResult[0].total, 
            page, 
            totalPages: Math.ceil(countResult[0].total / limit) 
        };
    }

    static async getTree(projectId) {
        const [rows] = await pool.query(
            'SELECT * FROM locations WHERE project_id = ? ORDER BY parent_id IS NULL DESC, name ASC',
            [projectId]
        );
        
        // Build tree structure
        const map = {};
        const roots = [];
        
        rows.forEach(loc => {
            map[loc.id] = { ...loc, children: [] };
        });
        
        rows.forEach(loc => {
            if (loc.parent_id && map[loc.parent_id]) {
                map[loc.parent_id].children.push(map[loc.id]);
            } else {
                roots.push(map[loc.id]);
            }
        });
        
        return roots;
    }

    static async create(data) {
        const { project_id, parent_id, name, description, history, image, location_type } = data;
        const [result] = await pool.query(
            'INSERT INTO locations (project_id, parent_id, name, description, history, image, location_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [project_id, parent_id || null, name, description, history, image, location_type || 'city']
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
        await pool.query('DELETE FROM locations WHERE id = ?', [id]);
        return true;
    }
}

module.exports = LocationModel;
