const mysql = require('mysql2/promise');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    console.error(`FATAL ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ql_truyen',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Health check function
pool.healthCheck = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return true;
    } catch (error) {
        console.error('Database health check failed:', error.message);
        return false;
    }
};

// Periodic health check (every 5 minutes)
let healthCheckInterval = null;

pool.startHealthCheck = () => {
    if (healthCheckInterval) return;
    healthCheckInterval = setInterval(async () => {
        const isHealthy = await pool.healthCheck();
        if (!isHealthy) {
            console.error('Database connection unhealthy at', new Date().toISOString());
        }
    }, 5 * 60 * 1000);
};

pool.stopHealthCheck = () => {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
    }
};

// Graceful shutdown
pool.shutdown = async () => {
    pool.stopHealthCheck();
    await pool.end();
    console.log('Database pool closed');
};

module.exports = pool;
