const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/ItemController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateRequest, itemValidation, idParam, projectIdParam, paginationQuery } = require('../middlewares/validateMiddleware');

router.use(authenticate);

// GET /items/project/:projectId - List items
router.get('/project/:projectId', projectIdParam, paginationQuery, validateRequest, ItemController.getItems);

// GET /items/:id - Get single item
router.get('/:id', idParam, validateRequest, ItemController.getItem);

// POST /items/project/:projectId - Create item
router.post('/project/:projectId', itemValidation.create, validateRequest, ItemController.createItem);

// PUT /items/:id - Update item
router.put('/:id', itemValidation.update, validateRequest, ItemController.updateItem);

// DELETE /items/:id - Delete item
router.delete('/:id', idParam, validateRequest, ItemController.deleteItem);

module.exports = router;
