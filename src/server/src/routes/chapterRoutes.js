const express = require('express');
const router = express.Router();
const ChapterController = require('../controllers/ChapterController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateRequest, chapterValidation, idParam, projectIdParam, paginationQuery } = require('../middlewares/validateMiddleware');

router.use(authenticate);

// GET /chapters/project/:projectId - List chapters
router.get('/project/:projectId', projectIdParam, paginationQuery, validateRequest, ChapterController.getChapters);

// GET /chapters/:id - Get single chapter
router.get('/:id', idParam, validateRequest, ChapterController.getChapter);

// POST /chapters/project/:projectId - Create chapter
router.post('/project/:projectId', chapterValidation.create, validateRequest, ChapterController.createChapter);

// PUT /chapters/:id - Update chapter
router.put('/:id', chapterValidation.update, validateRequest, ChapterController.updateChapter);

// DELETE /chapters/:id - Delete chapter
router.delete('/:id', idParam, validateRequest, ChapterController.deleteChapter);

module.exports = router;
