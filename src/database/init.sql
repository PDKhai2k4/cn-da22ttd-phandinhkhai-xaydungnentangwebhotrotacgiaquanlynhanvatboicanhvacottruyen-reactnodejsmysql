-- =====================================================
-- QL_TRUYEN DATABASE - COMPLETE SETUP SCRIPT
-- Chạy file này một lần duy nhất để tạo toàn bộ database
-- =====================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS ql_truyen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ql_truyen;

-- =====================================================
-- TABLES
-- =====================================================

-- Bảng users (người dùng)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng otp_codes (mã OTP)
CREATE TABLE IF NOT EXISTS otp_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    type ENUM('register', 'reset_password', 'verify_email') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng user_settings (cài đặt người dùng)
CREATE TABLE IF NOT EXISTS user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    theme ENUM('light', 'dark', 'system') DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'vi',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Bảng system_settings (cài đặt hệ thống - admin)
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng projects (dự án truyện)
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    status ENUM('planning', 'writing', 'completed', 'paused') DEFAULT 'planning',
    cover_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng characters (nhân vật)
CREATE TABLE IF NOT EXISTS characters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    appearance TEXT,
    personality TEXT,
    background TEXT,
    skills TEXT,
    avatar VARCHAR(255),
    age INT,
    gender ENUM('male', 'female', 'other'),
    role ENUM('protagonist', 'antagonist', 'supporting', 'minor') DEFAULT 'supporting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Bảng character_relationships (mối quan hệ nhân vật)
CREATE TABLE IF NOT EXISTS character_relationships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    character1_id INT NOT NULL,
    character2_id INT NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (character1_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (character2_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- Bảng locations (địa điểm/bối cảnh)
CREATE TABLE IF NOT EXISTS locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    parent_id INT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    history TEXT,
    image VARCHAR(255),
    location_type ENUM('world', 'continent', 'country', 'city', 'building', 'room', 'other') DEFAULT 'city',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- Bảng timeline_events (sự kiện dòng thời gian)
CREATE TABLE IF NOT EXISTS timeline_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date VARCHAR(100),
    event_order INT DEFAULT 0,
    location_id INT,
    importance ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    event_type ENUM('plot', 'character', 'world', 'other') DEFAULT 'plot',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- Bảng items (vật phẩm/khái niệm)
CREATE TABLE IF NOT EXISTS items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    properties TEXT,
    image VARCHAR(255),
    item_type ENUM('weapon', 'tool', 'magic', 'technology', 'concept', 'other') DEFAULT 'other',
    rarity ENUM('common', 'uncommon', 'rare', 'legendary') DEFAULT 'common',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Bảng chapters (chương truyện)
CREATE TABLE IF NOT EXISTS chapters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT,
    chapter_number INT NOT NULL,
    word_count INT DEFAULT 0,
    status ENUM('draft', 'writing', 'completed', 'published') DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Bảng notes (ghi chú)
CREATE TABLE IF NOT EXISTS notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    note_type ENUM('idea', 'outline', 'research', 'todo', 'other') DEFAULT 'idea',
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Bảng feedbacks (phản hồi/báo cáo)
CREATE TABLE IF NOT EXISTS feedbacks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    feedback_type ENUM('bug', 'feature', 'question', 'other') DEFAULT 'other',
    status ENUM('pending', 'reviewed', 'resolved', 'closed') DEFAULT 'pending',
    admin_response TEXT,
    responded_by INT,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL
);


-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_characters_project_id ON characters(project_id);
CREATE INDEX idx_relationships_char1 ON character_relationships(character1_id);
CREATE INDEX idx_relationships_char2 ON character_relationships(character2_id);
CREATE INDEX idx_locations_project_id ON locations(project_id);
CREATE INDEX idx_locations_parent_id ON locations(parent_id);
CREATE INDEX idx_timeline_project_id ON timeline_events(project_id);
CREATE INDEX idx_items_project_id ON items(project_id);
CREATE INDEX idx_chapters_project_id ON chapters(project_id);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_otp_email ON otp_codes(email);
CREATE INDEX idx_chapters_number ON chapters(project_id, chapter_number);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_timeline_order ON timeline_events(project_id, event_order);
CREATE INDEX idx_otp_expires ON otp_codes(expires_at);
CREATE INDEX idx_characters_search ON characters(project_id, name);
CREATE INDEX idx_locations_search ON locations(project_id, name);
CREATE INDEX idx_items_search ON items(project_id, name);
CREATE INDEX idx_chapters_search ON chapters(project_id, title);
CREATE INDEX idx_notes_search ON notes(project_id, title);

-- FULLTEXT indexes for better search performance
ALTER TABLE characters ADD FULLTEXT INDEX ft_characters_search (name, description);
ALTER TABLE locations ADD FULLTEXT INDEX ft_locations_search (name, description);
ALTER TABLE items ADD FULLTEXT INDEX ft_items_search (name, description);
ALTER TABLE chapters ADD FULLTEXT INDEX ft_chapters_search (title, content);
ALTER TABLE notes ADD FULLTEXT INDEX ft_notes_search (title, content, tags);
ALTER TABLE projects ADD FULLTEXT INDEX ft_projects_search (title, description);

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Tạo tài khoản Admin mặc định
-- Username: admin
-- Email: admin@gmail.com  
-- Password: Admin@123 (đã hash bằng bcrypt với 12 rounds)
-- ⚠️ QUAN TRỌNG: Hãy đổi mật khẩu ngay sau khi đăng nhập lần đầu!
INSERT INTO users (username, email, password, full_name, role, is_active, email_verified) VALUES
('admin', 'admin@gmail.com', '$2a$12$aRVNaMl.XwFLtm1IGgk9XO77mVme1Rn.s18QN6NoVhhcI1Y0nRFQW', 'Administrator', 'admin', TRUE, TRUE);

-- Tạo settings mặc định cho admin
INSERT INTO user_settings (user_id, theme, language, notifications_enabled) VALUES
(1, 'system', 'vi', TRUE);

-- Cài đặt hệ thống mặc định
INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES
('site_name', 'QL Truyện', 'Tên website', 1),
('contact_email', 'admin@gmail.com', 'Email liên hệ', 1),
('max_projects_per_user', '50', 'Số dự án tối đa mỗi người dùng', 1),
('allow_registration', 'true', 'Cho phép đăng ký tài khoản mới', 1);

-- =====================================================
-- THÔNG TIN ĐĂNG NHẬP ADMIN MẶC ĐỊNH
-- =====================================================
-- 📧 Email: admin@gmail.com
-- 🔑 Mật khẩu: Admin@123
-- ⚠️ Hãy đổi mật khẩu ngay sau khi đăng nhập!
-- =====================================================

-- =====================================================
-- DONE!
-- =====================================================
