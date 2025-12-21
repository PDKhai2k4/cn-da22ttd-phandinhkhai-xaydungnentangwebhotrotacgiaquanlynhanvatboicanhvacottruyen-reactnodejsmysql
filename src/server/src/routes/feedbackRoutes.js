const express = require('express');
const router = express.Router();
const FeedbackController = require('../controllers/FeedbackController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const { validateRequest, feedbackValidation, idParam, paginationQuery } = require('../middlewares/validateMiddleware');

// User routes
router.post('/', authenticate, feedbackValidation.create, validateRequest, FeedbackController.createFeedback);
router.get('/my', authenticate, paginationQuery, validateRequest, FeedbackController.getMyFeedbacks);
router.get('/:id', authenticate, idParam, validateRequest, FeedbackController.getFeedback);

// Admin routes
router.get('/', authenticate, isAdmin, paginationQuery, validateRequest, FeedbackController.getAllFeedbacks);
router.get('/stats/overview', authenticate, isAdmin, FeedbackController.getStats);
router.post('/:id/respond', authenticate, isAdmin, feedbackValidation.respond, validateRequest, FeedbackController.respondFeedback);
router.patch('/:id/status', authenticate, isAdmin, idParam, validateRequest, FeedbackController.updateStatus);

module.exports = router;
