const TimelineModel = require('../models/TimelineModel');
const ProjectModel = require('../models/ProjectModel');

class TimelineController {
    static async getTimeline(req, res) {
        try {
            const { projectId } = req.params;
            const { search = '', page = 1, limit = 50 } = req.query;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            const result = await TimelineModel.findByProjectId(projectId, parseInt(page), parseInt(limit), search);
            res.json({ events: result.events, total: result.total, page: result.page, totalPages: result.totalPages });
        } catch (error) {
            console.error('Get timeline error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async getEvent(req, res) {
        try {
            const { id } = req.params;
            const event = await TimelineModel.findById(id);
            
            if (!event) {
                return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(event.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            res.json({ event });
        } catch (error) {
            console.error('Get event error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async createEvent(req, res) {
        try {
            const { projectId } = req.params;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền tạo sự kiện' });
            }
            
            const eventId = await TimelineModel.create({ ...req.body, project_id: projectId });
            const event = await TimelineModel.findById(eventId);
            
            res.status(201).json({ message: 'Tạo sự kiện thành công', event });
        } catch (error) {
            console.error('Create event error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const event = await TimelineModel.findById(id);
            
            if (!event) {
                return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(event.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
            }
            
            await TimelineModel.update(id, req.body);
            const updated = await TimelineModel.findById(id);
            
            res.json({ message: 'Cập nhật thành công', event: updated });
        } catch (error) {
            console.error('Update event error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            const event = await TimelineModel.findById(id);
            
            if (!event) {
                return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(event.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền xóa' });
            }
            
            await TimelineModel.delete(id);
            res.json({ message: 'Xóa sự kiện thành công' });
        } catch (error) {
            console.error('Delete event error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async reorderEvents(req, res) {
        try {
            const { projectId } = req.params;
            const { orderedIds } = req.body;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền sắp xếp' });
            }
            
            await TimelineModel.reorder(projectId, orderedIds);
            res.json({ message: 'Sắp xếp thành công' });
        } catch (error) {
            console.error('Reorder events error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = TimelineController;
