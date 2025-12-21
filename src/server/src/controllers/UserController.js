const UserModel = require('../models/UserModel');
const { hashPassword, comparePassword } = require('../utils/helpers');

class UserController {
    // Cập nhật thông tin cá nhân
    static async updateProfile(req, res) {
        try {
            const { full_name, avatar } = req.body;
            const userId = req.user.id;
            
            await UserModel.update(userId, { full_name, avatar });
            const user = await UserModel.findById(userId);
            
            res.json({ message: 'Cập nhật thành công', user });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Đổi mật khẩu
    static async changePassword(req, res) {
        try {
            const { current_password, new_password } = req.body;
            const userId = req.user.id;
            
            // Lấy user với password
            const user = await UserModel.findByEmail(req.user.email);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
            
            // Kiểm tra mật khẩu hiện tại
            const isMatch = await comparePassword(current_password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
            }
            
            // Hash và cập nhật mật khẩu mới
            const hashedPassword = await hashPassword(new_password);
            await UserModel.update(userId, { password: hashedPassword });
            
            res.json({ message: 'Đổi mật khẩu thành công' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Xóa tài khoản
    static async deleteAccount(req, res) {
        try {
            const userId = req.user.id;
            await UserModel.delete(userId);
            res.json({ message: 'Xóa tài khoản thành công' });
        } catch (error) {
            console.error('Delete account error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // [ADMIN] Lấy danh sách users
    static async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 20, search = '' } = req.query;
            const result = await UserModel.getAll(parseInt(page), parseInt(limit), search);
            res.json(result);
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // [ADMIN] Khóa/Mở khóa tài khoản
    static async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { is_active } = req.body;
            
            if (parseInt(id) === req.user.id) {
                return res.status(400).json({ message: 'Không thể khóa tài khoản của chính mình' });
            }
            
            // Kiểm tra user có phải admin không
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Không thể thay đổi trạng thái admin' });
            }
            
            await UserModel.toggleActive(id, is_active);
            res.json({ message: is_active ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công' });
        } catch (error) {
            console.error('Toggle user status error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // [ADMIN] Xóa user
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            
            if (parseInt(id) === req.user.id) {
                return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
            }
            
            // Kiểm tra user có phải admin không
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Không thể xóa admin' });
            }
            
            await UserModel.delete(id);
            res.json({ message: 'Xóa người dùng thành công' });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // [ADMIN] Tạo admin mới
    static async createAdmin(req, res) {
        try {
            const { username, email, password, full_name } = req.body;
            
            const existingEmail = await UserModel.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }
            
            const existingUsername = await UserModel.findByUsername(username);
            if (existingUsername) {
                return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
            }
            
            const hashedPassword = await hashPassword(password);
            const userId = await UserModel.create({
                username,
                email,
                password: hashedPassword,
                full_name
            });
            
            await UserModel.update(userId, { role: 'admin' });
            const user = await UserModel.findById(userId);
            
            res.status(201).json({ message: 'Tạo admin thành công', user });
        } catch (error) {
            console.error('Create admin error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = UserController;
