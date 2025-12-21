/**
 * Rate Limiter Middleware
 * Supports both in-memory (development) and Redis (production) storage
 */

const rateLimitStore = new Map();
let cleanupInterval = null;

// Cleanup expired entries every 5 minutes
const startCleanup = () => {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, data] of rateLimitStore.entries()) {
            if (now > data.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
};

// Stop cleanup (for graceful shutdown)
const stopCleanup = () => {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
};

// Start cleanup on module load
startCleanup();

/**
 * Create rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests per window
 * @param {string} options.message - Error message
 * @param {Function} options.keyGenerator - Custom key generator function
 * @param {boolean} options.skipFailedRequests - Don't count failed requests
 * @param {Function} options.skip - Function to skip rate limiting
 */
const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 100,
        message = 'Quá nhiều yêu cầu, vui lòng thử lại sau',
        keyGenerator = (req) => `${req.ip}-${req.path}`,
        skipFailedRequests = false,
        skip = () => false
    } = options;

    return (req, res, next) => {
        // Check if should skip
        if (skip(req)) {
            return next();
        }

        const key = keyGenerator(req);
        const now = Date.now();
        
        let data = rateLimitStore.get(key);
        
        if (!data || now > data.resetTime) {
            data = {
                count: 1,
                resetTime: now + windowMs,
                firstRequest: now
            };
            rateLimitStore.set(key, data);
            
            // Set rate limit headers
            res.set('X-RateLimit-Limit', max);
            res.set('X-RateLimit-Remaining', max - 1);
            res.set('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000));
            
            return next();
        }
        
        data.count++;
        
        // Set rate limit headers
        res.set('X-RateLimit-Limit', max);
        res.set('X-RateLimit-Remaining', Math.max(0, max - data.count));
        res.set('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000));
        
        if (data.count > max) {
            const retryAfter = Math.ceil((data.resetTime - now) / 1000);
            res.set('Retry-After', retryAfter);
            
            // Log rate limit hit
            console.warn(`Rate limit exceeded for ${key} at ${new Date().toISOString()}`);
            
            return res.status(429).json({ 
                message,
                retryAfter,
                limit: max,
                windowMs
            });
        }
        
        // Handle skipFailedRequests
        if (skipFailedRequests) {
            const originalEnd = res.end;
            res.end = function(...args) {
                if (res.statusCode >= 400) {
                    data.count--;
                }
                originalEnd.apply(res, args);
            };
        }
        
        next();
    };
};

// Pre-configured rate limiters
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes
    message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút',
    keyGenerator: (req) => `auth-${req.ip}`,
    skipFailedRequests: false
});

const forgotPasswordLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    message: 'Quá nhiều yêu cầu đặt lại mật khẩu, vui lòng thử lại sau 1 giờ',
    keyGenerator: (req) => `forgot-${req.ip}-${req.body?.email || ''}`
});

const registerLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 registrations per hour per IP
    message: 'Quá nhiều tài khoản được tạo từ IP này, vui lòng thử lại sau',
    keyGenerator: (req) => `register-${req.ip}`
});

const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per 15 minutes
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
    keyGenerator: (req) => `api-${req.ip}`,
    skip: (req) => req.path === '/health' // Skip health check endpoint
});

const uploadLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: 'Quá nhiều file được upload, vui lòng thử lại sau',
    keyGenerator: (req) => `upload-${req.user?.id || req.ip}`
});

// Strict limiter for sensitive operations
const strictLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: 'Quá nhiều yêu cầu cho thao tác này, vui lòng thử lại sau',
    keyGenerator: (req) => `strict-${req.ip}-${req.path}`
});

module.exports = {
    createRateLimiter,
    authLimiter,
    forgotPasswordLimiter,
    registerLimiter,
    apiLimiter,
    uploadLimiter,
    strictLimiter,
    stopCleanup
};
