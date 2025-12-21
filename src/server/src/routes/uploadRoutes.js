const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middlewares/uploadMiddleware');
const { validateImageFile } = require('../middlewares/uploadMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');
const { uploadLimiter } = require('../middlewares/rateLimitMiddleware');

// Allowed upload types
const ALLOWED_TYPES = ['avatars', 'projects', 'characters', 'locations', 'items', 'general'];

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
    if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File không được vượt quá 5MB' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: 'Chỉ được upload 1 file' });
        }
        if (err.message) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(400).json({ message: 'Lỗi khi upload file' });
    }
    next();
};

// Upload ảnh với magic bytes validation và rate limiting
router.post('/:type', authenticate, uploadLimiter, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        handleMulterError(err, req, res, next);
    });
}, validateImageFile, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không có file được upload' });
        }

        const type = req.params.type;
        
        // Validate type
        if (!ALLOWED_TYPES.includes(type)) {
            // Xóa file đã upload
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: 'Loại upload không hợp lệ' });
        }

        const imageUrl = `/uploads/${type}/${req.file.filename}`;

        res.json({
            message: 'Upload thành công',
            imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        // Cleanup file nếu có lỗi
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Lỗi khi upload file' });
    }
});

// Xóa ảnh
router.delete('/:type/:filename', authenticate, async (req, res) => {
    try {
        const { type, filename } = req.params;
        
        // Validate type
        if (!ALLOWED_TYPES.includes(type)) {
            return res.status(400).json({ message: 'Loại upload không hợp lệ' });
        }
        
        // Sanitize filename để tránh path traversal
        const safeFilename = path.basename(filename);
        const filePath = path.join(__dirname, '../../uploads', type, safeFilename);
        
        // Kiểm tra file nằm trong thư mục uploads
        const uploadsDir = path.resolve(__dirname, '../../uploads');
        const resolvedPath = path.resolve(filePath);
        
        if (!resolvedPath.startsWith(uploadsDir)) {
            return res.status(400).json({ message: 'Đường dẫn không hợp lệ' });
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: 'Xóa file thành công' });
        } else {
            res.status(404).json({ message: 'File không tồn tại' });
        }
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ message: 'Lỗi khi xóa file' });
    }
});

module.exports = router;
