/**
 * Script để reset mật khẩu admin
 * Chạy: node scripts/reset-admin-password.js
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const NEW_PASSWORD = 'admin123'; // Mật khẩu mới - thay đổi sau khi đăng nhập!

async function resetAdminPassword() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ql_truyen'
    });

    try {
        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
        
        // Tìm admin
        const [admins] = await connection.query(
            "SELECT id, username, email FROM users WHERE role = 'admin'"
        );
        
        if (admins.length === 0) {
            console.log('❌ Không tìm thấy tài khoản admin nào!');
            return;
        }
        
        console.log('\n📋 Danh sách admin:');
        admins.forEach((admin, i) => {
            console.log(`   ${i + 1}. ${admin.username} (${admin.email})`);
        });
        
        // Reset mật khẩu cho tất cả admin
        const [result] = await connection.query(
            "UPDATE users SET password = ? WHERE role = 'admin'",
            [hashedPassword]
        );
        
        console.log(`\n✅ Đã reset mật khẩu cho ${result.affectedRows} tài khoản admin`);
        console.log(`🔑 Mật khẩu mới: ${NEW_PASSWORD}`);
        console.log('\n⚠️  Hãy đổi mật khẩu ngay sau khi đăng nhập!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await connection.end();
    }
}

resetAdminPassword();
