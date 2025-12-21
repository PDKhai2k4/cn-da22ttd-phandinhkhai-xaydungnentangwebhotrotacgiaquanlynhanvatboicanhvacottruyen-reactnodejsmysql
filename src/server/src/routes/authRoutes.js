const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validateMiddleware');
const { authLimiter, forgotPasswordLimiter, registerLimiter } = require('../middlewares/rateLimitMiddleware');

// Validation rules
const registerValidation = [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Tên đăng nhập từ 3-50 ký tự'),
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu')
];

// Reset password validation
const resetPasswordValidation = [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Mã OTP phải có 6 ký tự'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự')
];

// Change password validation
const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu hiện tại'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự')
];

// Public routes with rate limiting
router.post('/register', registerLimiter, registerValidation, validateRequest, AuthController.register);
router.post('/login', authLimiter, loginValidation, validateRequest, AuthController.login);
router.post('/forgot-password', forgotPasswordLimiter, body('email').isEmail().normalizeEmail(), validateRequest, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, validateRequest, AuthController.resetPassword);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/change-password', authenticate, changePasswordValidation, validateRequest, AuthController.changePassword);

module.exports = router;
