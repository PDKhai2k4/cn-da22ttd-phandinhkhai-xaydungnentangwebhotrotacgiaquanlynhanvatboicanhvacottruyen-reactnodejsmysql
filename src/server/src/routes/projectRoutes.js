const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateRequest, projectValidation, idParam, paginationQuery } = require('../middlewares/validateMiddleware');

router.use(authenticate);

// GET /projects - List projects with pagination
router.get('/', paginationQuery, validateRequest, ProjectController.getProjects);

// GET /projects/stats - Get project statistics
router.get('/stats', ProjectController.getStats);

// GET /projects/:id - Get single project
router.get('/:id', idParam, validateRequest, ProjectController.getProject);

// POST /projects - Create new project
router.post('/', projectValidation.create, validateRequest, ProjectController.createProject);

// PUT /projects/:id - Update project
router.put('/:id', projectValidation.update, validateRequest, ProjectController.updateProject);

// DELETE /projects/:id - Delete project
router.delete('/:id', idParam, validateRequest, ProjectController.deleteProject);

module.exports = router;
