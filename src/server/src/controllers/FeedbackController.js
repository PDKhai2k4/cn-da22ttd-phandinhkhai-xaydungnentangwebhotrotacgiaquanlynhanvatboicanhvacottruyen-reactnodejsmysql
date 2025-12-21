const FeedbackModel = require('../models/FeedbackModel');

class FeedbackController {
    // User: Gửi phản hồi
    static async createFeedback(req, res) {
        try {
            const { subject, content, feedback_type } = req.body;
            
            const feedbackId = await FeedbackModel.create({
                user_id: req.user.id,
                subject,
                content,
                feedback_type
            });
            
            const feedback = await FeedbackModel.findById(feedbackId);
            res.status(201).json({ message: 'Gửi phản hồi thành công', feedback });
        } catch (error) {
            console.error('Create feedback error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // User: Xem phản hồi của mình
    static async getMyFeedbacks(req, res) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const result = await FeedbackModel.findByUserId(req.user.id, parseInt(page), parseInt(limit));
            res.json(result);
        } catch (error) {
            console.error('Get my feedbacks error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Admin: Lấy tất cả phản hồi
    static async getAllFeedbacks(req, res) {
        try {
            const { page = 1, limit = 20, status } = req.query;
            const result = await FeedbackModel.getAll(parseInt(page), parseInt(limit), status || null);
            res.json(result);
        } catch (error) {
            console.error('Get all feedbacks error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Admin: Xem chi tiết phản hồi
    static async getFeedback(req, res) {
        try {
            const { id } = req.params;
            const feedback = await FeedbackModel.findById(id);
            
            if (!feedback) {
                return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
            }
            
            // User chỉ xem được phản hồi của mình
            if (req.user.role !== 'admin' && feedback.user_id !== req.user.id) {
                return res.status(403).json({ message: 'Không có quyền truy cập' });
            }
            
            res.json({ feedback });
        } catch (error) {
            console.error('Get feedback error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Admin: Phản hồi
    static async respondFeedback(req, res) {
        try {
            const { id } = req.params;
            const { response, status } = req.body;
            
            const feedback = await FeedbackModel.findById(id);
            if (!feedback) {
                return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
            }
            
            await FeedbackModel.respond(id, req.user.id, response, status || 'reviewed');
            const updated = await FeedbackModel.findById(id);
            
            res.json({ message: 'Phản hồi thành công', feedback: updated });
        } catch (error) {
            console.error('Respond feedback error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Admin: Cập nhật trạng thái
    static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            await FeedbackModel.updateStatus(id, status);
            res.json({ message: 'Cập nhật trạng thái thành công' });
        } catch (error) {
            console.error('Update status error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Admin: Thống kê phản hồi
    static async getStats(req, res) {
        try {
            const stats = await FeedbackModel.getStats();
            res.json({ stats });
        } catch (error) {
            console.error('Get feedback stats error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
}

module.exports = FeedbackController;
