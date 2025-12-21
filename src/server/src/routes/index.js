const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const characterRoutes = require('./characterRoutes');
const locationRoutes = require('./locationRoutes');
const timelineRoutes = require('./timelineRoutes');
const itemRoutes = require('./itemRoutes');
const chapterRoutes = require('./chapterRoutes');
const noteRoutes = require('./noteRoutes');
const relationshipRoutes = require('./relationshipRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const settingsRoutes = require('./settingsRoutes');
const searchRoutes = require('./searchRoutes');
// Note: adminRoutes được mount riêng trong index.js để tránh duplicate

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/characters', characterRoutes);
router.use('/locations', locationRoutes);
router.use('/timeline', timelineRoutes);
router.use('/items', itemRoutes);
router.use('/chapters', chapterRoutes);
router.use('/notes', noteRoutes);
router.use('/relationships', relationshipRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/settings', settingsRoutes);
router.use('/search', searchRoutes);

module.exports = router;
