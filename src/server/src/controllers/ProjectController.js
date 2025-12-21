const ProjectModel = require('../models/ProjectModel');

class ProjectController {
    // Lấy danh sách dự án của user
    static async getProjects(req, res) {
        try {
            const { page = 1, limit = 20, search = '' } = req.query;
            const result = await ProjectModel.findByUserId(
                req.user.id,
                parseInt(page),
                parseInt(limit),
                search
            );
            res.json(result);
        } catch (error) {
            console.error('Get projects error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Lấy chi tiết dự án
    static async getProject(req, res) {
        try {
            const { id } = req.params;
            const project = await ProjectModel.findById(id);
            
            if (!project) {
                return res.status(404).json({ message: 'Không tìm thấy dự án' });
            }
            
            // Kiểm tra quyền sở hữu
            if (project.user_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            res.json({ project });
        } catch (error) {
            console.error('Get project error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Tạo dự án mới
    static async createProject(req, res) {
        try {
            const { title, description, genre, status, cover_image } = req.body;
            
            const projectId = await ProjectModel.create({
                user_id: req.user.id,
                title,
                description,
                genre,
                status,
                cover_image
            });
            
            const project = await ProjectModel.findById(projectId);
            res.status(201).json({ message: 'Tạo dự án thành công', project });
        } catch (error) {
            console.error('Create project error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Cập nhật dự án
    static async updateProject(req, res) {
        try {
            const { id } = req.params;
            
            const isOwner = await ProjectModel.checkOwnership(id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
            }
            
            await ProjectModel.update(id, req.body);
            const project = await ProjectModel.findById(id);
            
            res.json({ message: 'Cập nhật thành công', project });
        } catch (error) {
            console.error('Update project error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Xóa dự án
    static async deleteProject(req, res) {
        try {
            const { id } = req.params;
            
            const isOwner = await ProjectModel.checkOwnership(id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền xóa' });
            }
            
            await ProjectModel.delete(id);
            res.json({ message: 'Xóa dự án thành công' });
        } catch (error) {
            console.error('Delete project error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Thống kê dự án
    static async getStats(req, res) {
        try {
            const stats = await ProjectModel.getStats(req.user.id);
            res.json({ stats });
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = ProjectController;
