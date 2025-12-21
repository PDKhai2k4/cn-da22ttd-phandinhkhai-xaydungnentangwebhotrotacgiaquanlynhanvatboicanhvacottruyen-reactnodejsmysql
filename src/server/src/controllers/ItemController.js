const ItemModel = require('../models/ItemModel');
const ProjectModel = require('../models/ProjectModel');

class ItemController {
    static async getItems(req, res) {
        try {
            const { projectId } = req.params;
            const { page = 1, limit = 20, search = '' } = req.query;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            const result = await ItemModel.findByProjectId(projectId, parseInt(page), parseInt(limit), search);
            res.json(result);
        } catch (error) {
            console.error('Get items error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async getItem(req, res) {
        try {
            const { id } = req.params;
            const item = await ItemModel.findById(id);
            
            if (!item) {
                return res.status(404).json({ message: 'Không tìm thấy vật phẩm' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(item.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            res.json({ item });
        } catch (error) {
            console.error('Get item error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async createItem(req, res) {
        try {
            const { projectId } = req.params;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền tạo vật phẩm' });
            }
            
            const itemId = await ItemModel.create({ ...req.body, project_id: projectId });
            const item = await ItemModel.findById(itemId);
            
            res.status(201).json({ message: 'Tạo vật phẩm thành công', item });
        } catch (error) {
            console.error('Create item error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async updateItem(req, res) {
        try {
            const { id } = req.params;
            const item = await ItemModel.findById(id);
            
            if (!item) {
                return res.status(404).json({ message: 'Không tìm thấy vật phẩm' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(item.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
            }
            
            await ItemModel.update(id, req.body);
            const updated = await ItemModel.findById(id);
            
            res.json({ message: 'Cập nhật thành công', item: updated });
        } catch (error) {
            console.error('Update item error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async deleteItem(req, res) {
        try {
            const { id } = req.params;
            const item = await ItemModel.findById(id);
            
            if (!item) {
                return res.status(404).json({ message: 'Không tìm thấy vật phẩm' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(item.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền xóa' });
            }
            
            await ItemModel.delete(id);
            res.json({ message: 'Xóa vật phẩm thành công' });
        } catch (error) {
            console.error('Delete item error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = ItemController;
