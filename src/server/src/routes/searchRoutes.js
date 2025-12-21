const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/SearchController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Tìm kiếm trong dự án
router.get('/project/:projectId', SearchController.searchInProject);

// Tìm kiếm tất cả dự án của user
router.get('/projects', SearchController.searchProjects);

module.exports = router;
