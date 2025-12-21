const pool = require('../config/db');
const { sanitizeFields, buildUpdateQuery } = require('../utils/sanitize');

const TABLE_NAME = 'timeline_events';

class TimelineModel {
    static async findById(id) {
        const [rows] = await pool.query(`
            SELECT t.*, l.name as location_name 
            FROM timeline_events t
            LEFT JOIN locations l ON t.location_id = l.id
            WHERE t.id = ?
        `, [id]);
        return rows[0];
    }

    static async findByProjectId(projectId, page = 1, limit = 50, search = '') {
        const offset = (page - 1) * limit;
        let query = `
            SELECT t.*, l.name as location_name 
            FROM timeline_events t
            LEFT JOIN locations l ON t.location_id = l.id
            WHERE t.project_id = ?
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM timeline_events WHERE project_id = ?';
        const params = [projectId];
        
        if (search) {
            query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
            countQuery += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY t.event_order ASC, t.created_at ASC LIMIT ? OFFSET ?';
        
        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        
        return { 
            events: rows, 
            total: countResult[0].total, 
            page, 
            totalPages: Math.ceil(countResult[0].total / limit) 
        };
    }

    static async create(data) {
        const { project_id, title, description, event_date, event_order, location_id, importance, event_type } = data;
        const [result] = await pool.query(
            'INSERT INTO timeline_events (project_id, title, description, event_date, event_order, location_id, importance, event_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [project_id, title, description, event_date, event_order || 0, location_id, importance || 'medium', event_type || 'plot']
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
        await pool.query('DELETE FROM timeline_events WHERE id = ?', [id]);
        return true;
    }

    // Reorder with transaction to ensure data consistency
    static async reorder(projectId, orderedIds) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            for (let i = 0; i < orderedIds.length; i++) {
                await connection.query(
                    'UPDATE timeline_events SET event_order = ? WHERE id = ? AND project_id = ?', 
                    [i, orderedIds[i], projectId]
                );
            }
            
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = TimelineModel;
