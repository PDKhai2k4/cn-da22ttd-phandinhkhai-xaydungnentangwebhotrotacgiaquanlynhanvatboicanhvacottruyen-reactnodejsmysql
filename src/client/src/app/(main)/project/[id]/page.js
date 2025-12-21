'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Users, MapPin, Clock, Package, FileText, StickyNote, Settings, Edit, Save, X, Heart } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchProject();
        fetchStats();
    }, [id]);

    const fetchProject = async () => {
        try {
            const response = await api.get(`/projects/${id}`);
            setProject(response.data.project);
            setFormData(response.data.project);
        } catch (error) {
            toast.error('Không thể tải thông tin dự án');
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const [chars, locs, items, chapters, notes, timeline, rels] = await Promise.all([
                api.get(`/characters/project/${id}`).catch(() => ({ data: { total: 0 } })),
                api.get(`/locations/project/${id}`).catch(() => ({ data: { locations: [] } })),
                api.get(`/items/project/${id}`).catch(() => ({ data: { total: 0 } })),
                api.get(`/chapters/project/${id}`).catch(() => ({ data: { total: 0, totalWords: 0 } })),
                api.get(`/notes/project/${id}`).catch(() => ({ data: { total: 0 } })),
                api.get(`/timeline/project/${id}`).catch(() => ({ data: { events: [] } })),
                api.get(`/relationships/project/${id}`).catch(() => ({ data: { relationships: [] } })),
            ]);
            setStats({
                characters: chars.data.total || 0,
                locations: locs.data.locations?.length || 0,
                items: items.data.total || 0,
                chapters: chapters.data.total || 0,
                totalWords: chapters.data.totalWords || 0,
                notes: notes.data.total || 0,
                timeline: timeline.data.events?.length || 0,
                relationships: rels.data.relationships?.length || 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSave = async () => {
        try {
            await api.put(`/projects/${id}`, formData);
            setProject(formData);
            setEditing(false);
            toast.success('Cập nhật thành công');
        } catch (error) {
            toast.error('Không thể cập nhật');
        }
    };

    const quickLinks = [
        { title: 'Nhân vật', icon: Users, path: `/project/${id}/characters`, count: stats.characters, color: 'from-blue-500 to-cyan-500' },
        { title: 'Mối quan hệ', icon: Heart, path: `/project/${id}/relationships`, count: stats.relationships || 0, color: 'from-pink-500 to-rose-500' },
        { title: 'Địa điểm', icon: MapPin, path: `/project/${id}/locations`, count: stats.locations, color: 'from-green-500 to-emerald-500' },
        { title: 'Timeline', icon: Clock, path: `/project/${id}/timeline`, count: stats.timeline, color: 'from-purple-500 to-pink-500' },
        { title: 'Vật phẩm', icon: Package, path: `/project/${id}/items`, count: stats.items, color: 'from-orange-500 to-amber-500' },
        { title: 'Chương truyện', icon: FileText, path: `/project/${id}/chapters`, count: stats.chapters, color: 'from-red-500 to-rose-500' },
        { title: 'Ghi chú', icon: StickyNote, path: `/project/${id}/notes`, count: stats.notes, color: 'from-indigo-500 to-violet-500' },
    ];

    if (loading) {
        return (
            <MainLayout projectId={id}>
                <div className="animate-pulse space-y-6">
                    <div className="h-48 bg-gray-200 rounded-2xl"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout projectId={id}>
            {/* Project Header */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-primary-500 to-purple-600 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="p-6 -mt-12 relative">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                                <BookOpen className="w-12 h-12 text-primary-500" />
                            </div>
                            <div className="pt-8">
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="text-2xl font-bold text-gray-900 border-b-2 border-primary-500 outline-none bg-transparent"
                                    />
                                ) : (
                                    <h1 className="text-2xl font-bold text-gray-900">{project?.title}</h1>
                                )}
                                <div className="flex items-center space-x-3 mt-2">
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                        project?.status === 'writing' ? 'bg-blue-100 text-blue-700' :
                                        project?.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        project?.status === 'paused' ? 'bg-gray-100 text-gray-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {project?.status === 'writing' ? 'Đang viết' :
                                         project?.status === 'completed' ? 'Hoàn thành' :
                                         project?.status === 'paused' ? 'Tạm dừng' : 'Lên kế hoạch'}
                                    </span>
                                    {project?.genre && (
                                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                                            {project.genre}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 flex space-x-2">
                            {editing ? (
                                <>
                                    <button
                                        onClick={() => { setEditing(false); setFormData(project); }}
                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                                    >
                                        <Save className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                        {editing ? (
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                rows={3}
                                placeholder="Mô tả dự án..."
                            />
                        ) : (
                            <p className="text-gray-600">{project?.description || 'Chưa có mô tả'}</p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{stats.chapters || 0}</p>
                            <p className="text-sm text-gray-500">Chương</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{(stats.totalWords || 0).toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Từ</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{stats.characters || 0}</p>
                            <p className="text-sm text-gray-500">Nhân vật</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quản lý nội dung</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickLinks.map((link) => (
                    <Link
                        key={link.path}
                        href={link.path}
                        className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 card-hover"
                    >
                        <div className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <link.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                        <p className="text-2xl font-bold text-gray-900">{link.count}</p>
                    </Link>
                ))}
            </div>
        </MainLayout>
    );
}
