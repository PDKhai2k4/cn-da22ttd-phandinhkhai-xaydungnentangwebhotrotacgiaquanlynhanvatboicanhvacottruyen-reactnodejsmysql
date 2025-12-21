const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/SettingsController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// User settings - hỗ trợ cả /settings và /settings/user
router.get('/', authenticate, SettingsController.getUserSettings);
router.put('/', authenticate, SettingsController.updateUserSettings);
router.get('/user', authenticate, SettingsController.getUserSettings);
router.put('/user', authenticate, SettingsController.updateUserSettings);

// System settings (Admin only)
router.get('/system', authenticate, isAdmin, SettingsController.getSystemSettings);
router.put('/system', authenticate, isAdmin, SettingsController.updateSystemSettings);

module.exports = router;
