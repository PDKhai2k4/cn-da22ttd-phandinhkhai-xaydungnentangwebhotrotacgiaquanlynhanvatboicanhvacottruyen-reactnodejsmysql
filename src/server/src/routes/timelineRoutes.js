const express = require('express');
const router = express.Router();
const TimelineController = require('../controllers/TimelineController');
const { authenticate } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validateRequest, timelineValidation, idParam, projectIdParam, paginationQuery } = require('../middlewares/validateMiddleware');

router.use(authenticate);

// GET /timeline/project/:projectId - List timeline events
router.get('/project/:projectId', projectIdParam, paginationQuery, validateRequest, TimelineController.getTimeline);

// GET /timeline/:id - Get single event
router.get('/:id', idParam, validateRequest, TimelineController.getEvent);

// POST /timeline/project/:projectId - Create event
router.post('/project/:projectId', timelineValidation.create, validateRequest, TimelineController.createEvent);

// PUT /timeline/:id - Update event
router.put('/:id', timelineValidation.update, validateRequest, TimelineController.updateEvent);

// DELETE /timeline/:id - Delete event
router.delete('/:id', idParam, validateRequest, TimelineController.deleteEvent);

// POST /timeline/project/:projectId/reorder - Reorder events
router.post('/project/:projectId/reorder', 
    projectIdParam,
    body('orderedIds').isArray().withMessage('orderedIds phải là mảng'),
    body('orderedIds.*').isInt({ min: 1 }).withMessage('ID không hợp lệ'),
    validateRequest, 
    TimelineController.reorderEvents
);

module.exports = router;
