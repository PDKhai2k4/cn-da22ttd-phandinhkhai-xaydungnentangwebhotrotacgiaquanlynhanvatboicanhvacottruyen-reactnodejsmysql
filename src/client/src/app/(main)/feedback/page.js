'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Send, Bug, Lightbulb, HelpCircle, MoreHorizontal, Clock, CheckCircle, X } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const response = await api.get('/feedbacks/my');
            setFeedbacks(response.data.feedbacks || []);
        } catch (error) {
            toast.error('Không thể tải danh sách phản hồi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data) => {
        try {
            await api.post('/feedbacks', data);
            toast.success('Gửi phản hồi thành công');
            fetchFeedbacks();
            setShowModal(false);
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const getTypeIcon = (type) => {
        const icons = { bug: Bug, feature: Lightbulb, question: HelpCircle, other: MoreHorizontal };
        return icons[type] || MoreHorizontal;
    };

    const getTypeStyle = (type) => {
        const styles = {
            bug: 'bg-red-100 text-red-700',
            feature: 'bg-green-100 text-green-700',
            question: 'bg-blue-100 text-blue-700',
            other: 'bg-gray-100 text-gray-700'
        };
        return styles[type] || styles.other;
    };

    const getTypeText = (type) => {
        const texts = { bug: 'Báo lỗi', feature: 'Đề xuất', question: 'Câu hỏi', other: 'Khác' };
        return texts[type] || 'Khác';
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            reviewed: 'bg-blue-100 text-blue-700',
            resolved: 'bg-green-100 text-green-700',
            closed: 'bg-gray-100 text-gray-700'
        };
        return styles[status] || styles.pending;
    };

    const getStatusText = (status) => {
        const texts = { pending: 'Chờ xử lý', reviewed: 'Đang xem xét', resolved: 'Đã giải quyết', closed: 'Đã đóng' };
        return texts[status] || 'Chờ xử lý';
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Phản hồi & Hỗ trợ</h1>
                        <p className="text-gray-600">Gửi báo lỗi, đề xuất tính năng hoặc câu hỏi</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Gửi phản hồi</span>
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có phản hồi nào</h3>
                        <p className="text-gray-600 mb-4">Hãy gửi phản hồi đầu tiên của bạn</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Gửi phản hồi</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedbacks.map((feedback) => {
                            const TypeIcon = getTypeIcon(feedback.feedback_type);
                            return (
                                <div
                                    key={feedback.id}
                                    className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all cursor-pointer card-hover"
                                    onClick={() => setSelectedFeedback(feedback)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeStyle(feedback.feedback_type)}`}>
                                                <TypeIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{feedback.subject}</h3>
                                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{feedback.content}</p>
                                                <div className="flex items-center space-x-3 mt-2">
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(feedback.status)}`}>
                                                        {getStatusText(feedback.status)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(feedback.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {feedback.admin_response && (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                Đã phản hồi
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <FeedbackModal
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                />
            )}

            {selectedFeedback && (
                <FeedbackDetailModal
                    feedback={selectedFeedback}
                    onClose={() => setSelectedFeedback(null)}
                />
            )}
        </MainLayout>
    );
}

function FeedbackModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        subject: '',
        content: '',
        feedback_type: 'other'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    const types = [
        { value: 'bug', label: 'Báo lỗi', icon: Bug, color: 'text-red-600 bg-red-50 border-red-200' },
        { value: 'feature', label: 'Đề xuất', icon: Lightbulb, color: 'text-green-600 bg-green-50 border-green-200' },
        { value: 'question', label: 'Câu hỏi', icon: HelpCircle, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        { value: 'other', label: 'Khác', icon: MoreHorizontal, color: 'text-gray-600 bg-gray-50 border-gray-200' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Gửi phản hồi</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Loại phản hồi</label>
                        <div className="grid grid-cols-2 gap-3">
                            {types.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, feedback_type: type.value })}
                                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${
                                        formData.feedback_type === type.value
                                            ? type.color + ' border-current'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <type.icon className="w-5 h-5" />
                                    <span className="font-medium">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="Tóm tắt vấn đề của bạn"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={5}
                            placeholder="Mô tả chi tiết..."
                            required
                        />
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 inline-flex items-center justify-center space-x-2">
                            <Send className="w-5 h-5" />
                            <span>{loading ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FeedbackDetailModal({ feedback, onClose }) {
    const getTypeText = (type) => {
        const texts = { bug: 'Báo lỗi', feature: 'Đề xuất', question: 'Câu hỏi', other: 'Khác' };
        return texts[type] || 'Khác';
    };
    const getStatusText = (status) => {
        const texts = { pending: 'Chờ xử lý', reviewed: 'Đang xem xét', resolved: 'Đã giải quyết', closed: 'Đã đóng' };
        return texts[status] || 'Chờ xử lý';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{feedback.subject}</h2>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-500">{getTypeText(feedback.feedback_type)}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{getStatusText(feedback.status)}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Nội dung</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{feedback.content}</p>
                    </div>
                    {feedback.admin_response && (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                            <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <h3 className="font-medium text-green-800">Phản hồi từ Admin</h3>
                            </div>
                            <p className="text-green-700">{feedback.admin_response}</p>
                            {feedback.responded_at && (
                                <p className="text-xs text-green-600 mt-2">
                                    {new Date(feedback.responded_at).toLocaleString('vi-VN')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
