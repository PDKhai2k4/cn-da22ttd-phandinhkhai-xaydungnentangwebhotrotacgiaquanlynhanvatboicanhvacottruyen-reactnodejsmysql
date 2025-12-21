const ChapterModel = require('../models/ChapterModel');
const ProjectModel = require('../models/ProjectModel');

class ChapterController {
    static async getChapters(req, res) {
        try {
            const { projectId } = req.params;
            const { page = 1, limit = 20, search = '' } = req.query;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            const result = await ChapterModel.findByProjectId(projectId, parseInt(page), parseInt(limit), search);
            const totalWords = await ChapterModel.getTotalWordCount(projectId);
            
            res.json({ ...result, totalWords });
        } catch (error) {
            console.error('Get chapters error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async getChapter(req, res) {
        try {
            const { id } = req.params;
            const chapter = await ChapterModel.findById(id);
            
            if (!chapter) {
                return res.status(404).json({ message: 'Không tìm thấy chương' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(chapter.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            res.json({ chapter });
        } catch (error) {
            console.error('Get chapter error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async createChapter(req, res) {
        try {
            const { projectId } = req.params;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền tạo chương' });
            }
            
            // Tự động lấy số chương tiếp theo nếu không có
            let { chapter_number } = req.body;
            if (!chapter_number) {
                chapter_number = await ChapterModel.getNextChapterNumber(projectId);
            }
            
            const chapterId = await ChapterModel.create({ ...req.body, project_id: projectId, chapter_number });
            const chapter = await ChapterModel.findById(chapterId);
            
            res.status(201).json({ message: 'Tạo chương thành công', chapter });
        } catch (error) {
            console.error('Create chapter error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async updateChapter(req, res) {
        try {
            const { id } = req.params;
            const chapter = await ChapterModel.findById(id);
            
            if (!chapter) {
                return res.status(404).json({ message: 'Không tìm thấy chương' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(chapter.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
            }
            
            await ChapterModel.update(id, req.body);
            const updated = await ChapterModel.findById(id);
            
            res.json({ message: 'Cập nhật thành công', chapter: updated });
        } catch (error) {
            console.error('Update chapter error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async deleteChapter(req, res) {
        try {
            const { id } = req.params;
            const chapter = await ChapterModel.findById(id);
            
            if (!chapter) {
                return res.status(404).json({ message: 'Không tìm thấy chương' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(chapter.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền xóa' });
            }
            
            await ChapterModel.delete(id);
            res.json({ message: 'Xóa chương thành công' });
        } catch (error) {
            console.error('Delete chapter error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = ChapterController;
