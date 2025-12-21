const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const routes = require('./routes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const pool = require('./config/db');
const OTPModel = require('./models/OTPModel');
const { apiLimiter, stopCleanup: stopRateLimitCleanup } = require('./middlewares/rateLimitMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Start background jobs
OTPModel.startCleanupJob();
pool.startHealthCheck();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Cho phép load ảnh từ domain khác
    contentSecurityPolicy: false // Disable CSP cho development
}));

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health check với database connection check
app.get('/health', async (req, res) => {
    try {
        const isDbHealthy = await pool.healthCheck();
        if (isDbHealthy) {
            res.json({ 
                status: 'OK', 
                database: 'connected',
                timestamp: new Date().toISOString() 
            });
        } else {
            res.status(503).json({ 
                status: 'ERROR', 
                database: 'disconnected',
                timestamp: new Date().toISOString() 
            });
        }
    } catch (error) {
        res.status(503).json({ 
            status: 'ERROR', 
            database: 'disconnected',
            timestamp: new Date().toISOString() 
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'API endpoint không tồn tại' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: err.errors });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Không có quyền truy cập' });
    }
    
    // Default error response
    res.status(500).json({ message: 'Lỗi server nội bộ' });
});

const server = app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(async () => {
        console.log('HTTP server closed');
        
        // Stop background jobs
        OTPModel.stopCleanupJob();
        stopRateLimitCleanup();
        
        // Close database pool
        await pool.shutdown();
        
        console.log('Graceful shutdown completed');
        process.exit(0);
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
