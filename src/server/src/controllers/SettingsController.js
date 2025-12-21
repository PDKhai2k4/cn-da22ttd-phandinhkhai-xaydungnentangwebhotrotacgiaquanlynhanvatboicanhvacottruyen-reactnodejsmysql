const SettingsModel = require('../models/SettingsModel');

class SettingsController {
    // Lấy cài đặt người dùng
    static async getUserSettings(req, res) {
        try {
            let settings = await SettingsModel.getUserSettings(req.user.id);
            
            if (!settings) {
                // Tạo settings mặc định
                await SettingsModel.createUserSettings(req.user.id);
                settings = await SettingsModel.getUserSettings(req.user.id);
            }
            
            res.json({ settings });
        } catch (error) {
            console.error('Get user settings error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Cập nhật cài đặt người dùng
    static async updateUserSettings(req, res) {
        try {
            const { theme, language, notifications_enabled } = req.body;
            
            const settings = await SettingsModel.updateUserSettings(req.user.id, {
                theme,
                language,
                notifications_enabled
            });
            
            res.json({ message: 'Cập nhật thành công', settings });
        } catch (error) {
            console.error('Update user settings error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Lấy cài đặt hệ thống (Admin)
    static async getSystemSettings(req, res) {
        try {
            const settings = await SettingsModel.getSystemSettingsAsObject();
            res.json({ settings });
        } catch (error) {
            console.error('Get system settings error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Cập nhật cài đặt hệ thống (Admin)
    static async updateSystemSettings(req, res) {
        try {
            const updates = req.body;
            
            await SettingsModel.updateMultipleSystemSettings(updates, req.user.id);
            
            res.json({ message: 'Cập nhật thành công' });
        } catch (error) {
            console.error('Update system settings error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = SettingsController;
