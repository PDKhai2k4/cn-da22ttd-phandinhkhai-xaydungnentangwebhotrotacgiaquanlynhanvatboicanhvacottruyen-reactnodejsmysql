const pool = require('../config/db');
const { sanitizeFields, buildUpdateQuery } = require('../utils/sanitize');

const TABLE_NAME = 'users';

class UserModel {
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT id, username, email, full_name, avatar, role, is_active, email_verified, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findByUsername(username) {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    static async create(userData) {
        const { username, email, password, full_name } = userData;
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
            [username, email, password, full_name || null]
        );
        return result.insertId;
    }

    static async update(id, userData) {
        // Sanitize fields to prevent SQL injection
        const sanitized = sanitizeFields(TABLE_NAME, userData);
        
        if (Object.keys(sanitized).length === 0) return false;
        
        const updateData = buildUpdateQuery(TABLE_NAME, sanitized, 'id');
        if (!updateData) return false;
        
        await pool.query(updateData.query, [...updateData.values, id]);
        return true;
    }

    static async delete(id) {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return true;
    }

    static async getAll(page = 1, limit = 20, search = '') {
        const offset = (page - 1) * limit;
        let query = 'SELECT id, username, email, full_name, avatar, role, is_active, created_at FROM users';
        let countQuery = 'SELECT COUNT(*) as total FROM users';
        const params = [];
        
        if (search) {
            query += ' WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?';
            countQuery += ' WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        
        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        
        return {
            users: rows,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    }

    static async toggleActive(id, isActive) {
        await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id]);
        return true;
    }
}

module.exports = UserModel;
