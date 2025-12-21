const UserModel = require('../models/UserModel');
const OTPModel = require('../models/OTPModel');
const { generateToken, hashPassword, comparePassword, generateOTP } = require('../utils/helpers');
const { sendOTP, isEmailConfigured } = require('../config/email');

const isDevelopment = process.env.NODE_ENV !== 'production';

class AuthController {
    // Đăng ký
    static async register(req, res) {
        try {
            const { username, email, password, full_name } = req.body;
            
            // Kiểm tra email/username đã tồn tại
            const existingEmail = await UserModel.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }
            
            const existingUsername = await UserModel.findByUsername(username);
            if (existingUsername) {
                return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
            }
            
            // Hash password và tạo user
            const hashedPassword = await hashPassword(password);
            const userId = await UserModel.create({
                username,
                email,
                password: hashedPassword,
                full_name
            });
            
            const user = await UserModel.findById(userId);
            const token = generateToken({ id: user.id, role: user.role });
            
            res.status(201).json({
                message: 'Đăng ký thành công',
                user,
                token
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Đăng nhập
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
            }
            
            if (!user.is_active) {
                return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
            }
            
            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
            }
            
            const token = generateToken({ id: user.id, role: user.role });
            const { password: _, ...userWithoutPassword } = user;
            
            res.json({
                message: 'Đăng nhập thành công',
                user: userWithoutPassword,
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Gửi OTP quên mật khẩu
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
            }
            
            const otp = generateOTP();
            await OTPModel.create(email, otp, 'reset_password', user.id);
            
            const sent = await sendOTP(email, otp, 'reset_password');
            if (!sent) {
                return res.status(500).json({ message: 'Không thể gửi email OTP' });
            }
            
            // Trong development mode và email chưa cấu hình, trả về OTP trong response
            const response = { message: 'Mã OTP đã được gửi đến email của bạn' };
            if (isDevelopment && !isEmailConfigured) {
                response.devOtp = otp;
                response.devNote = 'OTP được hiển thị vì đang ở chế độ development và email chưa được cấu hình';
            }
            
            res.json(response);
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Xác nhận OTP và đặt lại mật khẩu
    static async resetPassword(req, res) {
        try {
            const { email, otp, newPassword } = req.body;
            
            const otpRecord = await OTPModel.verify(email, otp, 'reset_password');
            if (!otpRecord) {
                return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
            }
            
            const hashedPassword = await hashPassword(newPassword);
            await UserModel.update(otpRecord.user_id, { password: hashedPassword });
            
            res.json({ message: 'Đặt lại mật khẩu thành công' });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Đổi mật khẩu (đã đăng nhập)
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;
            
            const user = await UserModel.findByEmail(req.user.email);
            const isMatch = await comparePassword(currentPassword, user.password);
            
            if (!isMatch) {
                return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
            }
            
            const hashedPassword = await hashPassword(newPassword);
            await UserModel.update(userId, { password: hashedPassword });
            
            res.json({ message: 'Đổi mật khẩu thành công' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Lấy thông tin user hiện tại
    static async getProfile(req, res) {
        try {
            const user = await UserModel.findById(req.user.id);
            res.json({ user });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = AuthController;
