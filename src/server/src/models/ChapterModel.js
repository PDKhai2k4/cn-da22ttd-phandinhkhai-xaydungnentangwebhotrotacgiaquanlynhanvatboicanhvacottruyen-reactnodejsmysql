const pool = require('../config/db');
const { countWords } = require('../utils/helpers');
const { sanitizeFields, buildUpdateQuery } = require('../utils/sanitize');

const TABLE_NAME = 'chapters';

class ChapterModel {
    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM chapters WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByProjectId(projectId, page = 1, limit = 20, search = '') {
        const offset = (page - 1) * limit;
        let query = 'SELECT id, project_id, title, chapter_number, word_count, status, created_at, updated_at FROM chapters WHERE project_id = ?';
        let countQuery = 'SELECT COUNT(*) as total FROM chapters WHERE project_id = ?';
        const params = [projectId];
        
        if (search) {
            query += ' AND (title LIKE ? OR content LIKE ?)';
            countQuery += ' AND (title LIKE ? OR content LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY chapter_number ASC LIMIT ? OFFSET ?';
        
        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        
        return { chapters: rows, total: countResult[0].total, page, totalPages: Math.ceil(countResult[0].total / limit) };
    }

    // Kiểm tra chapter_number đã tồn tại trong project chưa
    static async isChapterNumberExists(projectId, chapterNumber, excludeId = null) {
        let query = 'SELECT id FROM chapters WHERE project_id = ? AND chapter_number = ?';
        const params = [projectId, chapterNumber];
        
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await pool.query(query, params);
        return rows.length > 0;
    }

    static async create(data) {
        const { project_id, title, content, chapter_number, status } = data;
        
        // Kiểm tra chapter_number unique
        const exists = await ChapterModel.isChapterNumberExists(project_id, chapter_number);
        if (exists) {
            throw new Error('CHAPTER_NUMBER_EXISTS');
        }
        
        const word_count = countWords(content);
        const [result] = await pool.query(
            'INSERT INTO chapters (project_id, title, content, chapter_number, word_count, status) VALUES (?, ?, ?, ?, ?, ?)',
            [project_id, title, content, chapter_number, word_count, status || 'draft']
        );
        return result.insertId;
    }

    static async update(id, data) {
        // Calculate word count if content is being updated
        if (data.content !== undefined) {
            data.word_count = countWords(data.content);
        }
        
        // Nếu update chapter_number, kiểm tra unique
        if (data.chapter_number !== undefined) {
            const chapter = await ChapterModel.findById(id);
            if (chapter) {
                const exists = await ChapterModel.isChapterNumberExists(
                    chapter.project_id, 
                    data.chapter_number, 
                    id
                );
                if (exists) {
                    throw new Error('CHAPTER_NUMBER_EXISTS');
                }
            }
        }
        
        // Sanitize fields to prevent SQL injection
        const sanitized = sanitizeFields(TABLE_NAME, data);
        
        if (Object.keys(sanitized).length === 0) return false;
        
        const updateData = buildUpdateQuery(TABLE_NAME, sanitized, 'id');
        if (!updateData) return false;
        
        await pool.query(updateData.query, [...updateData.values, id]);
        return true;
    }

    static async delete(id) {
        await pool.query('DELETE FROM chapters WHERE id = ?', [id]);
        return true;
    }

    static async getNextChapterNumber(projectId) {
        const [rows] = await pool.query(
            'SELECT MAX(chapter_number) as max_num FROM chapters WHERE project_id = ?',
            [projectId]
        );
        return (rows[0].max_num || 0) + 1;
    }

    static async getTotalWordCount(projectId) {
        const [rows] = await pool.query(
            'SELECT SUM(word_count) as total FROM chapters WHERE project_id = ?',
            [projectId]
        );
        return rows[0].total || 0;
    }
}

module.exports = ChapterModel;
