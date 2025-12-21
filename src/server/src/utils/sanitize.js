/**
 * Utility functions for sanitizing and validating data
 * Prevents SQL injection through field names
 */

// Allowed field names for each model
const ALLOWED_FIELDS = {
    users: ['username', 'email', 'password', 'full_name', 'avatar', 'role', 'is_active', 'email_verified'],
    projects: ['title', 'description', 'genre', 'status', 'cover_image'],
    characters: ['name', 'description', 'appearance', 'personality', 'background', 'skills', 'avatar', 'age', 'gender', 'role'],
    locations: ['name', 'description', 'history', 'image', 'location_type', 'parent_id'],
    timeline_events: ['title', 'description', 'event_date', 'event_order', 'location_id', 'importance', 'event_type'],
    items: ['name', 'description', 'properties', 'image', 'item_type', 'rarity'],
    chapters: ['title', 'content', 'chapter_number', 'word_count', 'status', 'notes'],
    notes: ['title', 'content', 'note_type', 'tags'],
    feedbacks: ['subject', 'content', 'feedback_type', 'status', 'admin_response', 'responded_by', 'responded_at'],
    character_relationships: ['character1_id', 'character2_id', 'relationship_type', 'description'],
    user_settings: ['theme', 'language', 'notifications_enabled'],
    system_settings: ['setting_key', 'setting_value', 'description', 'updated_by']
};

/**
 * Sanitize field names to prevent SQL injection
 * @param {string} tableName - Name of the table
 * @param {Object} data - Data object with field names as keys
 * @returns {Object} - Sanitized data with only allowed fields
 */
const sanitizeFields = (tableName, data) => {
    const allowedFields = ALLOWED_FIELDS[tableName];
    if (!allowedFields) {
        throw new Error(`Unknown table: ${tableName}`);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (allowedFields.includes(key) && value !== undefined) {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

/**
 * Build safe UPDATE query
 * @param {string} tableName - Name of the table
 * @param {Object} data - Data to update
 * @param {string} whereField - Field for WHERE clause
 * @returns {Object} - { query: string, values: array }
 */
const buildUpdateQuery = (tableName, data, whereField = 'id') => {
    const sanitized = sanitizeFields(tableName, data);
    const fields = Object.keys(sanitized);
    
    if (fields.length === 0) {
        return null;
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => sanitized[field]);
    
    return {
        query: `UPDATE ${tableName} SET ${setClause} WHERE ${whereField} = ?`,
        values
    };
};

/**
 * Validate and sanitize string input
 * @param {string} input - Input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input, maxLength = 255) => {
    if (typeof input !== 'string') return '';
    return input.trim().slice(0, maxLength);
};

/**
 * Validate integer input
 * @param {any} input - Input value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number|null} - Validated integer or null
 */
const sanitizeInt = (input, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    const num = parseInt(input, 10);
    if (isNaN(num)) return null;
    return Math.max(min, Math.min(max, num));
};

/**
 * Validate enum value
 * @param {string} input - Input value
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} defaultValue - Default value if invalid
 * @returns {string} - Validated enum value
 */
const sanitizeEnum = (input, allowedValues, defaultValue) => {
    if (allowedValues.includes(input)) return input;
    return defaultValue;
};

module.exports = {
    ALLOWED_FIELDS,
    sanitizeFields,
    buildUpdateQuery,
    sanitizeString,
    sanitizeInt,
    sanitizeEnum
};
