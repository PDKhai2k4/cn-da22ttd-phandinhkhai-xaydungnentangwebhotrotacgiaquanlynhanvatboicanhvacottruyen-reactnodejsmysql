const { validationResult, body, param, query } = require('express-validator');

/**
 * Validate request and return errors if any
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Dữ liệu không hợp lệ',
            errors: errors.array().map(err => ({ 
                field: err.path, 
                message: err.msg,
                value: err.value 
            }))
        });
    }
    next();
};

// ==================== COMMON VALIDATIONS ====================

const idParam = param('id')
    .isInt({ min: 1 })
    .withMessage('ID không hợp lệ')
    .toInt();

const projectIdParam = param('projectId')
    .isInt({ min: 1 })
    .withMessage('Project ID không hợp lệ')
    .toInt();

const paginationQuery = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim().isLength({ max: 100 })
];

// ==================== PROJECT VALIDATIONS ====================

const projectValidation = {
    create: [
        body('title')
            .trim()
            .notEmpty().withMessage('Tiêu đề không được để trống')
            .isLength({ max: 200 }).withMessage('Tiêu đề tối đa 200 ký tự'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 5000 }).withMessage('Mô tả tối đa 5000 ký tự'),
        body('genre')
            .optional()
            .trim()
            .isLength({ max: 100 }).withMessage('Thể loại tối đa 100 ký tự'),
        body('status')
            .optional()
            .isIn(['planning', 'writing', 'completed', 'paused'])
            .withMessage('Trạng thái không hợp lệ'),
        body('cover_image')
            .optional()
            .trim()
            .isLength({ max: 255 }).withMessage('URL ảnh bìa tối đa 255 ký tự')
    ],
    update: [
        idParam,
        body('title')
            .optional()
            .trim()
            .notEmpty().withMessage('Tiêu đề không được để trống')
            .isLength({ max: 200 }).withMessage('Tiêu đề tối đa 200 ký tự'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 5000 }).withMessage('Mô tả tối đa 5000 ký tự'),
        body('genre')
            .optional()
            .trim()
            .isLength({ max: 100 }).withMessage('Thể loại tối đa 100 ký tự'),
        body('status')
            .optional()
            .isIn(['planning', 'writing', 'completed', 'paused'])
            .withMessage('Trạng thái không hợp lệ'),
        body('cover_image')
            .optional()
            .trim()
            .isLength({ max: 255 }).withMessage('URL ảnh bìa tối đa 255 ký tự')
    ]
};

// ==================== CHARACTER VALIDATIONS ====================

const characterValidation = {
    create: [
        projectIdParam,
        body('name')
            .trim()
            .notEmpty().withMessage('Tên nhân vật không được để trống')
            .isLength({ max: 100 }).withMessage('Tên nhân vật tối đa 100 ký tự'),
        body('description').optional().trim(),
        body('appearance').optional().trim(),
        body('personality').optional().trim(),
        body('background').optional().trim(),
        body('skills').optional().trim(),
        body('avatar').optional({ values: 'falsy' }).trim().isLength({ max: 255 }),
        body('age').optional({ values: 'falsy' }).isInt({ min: 0, max: 10000 }).toInt(),
        body('gender').optional({ values: 'falsy' }).isIn(['male', 'female', 'other']),
        body('role').optional().isIn(['protagonist', 'antagonist', 'supporting', 'minor'])
    ],
    update: [
        idParam,
        body('name')
            .optional()
            .trim()
            .notEmpty().withMessage('Tên nhân vật không được để trống')
            .isLength({ max: 100 }).withMessage('Tên nhân vật tối đa 100 ký tự'),
        body('description').optional().trim(),
        body('appearance').optional().trim(),
        body('personality').optional().trim(),
        body('background').optional().trim(),
        body('skills').optional().trim(),
        body('avatar').optional({ values: 'falsy' }).trim().isLength({ max: 255 }),
        body('age').optional({ values: 'falsy' }).isInt({ min: 0, max: 10000 }).toInt(),
        body('gender').optional({ values: 'falsy' }).isIn(['male', 'female', 'other']),
        body('role').optional().isIn(['protagonist', 'antagonist', 'supporting', 'minor'])
    ]
};

// ==================== CHAPTER VALIDATIONS ====================

const chapterValidation = {
    create: [
        projectIdParam,
        body('title')
            .trim()
            .notEmpty().withMessage('Tiêu đề chương không được để trống')
            .isLength({ max: 200 }).withMessage('Tiêu đề chương tối đa 200 ký tự'),
        body('content').optional().trim(),
        body('chapter_number').optional().isInt({ min: 1 }).toInt(),
        body('status').optional().isIn(['draft', 'writing', 'completed', 'published']),
        body('notes').optional().trim()
    ],
    update: [
        idParam,
        body('title')
            .optional()
            .trim()
            .notEmpty().withMessage('Tiêu đề chương không được để trống')
            .isLength({ max: 200 }).withMessage('Tiêu đề chương tối đa 200 ký tự'),
        body('content').optional().trim(),
        body('chapter_number').optional().isInt({ min: 1 }).toInt(),
        body('status').optional().isIn(['draft', 'writing', 'completed', 'published']),
        body('notes').optional().trim()
    ]
};

// ==================== LOCATION VALIDATIONS ====================

const locationValidation = {
    create: [
        projectIdParam,
        body('name')
            .trim()
            .notEmpty().withMessage('Tên địa điểm không được để trống')
            .isLength({ max: 100 }).withMessage('Tên địa điểm tối đa 100 ký tự'),
        body('description').optional().trim(),
        body('history').optional().trim(),
        body('image').optional({ values: 'falsy' }).trim().isLength({ max: 255 }),
        body('location_type').optional().isIn(['world', 'continent', 'country', 'city', 'building', 'room', 'other']),
        body('parent_id').optional({ values: 'falsy' }).isInt({ min: 1 }).toInt()
    ],
    update: [
        idParam,
        body('name')
            .optional()
            .trim()
            .notEmpty().withMessage('Tên địa điểm không được để trống')
            .isLength({ max: 100 }).withMessage('Tên địa điểm tối đa 100 ký tự'),
        body('description').optional().trim(),
        body('history').optional().trim(),
        body('image').optional({ values: 'falsy' }).trim().isLength({ max: 255 }),
        body('location_type').optional().isIn(['world', 'continent', 'country', 'city', 'building', 'room', 'other']),
        body('parent_id').optional({ values: 'falsy' }).isInt({ min: 1 }).toInt()
    ]
};

// ==================== TIMELINE VALIDATIONS ====================

const timelineValidation = {
    create: [
        projectIdParam,
        body('title')
            .trim()
            .notEmpty().withMessage('Tiêu đề sự kiện không được để trống')
            .isLength({ max: 200 }).withMessage('Tiêu đề sự kiện tối đa 200 ký tự'),
        body('description').optional().trim(),
        body('event_date').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
        body('event_order').optional().isInt({ min: 0 }).toInt(),
        body('location_id').optional({ values: 'falsy' }).isInt({ min: 1 }).toInt(),
        body('importance').optional().isIn(['low', 'medium', 'high', 'critical']),
        body('event_type').optional().isIn(['plot', 'character', 'world', 'other'])
    ],
    update: [
        idParam,
        body('title')
            .optional()
            .trim()
            .notEmpty().withMessage('Tiêu đề sự kiện không được để trống')
            .isLength({ max: 200 }).withMessage('Tiêu đề sự kiện tối đa 200 ký tự'),
        body('description').optional().trim(),
        body('event_date').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
        body('event_order').optional().isInt({ min: 0 }).toInt(),
        body('location_id').optional({ values: 'falsy' }).isInt({ min: 1 }).toInt(),
        body('importance').optional().isIn(['low', 'medium', 'high', 'critical']),
        body('event_type').optional().isIn(['plot', 'character', 'world', 'other'])
    ]
};

// ==================== ITEM VALIDATIONS ====================

const itemValidation = {
    create: [
        projectIdParam,
        body('name')
            .trim()
            .notEmpty().withMessage('Tên vật phẩm không được để trống')
            .isLength({ max: 100 }).withMessage('Tên vật phẩm tối đa 100 ký tự'),
        body('description').optional().trim(),
        body('properties').optional().trim(),
        body('image').optional({ values: 'falsy' }).trim().isLength({ max: 255 }),
        body('item_type').optional().isIn(['weapon', 'tool', 'magic', 'technology', 'concept', 'other']),
        body('rarity').optional().isIn(['common', 'uncommon', 'rare', 'legendary'])
    ],
    update: [
        idParam,
        body('name')
            .optional()
            .trim()
            .notEmpty().withMessage('Tên vật phẩm không được để trống')
            .isLength({ max: 100 }).withMessage('Tên vật phẩm tối đa 100 ký tự'),
        body('description').optional().trim(),
        body('properties').optional().trim(),
        body('image').optional({ values: 'falsy' }).trim().isLength({ max: 255 }),
        body('item_type').optional().isIn(['weapon', 'tool', 'magic', 'technology', 'concept', 'other']),
        body('rarity').optional().isIn(['common', 'uncommon', 'rare', 'legendary'])
    ]
};

// ==================== NOTE VALIDATIONS ====================

const noteValidation = {
    create: [
        projectIdParam,
        body('title')
            .trim()
            .notEmpty().withMessage('Tiêu đề ghi chú không được để trống')
            .isLength({ max: 200 }).withMessage('Tiêu đề ghi chú tối đa 200 ký tự'),
        body('content').optional().trim(),
        body('note_type').optional().isIn(['idea', 'outline', 'research', 'todo', 'other']),
        body('tags').optional().trim().isLength({ max: 255 })
    ],
    update: [
        idParam,
        body('title')
            .optional()
            .trim()
            .notEmpty().withMessage('Tiêu đề ghi chú không được để trống')
            .isLength({ max: 200 }).withMessage('Tiêu đề ghi chú tối đa 200 ký tự'),
        body('content').optional().trim(),
        body('note_type').optional().isIn(['idea', 'outline', 'research', 'todo', 'other']),
        body('tags').optional().trim().isLength({ max: 255 })
    ]
};

// ==================== FEEDBACK VALIDATIONS ====================

const feedbackValidation = {
    create: [
        body('subject')
            .trim()
            .notEmpty().withMessage('Tiêu đề không được để trống')
            .isLength({ max: 200 }).withMessage('Tiêu đề tối đa 200 ký tự'),
        body('content')
            .trim()
            .notEmpty().withMessage('Nội dung không được để trống')
            .isLength({ max: 5000 }).withMessage('Nội dung tối đa 5000 ký tự'),
        body('feedback_type').optional().isIn(['bug', 'feature', 'question', 'other'])
    ],
    respond: [
        idParam,
        body('response')
            .optional()
            .trim()
            .isLength({ max: 5000 }).withMessage('Phản hồi tối đa 5000 ký tự'),
        body('status').optional().isIn(['pending', 'reviewed', 'resolved', 'closed'])
    ]
};

// ==================== RELATIONSHIP VALIDATIONS ====================

const relationshipValidation = {
    create: [
        body('character1_id')
            .isInt({ min: 1 }).withMessage('Character 1 ID không hợp lệ')
            .toInt(),
        body('character2_id')
            .isInt({ min: 1 }).withMessage('Character 2 ID không hợp lệ')
            .toInt(),
        body('relationship_type')
            .trim()
            .notEmpty().withMessage('Loại quan hệ không được để trống')
            .isLength({ max: 50 }).withMessage('Loại quan hệ tối đa 50 ký tự'),
        body('description').optional().trim()
    ],
    update: [
        idParam,
        body('relationship_type')
            .optional()
            .trim()
            .notEmpty().withMessage('Loại quan hệ không được để trống')
            .isLength({ max: 50 }).withMessage('Loại quan hệ tối đa 50 ký tự'),
        body('description').optional().trim()
    ]
};

module.exports = { 
    validateRequest,
    idParam,
    projectIdParam,
    paginationQuery,
    projectValidation,
    characterValidation,
    chapterValidation,
    locationValidation,
    timelineValidation,
    itemValidation,
    noteValidation,
    feedbackValidation,
    relationshipValidation
};
