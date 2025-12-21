const express = require('express');
const router = express.Router();
const NoteController = require('../controllers/NoteController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateRequest, noteValidation, idParam, projectIdParam, paginationQuery } = require('../middlewares/validateMiddleware');

router.use(authenticate);

// GET /notes/project/:projectId - List notes
router.get('/project/:projectId', projectIdParam, paginationQuery, validateRequest, NoteController.getNotes);

// GET /notes/:id - Get single note
router.get('/:id', idParam, validateRequest, NoteController.getNote);

// POST /notes/project/:projectId - Create note
router.post('/project/:projectId', noteValidation.create, validateRequest, NoteController.createNote);

// PUT /notes/:id - Update note
router.put('/:id', noteValidation.update, validateRequest, NoteController.updateNote);

// DELETE /notes/:id - Delete note
router.delete('/:id', idParam, validateRequest, NoteController.deleteNote);

module.exports = router;
