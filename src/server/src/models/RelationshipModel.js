const pool = require('../config/db');
const { sanitizeFields, buildUpdateQuery } = require('../utils/sanitize');

const TABLE_NAME = 'character_relationships';

class RelationshipModel {
    static async findById(id) {
        const [rows] = await pool.query(`
            SELECT r.*, c1.name as character1_name, c2.name as character2_name 
            FROM character_relationships r
            JOIN characters c1 ON r.character1_id = c1.id
            JOIN characters c2 ON r.character2_id = c2.id
            WHERE r.id = ?
        `, [id]);
        return rows[0];
    }

    static async findByProjectId(projectId, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const [rows] = await pool.query(`
            SELECT r.*, c1.name as character1_name, c2.name as character2_name 
            FROM character_relationships r
            JOIN characters c1 ON r.character1_id = c1.id
            JOIN characters c2 ON r.character2_id = c2.id
            WHERE c1.project_id = ?
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        `, [projectId, limit, offset]);
        
        const [countResult] = await pool.query(`
            SELECT COUNT(*) as total 
            FROM character_relationships r
            JOIN characters c1 ON r.character1_id = c1.id
            WHERE c1.project_id = ?
        `, [projectId]);
        
        return { 
            relationships: rows, 
            total: countResult[0].total, 
            page, 
            totalPages: Math.ceil(countResult[0].total / limit) 
        };
    }

    static async findByCharacterId(characterId) {
        const [rows] = await pool.query(`
            SELECT r.*, c1.name as character1_name, c2.name as character2_name 
            FROM character_relationships r
            JOIN characters c1 ON r.character1_id = c1.id
            JOIN characters c2 ON r.character2_id = c2.id
            WHERE r.character1_id = ? OR r.character2_id = ?
        `, [characterId, characterId]);
        return rows;
    }

    static async create(data) {
        const { character1_id, character2_id, relationship_type, description } = data;
        const [result] = await pool.query(
            'INSERT INTO character_relationships (character1_id, character2_id, relationship_type, description) VALUES (?, ?, ?, ?)',
            [character1_id, character2_id, relationship_type, description]
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
        await pool.query('DELETE FROM character_relationships WHERE id = ?', [id]);
        return true;
    }
}

module.exports = RelationshipModel;
