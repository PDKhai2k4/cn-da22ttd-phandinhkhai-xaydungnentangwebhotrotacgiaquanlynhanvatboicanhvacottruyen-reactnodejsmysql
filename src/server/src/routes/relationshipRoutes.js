const express = require('express');
const router = express.Router();
const RelationshipController = require('../controllers/RelationshipController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateRequest, relationshipValidation, idParam, projectIdParam, paginationQuery } = require('../middlewares/validateMiddleware');
const { param } = require('express-validator');

// Tất cả routes đều cần xác thực
router.use(authenticate);

// Lấy danh sách mối quan hệ theo project
router.get('/project/:projectId', projectIdParam, paginationQuery, validateRequest, RelationshipController.getRelationships);

// Lấy mối quan hệ của một nhân vật
router.get('/character/:characterId', 
    param('characterId').isInt({ min: 1 }).withMessage('Character ID không hợp lệ').toInt(),
    validateRequest,
    RelationshipController.getCharacterRelationships
);

// Tạo mối quan hệ mới
router.post('/project/:projectId', projectIdParam, relationshipValidation.create, validateRequest, RelationshipController.createRelationship);

// Cập nhật mối quan hệ
router.put('/:id', relationshipValidation.update, validateRequest, RelationshipController.updateRelationship);

// Xóa mối quan hệ
router.delete('/:id', idParam, validateRequest, RelationshipController.deleteRelationship);

module.exports = router;
