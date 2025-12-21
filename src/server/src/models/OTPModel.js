const pool = require('../config/db');

// OTP expiry time in minutes (configurable)
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

let cleanupInterval = null;

class OTPModel {
    static async create(email, code, type, userId = null) {
        // Xóa OTP cũ cùng loại
        await pool.query(
            'DELETE FROM otp_codes WHERE email = ? AND type = ?',
            [email, type]
        );
        
        // Tạo OTP mới
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        const [result] = await pool.query(
            'INSERT INTO otp_codes (user_id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)',
            [userId, email, code, type, expiresAt]
        );
        return result.insertId;
    }

    static async verify(email, code, type) {
        const [rows] = await pool.query(
            'SELECT * FROM otp_codes WHERE email = ? AND code = ? AND type = ? AND is_used = FALSE AND expires_at > NOW()',
            [email, code, type]
        );
        
        if (rows.length === 0) return null;
        
        // Đánh dấu đã sử dụng
        await pool.query('UPDATE otp_codes SET is_used = TRUE WHERE id = ?', [rows[0].id]);
        return rows[0];
    }

    static async deleteExpired() {
        const [result] = await pool.query('DELETE FROM otp_codes WHERE expires_at < NOW() OR is_used = TRUE');
        return result.affectedRows;
    }
    
    // Khởi động cleanup job
    static startCleanupJob() {
        if (cleanupInterval) return; // Prevent multiple intervals
        
        // Cleanup mỗi 30 phút
        cleanupInterval = setInterval(async () => {
            try {
                const deleted = await OTPModel.deleteExpired();
                if (deleted > 0) {
                    console.log(`OTP Cleanup: Deleted ${deleted} expired OTP codes`);
                }
            } catch (error) {
                console.error('OTP Cleanup error:', error);
            }
        }, 30 * 60 * 1000);
        
        // Cleanup ngay khi khởi động
        OTPModel.deleteExpired().catch(console.error);
    }
    
    // Stop cleanup job (for graceful shutdown)
    static stopCleanupJob() {
        if (cleanupInterval) {
            clearInterval(cleanupInterval);
            cleanupInterval = null;
        }
    }
    
    // Get OTP expiry time for email template
    static getExpiryMinutes() {
        return OTP_EXPIRY_MINUTES;
    }
}

module.exports = OTPModel;
