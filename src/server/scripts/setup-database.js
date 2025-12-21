/**
 * Script tự động setup database
 * Chạy: node scripts/setup-database.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

const log = {
    info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    title: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`)
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    log.title('🚀 QL_TRUYEN - DATABASE SETUP');
    
    console.log('Script này sẽ tự động tạo database và các bảng cần thiết.\n');
    
    // Get database credentials
    let host = process.env.DB_HOST || 'localhost';
    let port = process.env.DB_PORT || '3306';
    let user = process.env.DB_USER || 'root';
    let password = process.env.DB_PASSWORD || '';
    
    // Ask for credentials if not in env
    if (!process.env.DB_HOST) {
        console.log('Nhập thông tin kết nối MySQL (Enter để dùng mặc định):\n');
        
        const inputHost = await question(`Host [${host}]: `);
        if (inputHost) host = inputHost;
        
        const inputPort = await question(`Port [${port}]: `);
        if (inputPort) port = inputPort;
        
        const inputUser = await question(`User [${user}]: `);
        if (inputUser) user = inputUser;
        
        password = await question('Password: ');
    }

    let connection;
    
    try {
        log.info('Đang kết nối MySQL...');
        
        // Connect without database first
        connection = await mysql.createConnection({
            host,
            port: parseInt(port),
            user,
            password,
            multipleStatements: true
        });
        
        log.success('Kết nối MySQL thành công!');
        
        // Read SQL file
        const sqlPath = path.join(__dirname, '../../database/init.sql');
        
        if (!fs.existsSync(sqlPath)) {
            log.error('Không tìm thấy file database/init.sql');
            process.exit(1);
        }
        
        log.info('Đang đọc file SQL...');
        let sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Remove comments and empty lines for cleaner execution
        sql = sql
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n');
        
        log.info('Đang tạo database và các bảng...');
        
        // Execute SQL
        await connection.query(sql);
        
        log.success('Tạo database thành công!');
        
        // Verify tables
        const [tables] = await connection.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'ql_truyen'
        `);
        
        log.info(`Đã tạo ${tables.length} bảng:`);
        tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
        
        // Show default admin info
        console.log('');
        log.title('🔐 TÀI KHOẢN ADMIN MẶC ĐỊNH');
        console.log('   📧 Email: admin@qltruyen.com');
        console.log('   🔑 Mật khẩu: Admin@123');
        console.log('');
        log.warn('Hãy đổi mật khẩu ngay sau khi đăng nhập lần đầu!');
        
        // Update .env file
        console.log('');
        const updateEnv = await question('Cập nhật file .env với thông tin database? (y/n): ');
        
        if (updateEnv.toLowerCase() === 'y') {
            const envPath = path.join(__dirname, '../.env');
            let envContent = '';
            
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf8');
            }
            
            // Update or add DB settings
            const dbSettings = {
                DB_HOST: host,
                DB_PORT: port,
                DB_USER: user,
                DB_PASSWORD: password,
                DB_NAME: 'ql_truyen'
            };
            
            for (const [key, value] of Object.entries(dbSettings)) {
                const regex = new RegExp(`^${key}=.*`, 'm');
                if (regex.test(envContent)) {
                    envContent = envContent.replace(regex, `${key}=${value}`);
                } else {
                    envContent += `\n${key}=${value}`;
                }
            }
            
            // Add JWT_SECRET if not exists
            if (!envContent.includes('JWT_SECRET=')) {
                const crypto = require('crypto');
                const jwtSecret = crypto.randomBytes(32).toString('hex');
                envContent += `\nJWT_SECRET=${jwtSecret}`;
                log.info('Đã tạo JWT_SECRET ngẫu nhiên');
            }
            
            fs.writeFileSync(envPath, envContent.trim() + '\n');
            log.success('Đã cập nhật file .env');
        }
        
        log.title('✅ SETUP HOÀN TẤT!');
        console.log('Bạn có thể chạy server với lệnh: npm run dev');
        console.log('Sau đó đăng nhập với tài khoản admin mặc định.\n');
        
    } catch (error) {
        log.error('Lỗi: ' + error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            log.warn('Sai username hoặc password MySQL');
        } else if (error.code === 'ECONNREFUSED') {
            log.warn('Không thể kết nối MySQL. Hãy chắc chắn MySQL đang chạy.');
        }
        
        process.exit(1);
    } finally {
        if (connection) await connection.end();
        rl.close();
    }
}

main();
