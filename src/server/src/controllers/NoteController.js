const NoteModel = require('../models/NoteModel');
const ProjectModel = require('../models/ProjectModel');

class NoteController {
    static async getNotes(req, res) {
        try {
            const { projectId } = req.params;
            const { page = 1, limit = 20, search = '' } = req.query;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            const result = await NoteModel.findByProjectId(projectId, parseInt(page), parseInt(limit), search);
            res.json(result);
        } catch (error) {
            console.error('Get notes error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async getNote(req, res) {
        try {
            const { id } = req.params;
            const note = await NoteModel.findById(id);
            
            if (!note) {
                return res.status(404).json({ message: 'Không tìm thấy ghi chú' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(note.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            res.json({ note });
        } catch (error) {
            console.error('Get note error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async createNote(req, res) {
        try {
            const { projectId } = req.params;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền tạo ghi chú' });
            }
            
            const noteId = await NoteModel.create({ ...req.body, project_id: projectId });
            const note = await NoteModel.findById(noteId);
            
            res.status(201).json({ message: 'Tạo ghi chú thành công', note });
        } catch (error) {
            console.error('Create note error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async updateNote(req, res) {
        try {
            const { id } = req.params;
            const note = await NoteModel.findById(id);
            
            if (!note) {
                return res.status(404).json({ message: 'Không tìm thấy ghi chú' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(note.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
            }
            
            await NoteModel.update(id, req.body);
            const updated = await NoteModel.findById(id);
            
            res.json({ message: 'Cập nhật thành công', note: updated });
        } catch (error) {
            console.error('Update note error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async deleteNote(req, res) {
        try {
            const { id } = req.params;
            const note = await NoteModel.findById(id);
            
            if (!note) {
                return res.status(404).json({ message: 'Không tìm thấy ghi chú' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(note.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền xóa' });
            }
            
            await NoteModel.delete(id);
            res.json({ message: 'Xóa ghi chú thành công' });
        } catch (error) {
            console.error('Delete note error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = NoteController;
