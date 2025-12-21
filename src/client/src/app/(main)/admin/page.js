'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, MessageSquare, Settings, TrendingUp, Shield, Trash2 } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminPage() {
    const router = useRouter();
    const { isAdmin, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (authLoading) return; // Chờ auth load xong
        if (!isAdmin) {
            router.push('/dashboard');
            return;
        }
        fetchStats();
    }, [isAdmin, authLoading]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            toast.error('Không thể tải thống kê');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <MainLayout><div className="text-center py-8">Đang tải...</div></MainLayout>;
    if (!isAdmin) return null;

    const statCards = [
        { title: 'Người dùng', value: stats?.totalUsers || 0, icon: Users, color: 'from-blue-500 to-cyan-500' },
        { title: 'Dự án', value: stats?.totalProjects || 0, icon: BookOpen, color: 'from-green-500 to-emerald-500' },
        { title: 'Phản hồi chờ xử lý', value: stats?.pendingFeedbacks || 0, icon: MessageSquare, color: 'from-orange-500 to-amber-500' },
    ];

    const tabs = [
        { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
        { id: 'users', label: 'Người dùng', icon: Users },
        { id: 'feedbacks', label: 'Phản hồi', icon: MessageSquare },
        { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
    ];

    return (
        <MainLayout>
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-gray-600">Quản lý hệ thống</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                            activeTab === tab.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                            <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {activeTab === 'overview' && <OverviewTab stats={stats} statCards={statCards} />}
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'feedbacks' && <FeedbacksTab />}
                    {activeTab === 'settings' && <SystemSettingsTab />}
                </>
            )}
        </MainLayout>
    );
}


function OverviewTab({ stats, statCards }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
                        <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                            <card.icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-gray-600">{card.title}</p>
                    </div>
                ))}
            </div>

            {stats?.recentUsers && stats.recentUsers.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Người dùng mới</h3>
                    <div className="space-y-3">
                        {stats.recentUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.username}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function UsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.users || []);
        } catch (error) {
            toast.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, isActive) => {
        try {
            await api.put(`/admin/users/${userId}/status`, { is_active: !isActive });
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: !isActive } : u));
            toast.success('Cập nhật thành công');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal) return;
        setDeleting(true);
        try {
            await api.delete(`/admin/users/${deleteModal.id}`);
            setUsers(users.filter(u => u.id !== deleteModal.id));
            toast.success('Xóa người dùng thành công');
            setDeleteModal(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setDeleting(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="text-center py-8">Đang tải...</div>;

    return (
        <>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm người dùng..."
                        className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                {user.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-900">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {user.role === 'admin' ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {user.is_active ? 'Hoạt động' : 'Bị khóa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.role !== 'admin' && (
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.is_active)}
                                                    className={`px-3 py-1 text-sm font-medium rounded-lg ${
                                                        user.is_active
                                                            ? 'text-orange-600 hover:bg-orange-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                >
                                                    {user.is_active ? 'Khóa' : 'Mở khóa'}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal(user)}
                                                    className="px-3 py-1 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteModal(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Xóa người dùng?</h2>
                            <p className="text-gray-600 mb-2">
                                Bạn có chắc chắn muốn xóa tài khoản <span className="font-semibold">{deleteModal.username}</span>?
                            </p>
                            <p className="text-sm text-red-500 mb-6">
                                Hành động này sẽ xóa vĩnh viễn tất cả dữ liệu của người dùng và không thể hoàn tác!
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                                    disabled={deleting}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50"
                                >
                                    {deleting ? 'Đang xóa...' : 'Xóa người dùng'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


function FeedbacksTab() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [response, setResponse] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await api.get('/admin/feedbacks');
            setFeedbacks(res.data.feedbacks || []);
        } catch (error) {
            toast.error('Không thể tải danh sách phản hồi');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async () => {
        if (!response.trim()) return;
        try {
            await api.put(`/admin/feedbacks/${selectedFeedback.id}/respond`, {
                admin_response: response,
                status: 'resolved'
            });
            toast.success('Đã gửi phản hồi');
            fetchFeedbacks();
            setSelectedFeedback(null);
            setResponse('');
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (feedbackId, e) => {
        e.stopPropagation();
        if (!confirm('Bạn có chắc muốn xóa phản hồi này?')) return;
        
        setDeletingId(feedbackId);
        try {
            await api.delete(`/admin/feedbacks/${feedbackId}`);
            setFeedbacks(feedbacks.filter(f => f.id !== feedbackId));
            toast.success('Xóa phản hồi thành công');
            if (selectedFeedback?.id === feedbackId) {
                setSelectedFeedback(null);
            }
        } catch (error) {
            toast.error('Không thể xóa phản hồi');
        } finally {
            setDeletingId(null);
        }
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

    if (loading) return <div className="text-center py-8">Đang tải...</div>;

    return (
        <div className="space-y-4">
            {feedbacks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Chưa có phản hồi nào</p>
                </div>
            ) : (
                feedbacks.map(feedback => (
                    <div
                        key={feedback.id}
                        className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => { setSelectedFeedback(feedback); setResponse(feedback.admin_response || ''); }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{feedback.subject}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Từ: {feedback.username || feedback.email} • {new Date(feedback.created_at).toLocaleDateString('vi-VN')}
                                </p>
                                <p className="text-gray-600 mt-2 line-clamp-2">{feedback.content}</p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(feedback.status)}`}>
                                    {getStatusText(feedback.status)}
                                </span>
                                <button
                                    onClick={(e) => handleDelete(feedback.id, e)}
                                    disabled={deletingId === feedback.id}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Xóa phản hồi"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}

            {selectedFeedback && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFeedback(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">{selectedFeedback.subject}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Từ: {selectedFeedback.username} • {new Date(selectedFeedback.created_at).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Nội dung</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.content}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Phản hồi của Admin</h3>
                                <textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                    rows={4}
                                    placeholder="Nhập phản hồi..."
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleDelete(selectedFeedback.id, { stopPropagation: () => {} })}
                                    disabled={deletingId === selectedFeedback.id}
                                    className="px-4 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 disabled:opacity-50"
                                >
                                    Xóa
                                </button>
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={handleRespond}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg"
                                >
                                    Gửi phản hồi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SystemSettingsTab() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editValues, setEditValues] = useState({});

    // Mapping mô tả tiếng Việt cho các setting key
    const settingDescriptions = {
        site_name: 'Tên website hiển thị',
        contact_email: 'Email liên hệ hỗ trợ',
        max_projects_per_user: 'Số dự án tối đa mỗi người dùng',
        allow_registration: 'Cho phép đăng ký tài khoản mới'
    };

    // Các setting có kiểu boolean (true/false)
    const booleanSettings = ['allow_registration'];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/settings');
            setSettings(response.data.settings || []);
            const values = {};
            response.data.settings?.forEach(s => { values[s.setting_key] = s.setting_value; });
            setEditValues(values);
        } catch (error) {
            toast.error('Không thể tải cài đặt');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key) => {
        try {
            await api.put(`/admin/settings/${key}`, { value: editValues[key] });
            toast.success('Cập nhật thành công');
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const isBooleanSetting = (key) => booleanSettings.includes(key);

    if (loading) return <div className="text-center py-8">Đang tải...</div>;

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Cài đặt hệ thống</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {settings.map(setting => (
                    <div key={setting.id} className="p-6 flex items-center justify-between">
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">{setting.setting_key}</p>
                            <p className="text-sm text-gray-500">
                                {settingDescriptions[setting.setting_key] || setting.description}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            {isBooleanSetting(setting.setting_key) ? (
                                <select
                                    value={editValues[setting.setting_key] || 'false'}
                                    onChange={(e) => setEditValues({ ...editValues, [setting.setting_key]: e.target.value })}
                                    className="w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="true">Bật</option>
                                    <option value="false">Tắt</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={editValues[setting.setting_key] || ''}
                                    onChange={(e) => setEditValues({ ...editValues, [setting.setting_key]: e.target.value })}
                                    className="w-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            )}
                            <button
                                onClick={() => handleSave(setting.setting_key)}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
