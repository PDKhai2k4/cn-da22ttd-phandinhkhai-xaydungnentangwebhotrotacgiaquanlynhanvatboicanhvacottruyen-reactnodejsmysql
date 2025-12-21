const nodemailer = require('nodemailer');
require('dotenv').config();

// Get OTP expiry from environment
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

// Kiểm tra xem có cấu hình email thật không
const isEmailConfigured = process.env.SMTP_USER && 
    process.env.SMTP_PASS && 
    process.env.SMTP_USER !== 'your_email@gmail.com';

let transporter = null;

if (isEmailConfigured) {
    // Loại bỏ khoảng trắng trong App Password (Gmail App Password có dạng "xxxx xxxx xxxx xxxx")
    const smtpPass = process.env.SMTP_PASS.replace(/\s/g, '');
    
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: smtpPass
        }
    });
    
    // Verify connection
    transporter.verify((error) => {
        if (error) {
            console.error('❌ Email transporter error:', error.message);
        } else {
            console.log('✅ Email server is ready to send messages');
        }
    });
} else {
    console.log('⚠️ Email not configured - OTP will be logged to console');
}

const sendEmail = async (to, subject, html) => {
    // Development mode - log email instead of sending
    if (!isEmailConfigured) {
        console.log('\n========== EMAIL (Development Mode) ==========');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('Content:', html.replace(/<[^>]*>/g, '').trim());
        console.log('==============================================\n');
        return true; // Giả lập gửi thành công
    }
    
    try {
        await transporter.sendMail({
            from: `"QL Truyện" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};

const sendOTP = async (email, otp, type) => {
    const subjects = {
        register: 'Xác nhận đăng ký tài khoản',
        reset_password: 'Đặt lại mật khẩu',
        verify_email: 'Xác nhận email'
    };
    
    // Log OTP trong development mode
    if (!isEmailConfigured) {
        console.log('\n🔐 ========== OTP CODE ==========');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 OTP: ${otp}`);
        console.log(`📝 Type: ${type}`);
        console.log('================================\n');
    }
    
    // Use dynamic expiry time from environment
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">QL Truyện</h2>
            <p>Mã OTP của bạn là:</p>
            <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p>Mã này sẽ hết hạn sau ${OTP_EXPIRY_MINUTES} phút.</p>
            <p style="color: #666; font-size: 12px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        </div>
    `;
    
    return sendEmail(email, subjects[type] || 'Mã OTP', html);
};

// Export thêm flag để biết email có được cấu hình không
module.exports = { sendEmail, sendOTP, isEmailConfigured };
