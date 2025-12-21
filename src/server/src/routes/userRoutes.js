const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validateMiddleware');

// Validation rules
const passwordValidation = [
    body('current_password').notEmpty().withMessage('Vui lòng nhập mật khẩu hiện tại'),
    body('new_password').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự')
];

// User routes
router.put('/profile', authenticate, UserController.updateProfile);
router.put('/password', authenticate, passwordValidation, validateRequest, UserController.changePassword);
router.delete('/account', authenticate, UserController.deleteAccount);

// Admin routes
router.get('/', authenticate, isAdmin, UserController.getAllUsers);
router.post('/admin', authenticate, isAdmin, UserController.createAdmin);
router.patch('/:id/status', authenticate, isAdmin, UserController.toggleUserStatus);
router.delete('/:id', authenticate, isAdmin, UserController.deleteUser);

module.exports = router;
