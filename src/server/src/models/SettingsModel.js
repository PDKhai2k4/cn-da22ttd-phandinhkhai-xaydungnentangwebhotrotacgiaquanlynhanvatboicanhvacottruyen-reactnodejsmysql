const pool = require('../config/db');
const { sanitizeFields, buildUpdateQuery } = require('../utils/sanitize');

class SettingsModel {
    // ==================== USER SETTINGS ====================
    
    static async getUserSettings(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM user_settings WHERE user_id = ?',
            [userId]
        );
        return rows[0];
    }

    static async createUserSettings(userId, settings = {}) {
        const { theme = 'system', language = 'vi', notifications_enabled = true } = settings;
        const [result] = await pool.query(
            'INSERT INTO user_settings (user_id, theme, language, notifications_enabled) VALUES (?, ?, ?, ?)',
            [userId, theme, language, notifications_enabled]
        );
        return result.insertId;
    }

    static async updateUserSettings(userId, settings) {
        const { theme, language, notifications_enabled } = settings;
        
        await pool.query(
            `INSERT INTO user_settings (user_id, theme, language, notifications_enabled) 
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                theme = VALUES(theme), 
                language = VALUES(language), 
                notifications_enabled = VALUES(notifications_enabled)`,
            [userId, theme || 'system', language || 'vi', notifications_enabled !== false]
        );
        
        return await SettingsModel.getUserSettings(userId);
    }

    // ==================== SYSTEM SETTINGS ====================
    
    static async getAllSystemSettings() {
        const [rows] = await pool.query('SELECT * FROM system_settings ORDER BY id');
        return rows;
    }

    static async getSystemSettingsAsObject() {
        const rows = await SettingsModel.getAllSystemSettings();
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        return settings;
    }

    static async getSystemSetting(key) {
        const [rows] = await pool.query(
            'SELECT setting_value FROM system_settings WHERE setting_key = ?',
            [key]
        );
        return rows[0]?.setting_value;
    }

    static async updateSystemSetting(key, value, updatedBy) {
        const [result] = await pool.query(
            'UPDATE system_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?',
            [value, updatedBy, key]
        );
        return result.affectedRows > 0;
    }

    // Update multiple settings with transaction
    static async updateMultipleSystemSettings(settings, updatedBy) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            for (const [key, value] of Object.entries(settings)) {
                await connection.query(
                    'UPDATE system_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?',
                    [value, updatedBy, key]
                );
            }
            
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async createSystemSetting(key, value, description, updatedBy) {
        const [result] = await pool.query(
            'INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES (?, ?, ?, ?)',
            [key, value, description, updatedBy]
        );
        return result.insertId;
    }
}

module.exports = SettingsModel;
