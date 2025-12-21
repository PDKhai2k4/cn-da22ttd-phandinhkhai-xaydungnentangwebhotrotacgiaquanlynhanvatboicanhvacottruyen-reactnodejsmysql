const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, '../../uploads');
const subDirs = ['avatars', 'projects', 'characters', 'locations', 'items', 'general'];

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
subDirs.forEach(dir => {
    const subPath = path.join(uploadDir, dir);
    if (!fs.existsSync(subPath)) {
        fs.mkdirSync(subPath, { recursive: true });
    }
});

// Magic bytes signatures cho các loại ảnh
const imageMagicBytes = {
    'ffd8ff': 'image/jpeg',      // JPEG
    '89504e47': 'image/png',     // PNG
    '47494638': 'image/gif',     // GIF
    '52494646': 'image/webp',    // WebP (RIFF header)
};

// Kiểm tra magic bytes của file
const checkMagicBytes = (buffer) => {
    const hex = buffer.toString('hex', 0, 4);
    
    for (const [magic, type] of Object.entries(imageMagicBytes)) {
        if (hex.startsWith(magic)) {
            return type;
        }
    }
    
    // Check WebP specifically (RIFF....WEBP)
    if (hex.startsWith('52494646') && buffer.toString('ascii', 8, 12) === 'WEBP') {
        return 'image/webp';
    }
    
    return null;
};

// Cấu hình storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.params.type || 'general';
        // Sanitize type để tránh path traversal
        const safeType = type.replace(/[^a-zA-Z0-9]/g, '');
        const destPath = path.join(uploadDir, safeType);
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }
        cb(null, destPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sanitize extension
        const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const safeExt = allowedExts.includes(ext) ? ext : '.jpg';
        cb(null, `${uniqueSuffix}${safeExt}`);
    }
});

// Filter chỉ cho phép ảnh (kiểm tra MIME type)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh (jpg, png, gif, webp)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Middleware để validate magic bytes sau khi upload
const validateImageFile = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    
    try {
        const buffer = fs.readFileSync(req.file.path);
        const detectedType = checkMagicBytes(buffer);
        
        if (!detectedType) {
            // Xóa file không hợp lệ
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                message: 'File không phải là ảnh hợp lệ' 
            });
        }
        
        next();
    } catch (error) {
        console.error('Validate image error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Lỗi khi xử lý file' });
    }
};

module.exports = upload;
module.exports.validateImageFile = validateImageFile;
module.exports.checkMagicBytes = checkMagicBytes;
