const RelationshipModel = require('../models/RelationshipModel');
const CharacterModel = require('../models/CharacterModel');
const ProjectModel = require('../models/ProjectModel');

class RelationshipController {
    static async getRelationships(req, res) {
        try {
            const { projectId } = req.params;
            const { page = 1, limit = 50 } = req.query;
            
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            const result = await RelationshipModel.findByProjectId(projectId, parseInt(page), parseInt(limit));
            res.json(result);
        } catch (error) {
            console.error('Get relationships error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async getCharacterRelationships(req, res) {
        try {
            const { characterId } = req.params;
            const character = await CharacterModel.findById(characterId);
            
            if (!character) {
                return res.status(404).json({ message: 'Không tìm thấy nhân vật' });
            }
            
            const isOwner = await ProjectModel.checkOwnership(character.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            const relationships = await RelationshipModel.findByCharacterId(characterId);
            res.json({ relationships });
        } catch (error) {
            console.error('Get character relationships error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async createRelationship(req, res) {
        try {
            const { projectId } = req.params;
            const { character1_id, character2_id, relationship_type, description } = req.body;
            
            // Check project ownership first
            const isOwner = await ProjectModel.checkOwnership(projectId, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền tạo mối quan hệ' });
            }
            
            const char1 = await CharacterModel.findById(character1_id);
            const char2 = await CharacterModel.findById(character2_id);
            
            if (!char1 || !char2) {
                return res.status(404).json({ message: 'Không tìm thấy nhân vật' });
            }
            
            // Verify both characters belong to the same project
            if (char1.project_id !== parseInt(projectId) || char2.project_id !== parseInt(projectId)) {
                return res.status(400).json({ message: 'Hai nhân vật phải thuộc cùng một dự án' });
            }
            
            const relationshipId = await RelationshipModel.create({ character1_id, character2_id, relationship_type, description });
            const relationship = await RelationshipModel.findById(relationshipId);
            
            res.status(201).json({ message: 'Tạo mối quan hệ thành công', relationship });
        } catch (error) {
            console.error('Create relationship error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async updateRelationship(req, res) {
        try {
            const { id } = req.params;
            const relationship = await RelationshipModel.findById(id);
            
            if (!relationship) {
                return res.status(404).json({ message: 'Không tìm thấy mối quan hệ' });
            }
            
            const char1 = await CharacterModel.findById(relationship.character1_id);
            const isOwner = await ProjectModel.checkOwnership(char1.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
            }
            
            await RelationshipModel.update(id, req.body);
            const updated = await RelationshipModel.findById(id);
            
            res.json({ message: 'Cập nhật thành công', relationship: updated });
        } catch (error) {
            console.error('Update relationship error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    static async deleteRelationship(req, res) {
        try {
            const { id } = req.params;
            const relationship = await RelationshipModel.findById(id);
            
            if (!relationship) {
                return res.status(404).json({ message: 'Không tìm thấy mối quan hệ' });
            }
            
            const char1 = await CharacterModel.findById(relationship.character1_id);
            const isOwner = await ProjectModel.checkOwnership(char1.project_id, req.user.id);
            if (!isOwner && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Không có quyền xóa' });
            }
            
            await RelationshipModel.delete(id);
            res.json({ message: 'Xóa mối quan hệ thành công' });
        } catch (error) {
            console.error('Delete relationship error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = RelationshipController;
