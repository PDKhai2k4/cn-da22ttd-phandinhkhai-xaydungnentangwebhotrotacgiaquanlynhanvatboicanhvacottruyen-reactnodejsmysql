const LocationModel = require('../models/LocationModel');
const ProjectModel = require('../models/ProjectModel');

class LocationController {
    static async getLocations(req, res) {
        try {
            const { projectId } = req.params;
            const { search = '', page = 1, limit = 50 } = req.query;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            const result = await LocationModel.findByProjectId(projectId, parseInt(page), parseInt(limit), search);
            res.json({ locations: result.locations, total: result.total, page: result.page, totalPages: result.totalPages });
        } catch (error) {
            console.error('Get locations error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async getLocationTree(req, res) {
        try {
            const { projectId } = req.params;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            const tree = await LocationModel.getTree(projectId);
            res.json({ tree });
        } catch (error) {
            console.error('Get location tree error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async getLocation(req, res) {
        try {
            const { id } = req.params;
            const location = await LocationModel.findById(id);
            
            if (!location) {
                return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(location.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            res.json({ location });
        } catch (error) {
            console.error('Get location error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async createLocation(req, res) {
        try {
            const { projectId } = req.params;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền tạo địa điểm' });
            }
            
            const locationId = await LocationModel.create({ ...req.body, project_id: projectId });
            const location = await LocationModel.findById(locationId);
            
            res.status(201).json({ message: 'Tạo địa điểm thành công', location });
        } catch (error) {
            console.error('Create location error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async updateLocation(req, res) {
        try {
            const { id } = req.params;
            const location = await LocationModel.findById(id);
            
            if (!location) {
                return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(location.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
            }
            
            await LocationModel.update(id, req.body);
            const updated = await LocationModel.findById(id);
            
            res.json({ message: 'Cập nhật thành công', location: updated });
        } catch (error) {
            console.error('Update location error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async deleteLocation(req, res) {
        try {
            const { id } = req.params;
            const location = await LocationModel.findById(id);
            
            if (!location) {
                return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(location.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền xóa' });
            }
            
            await LocationModel.delete(id);
            res.json({ message: 'Xóa địa điểm thành công' });
        } catch (error) {
            console.error('Delete location error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = LocationController;
