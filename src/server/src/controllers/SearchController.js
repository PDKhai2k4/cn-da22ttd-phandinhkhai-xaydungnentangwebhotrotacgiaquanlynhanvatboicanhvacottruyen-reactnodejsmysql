const pool = require('../config/db');
const ProjectModel = require('../models/ProjectModel');

class SearchController {
    // Tìm kiếm trong một dự án
    static async searchInProject(req, res) {
        try {
            const { projectId } = req.params;
            const { q, type } = req.query;
            
            if (!q || q.trim().length < 2) {
                return res.status(400).json({ message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            const searchTerm = `%${q}%`;
            const results = {};
            
            // Tìm theo loại hoặc tất cả
            const types = type ? [type] : ['characters', 'locations', 'items', 'chapters', 'notes', 'timeline'];
            
            if (types.includes('characters')) {
                const [chars] = await pool.query(
                    'SELECT id, name, description, role FROM characters WHERE project_id = ? AND (name LIKE ? OR description LIKE ?) LIMIT 20',
                    [projectId, searchTerm, searchTerm]
                );
                results.characters = chars;
            }
            
            if (types.includes('locations')) {
                const [locs] = await pool.query(
                    'SELECT id, name, description, location_type FROM locations WHERE project_id = ? AND (name LIKE ? OR description LIKE ?) LIMIT 20',
                    [projectId, searchTerm, searchTerm]
                );
                results.locations = locs;
            }
            
            if (types.includes('items')) {
                const [items] = await pool.query(
                    'SELECT id, name, description, item_type FROM items WHERE project_id = ? AND (name LIKE ? OR description LIKE ?) LIMIT 20',
                    [projectId, searchTerm, searchTerm]
                );
                results.items = items;
            }
            
            if (types.includes('chapters')) {
                const [chapters] = await pool.query(
                    'SELECT id, title, chapter_number, status FROM chapters WHERE project_id = ? AND (title LIKE ? OR content LIKE ?) LIMIT 20',
                    [projectId, searchTerm, searchTerm]
                );
                results.chapters = chapters;
            }
            
            if (types.includes('notes')) {
                const [notes] = await pool.query(
                    'SELECT id, title, note_type, tags FROM notes WHERE project_id = ? AND (title LIKE ? OR content LIKE ? OR tags LIKE ?) LIMIT 20',
                    [projectId, searchTerm, searchTerm, searchTerm]
                );
                results.notes = notes;
            }
            
            if (types.includes('timeline')) {
                const [events] = await pool.query(
                    'SELECT id, title, description, event_date FROM timeline_events WHERE project_id = ? AND (title LIKE ? OR description LIKE ?) LIMIT 20',
                    [projectId, searchTerm, searchTerm]
                );
                results.timeline = events;
            }
            
            res.json({ results, query: q });
        } catch (error) {
            console.error('Search in project error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Tìm kiếm dự án
    static async searchProjects(req, res) {
        try {
            const { q } = req.query;
            
            if (!q || q.trim().length < 2) {
                return res.status(400).json({ message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' });
            }
            
            const searchTerm = `%${q}%`;
            const [projects] = await pool.query(
                'SELECT id, title, description, genre, status FROM projects WHERE user_id = ? AND (title LIKE ? OR description LIKE ?) LIMIT 20',
                [req.user.id, searchTerm, searchTerm]
            );
            
            res.json({ projects, query: q });
        } catch (error) {
            console.error('Search projects error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = SearchController;
