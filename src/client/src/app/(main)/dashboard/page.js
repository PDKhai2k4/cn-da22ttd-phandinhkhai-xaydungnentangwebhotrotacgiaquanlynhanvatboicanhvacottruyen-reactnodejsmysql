'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Search, Filter, MoreVertical, Edit, Trash2, X } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import ImageUpload from '@/components/ImageUpload';
import api, { API_URL } from '@/services/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [search, setSearch] = useState('');

    const fetchProjects = useCallback(async (signal) => {
        try {
            const response = await api.get('/projects', { signal });
            setProjects(response.data.projects || []);
        } catch (error) {
            if (error.name !== 'CanceledError') {
                toast.error('Không thể tải danh sách dự án');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchProjects(controller.signal);
        
        return () => controller.abort();
    }, [fetchProjects]);

    const handleCreateProject = async (data) => {
        try {
            const response = await api.post('/projects', data);
            setProjects([response.data.project, ...projects]);
            setShowCreateModal(false);
            toast.success('Tạo dự án thành công!');
        } catch (error) {
            toast.error('Không thể tạo dự án');
        }
    };

    const [deletingId, setDeletingId] = useState(null);

    const handleDeleteProject = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa dự án này?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/projects/${id}`);
            setProjects(projects.filter(p => p.id !== id));
            toast.success('Xóa dự án thành công');
        } catch (error) {
            toast.error('Không thể xóa dự án');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredProjects = projects.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusStyle = (status) => {
        const styles = {
            planning: 'bg-amber-100 text-amber-700',
            writing: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            paused: 'bg-gray-100 text-gray-700'
        };
        return styles[status] || styles.planning;
    };

    const getStatusText = (status) => {
        const texts = {
            planning: 'Lên kế hoạch',
            writing: 'Đang viết',
            completed: 'Hoàn thành',
            paused: 'Tạm dừng'
        };
        return texts[status] || 'Lên kế hoạch';
    };

    return (
        <MainLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dự án của tôi</h1>
                    <p className="text-gray-600 mt-1">Quản lý và phát triển các tác phẩm</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Tạo dự án mới</span>
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm dự án..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                            <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {search ? 'Không tìm thấy dự án' : 'Chưa có dự án nào'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {search ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách tạo dự án đầu tiên'}
                    </p>
                    {!search && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Tạo dự án mới</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 card-hover">
                            {/* Cover */}
                            <div className="h-40 bg-gradient-to-br from-primary-100 to-purple-100 relative">
                                {project.cover_image ? (
                                    <img src={project.cover_image.startsWith('http') ? project.cover_image : `${API_URL}${project.cover_image}`} alt={project.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-16 h-16 text-primary-300" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(project.status)}`}>
                                        {getStatusText(project.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <Link href={`/project/${project.id}`}>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-1">
                                        {project.title}
                                    </h3>
                                </Link>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {project.description || 'Chưa có mô tả'}
                                </p>
                                {project.genre && (
                                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mb-4">
                                        {project.genre}
                                    </span>
                                )}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">
                                        {new Date(project.updated_at).toLocaleDateString('vi-VN')}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <Link
                                            href={`/project/${project.id}`}
                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteProject(project.id)}
                                            disabled={deletingId === project.id}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {deletingId === project.id ? (
                                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateProject}
                />
            )}
        </MainLayout>
    );
}

function CreateProjectModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        genre: '',
        status: 'planning',
        cover_image: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Tạo dự án mới</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Cover Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa</label>
                        <ImageUpload
                            value={formData.cover_image}
                            onChange={(url) => setFormData({ ...formData, cover_image: url })}
                            type="projects"
                            aspectRatio="cover"
                            placeholder="Kéo thả hoặc click để chọn ảnh bìa"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên dự án *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            placeholder="Nhập tên dự án"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                            rows={3}
                            placeholder="Mô tả ngắn về dự án"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thể loại</label>
                            <input
                                type="text"
                                value={formData.genre}
                                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="VD: Tiên hiệp, Fantasy..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            >
                                <option value="planning">Lên kế hoạch</option>
                                <option value="writing">Đang viết</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="paused">Tạm dừng</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">Hủy</button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50">{loading ? 'Đang tạo...' : 'Tạo dự án'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
