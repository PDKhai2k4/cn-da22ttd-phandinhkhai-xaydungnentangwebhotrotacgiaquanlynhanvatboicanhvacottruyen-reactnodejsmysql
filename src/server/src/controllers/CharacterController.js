const CharacterModel = require('../models/CharacterModel');
const ProjectModel = require('../models/ProjectModel');

class CharacterController {
    static async getCharacters(req, res) {
        try {
            const { projectId } = req.params;
            const { page = 1, limit = 20, search = '' } = req.query;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            const result = await CharacterModel.findByProjectId(projectId, parseInt(page), parseInt(limit), search);
            res.json(result);
        } catch (error) {
            console.error('Get characters error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async getCharacter(req, res) {
        try {
            const { id } = req.params;
            const character = await CharacterModel.findById(id);
            
            if (!character) {
                return res.status(404).json({ message: 'Không tìm thấy nhân vật' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(character.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            res.json({ character });
        } catch (error) {
            console.error('Get character error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async createCharacter(req, res) {
        try {
            const { projectId } = req.params;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền tạo nhân vật' });
            }
            
            const characterId = await CharacterModel.create({ ...req.body, project_id: projectId });
            const character = await CharacterModel.findById(characterId);
            
            res.status(201).json({ message: 'Tạo nhân vật thành công', character });
        } catch (error) {
            console.error('Create character error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async updateCharacter(req, res) {
        try {
            const { id } = req.params;
            const character = await CharacterModel.findById(id);
            
            if (!character) {
                return res.status(404).json({ message: 'Không tìm thấy nhân vật' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(character.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
            }
            
            await CharacterModel.update(id, req.body);
            const updated = await CharacterModel.findById(id);
            
            res.json({ message: 'Cập nhật thành công', character: updated });
        } catch (error) {
            console.error('Update character error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async deleteCharacter(req, res) {
        try {
            const { id } = req.params;
            const character = await CharacterModel.findById(id);
            
            if (!character) {
                return res.status(404).json({ message: 'Không tìm thấy nhân vật' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(character.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền xóa' });
            }
            
            await CharacterModel.delete(id);
            res.json({ message: 'Xóa nhân vật thành công' });
        } catch (error) {
            console.error('Delete character error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = CharacterController;
