'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, FileText, Edit, Trash2, Eye, Clock, RefreshCw, X } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import api from '@/services/api';
import toast from 'react-hot-toast';

// Draft storage key - phải giống với key trong new/page.js
const getDraftKey = (projectId) => `chapter_draft_new_${projectId}`;

export default function ChaptersPage() {
    const { id: projectId } = useParams();
    const router = useRouter();
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewingChapter, setViewingChapter] = useState(null);
    const [draft, setDraft] = useState(null);

    useEffect(() => {
        fetchChapters();
        checkDraft();
    }, [projectId]);

    const fetchChapters = async () => {
        try {
            const response = await api.get(`/chapters/project/${projectId}`);
            setChapters(response.data.chapters || []);
        } catch (error) {
            toast.error('Không thể tải danh sách chương');
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra có bản nháp không
    const checkDraft = () => {
        try {
            const savedDraft = localStorage.getItem(getDraftKey(projectId));
            if (savedDraft) {
                const draftData = JSON.parse(savedDraft);
                // Chỉ hiển thị nếu có nội dung
                if (draftData.title?.trim() || draftData.content?.trim()) {
                    setDraft(draftData);
                }
            }
        } catch (e) {
            console.error('Error checking draft:', e);
        }
    };

    // Xóa bản nháp
    const discardDraft = () => {
        if (!confirm('Bạn có chắc muốn xóa bản nháp này?')) return;
        localStorage.removeItem(getDraftKey(projectId));
        setDraft(null);
        toast.success('Đã xóa bản nháp');
    };

    // Tiếp tục soạn thảo bản nháp
    const continueDraft = () => {
        router.push(`/project/${projectId}/chapters/new`);
    };

    const handleDelete = async (chapterId) => {
        if (!confirm('Bạn có chắc muốn xóa chương này?')) return;
        try {
            await api.delete(`/chapters/${chapterId}`);
            setChapters(chapters.filter(c => c.id !== chapterId));
            toast.success('Xóa thành công');
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-700',
            writing: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            published: 'bg-purple-100 text-purple-700'
        };
        return styles[status] || styles.draft;
    };

    const getStatusText = (status) => {
        const texts = { draft: 'Nháp', writing: 'Đang viết', completed: 'Hoàn thành', published: 'Đã xuất bản' };
        return texts[status] || 'Nháp';
    };

    // Đếm số từ từ HTML content
    const getWordCount = (html) => {
        if (!html) return 0;
        const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return text ? text.split(' ').filter(word => word.length > 0).length : 0;
    };

    const filteredChapters = chapters
        .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.chapter_number - b.chapter_number);

    const totalWords = chapters.reduce((sum, c) => sum + (c.word_count || 0), 0);

    return (
        <MainLayout projectId={projectId}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chương truyện</h1>
                    <p className="text-gray-600">{chapters.length} chương • {totalWords.toLocaleString()} từ</p>
                </div>
                <button
                    onClick={() => router.push(`/project/${projectId}/chapters/new`)}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Thêm chương</span>
                </button>
            </div>

            {/* Draft Banner - Hiển thị khi có bản nháp */}
            {draft && (
                <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <RefreshCw className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-amber-900">Bạn có bản nháp chưa lưu</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    {draft.title ? `"${draft.title}"` : 'Chương chưa đặt tên'} 
                                    {draft.content && ` • ${getWordCount(draft.content).toLocaleString()} từ`}
                                </p>
                                {draft.savedAt && (
                                    <p className="text-xs text-amber-600 mt-1 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Lưu lần cuối: {new Date(draft.savedAt).toLocaleString('vi-VN')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                                onClick={discardDraft}
                                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                                title="Xóa bản nháp"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <button
                                onClick={continueDraft}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                            >
                                Tiếp tục soạn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm chương..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            ) : filteredChapters.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có chương nào</h3>
                    <p className="text-gray-600 mb-4">Bắt đầu viết chương đầu tiên</p>
                    <button
                        onClick={() => router.push(`/project/${projectId}/chapters/new`)}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Thêm chương đầu tiên</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredChapters.map((chapter) => (
                        <div
                            key={chapter.id}
                            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all card-hover"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                                        <span className="text-lg font-bold text-red-500">{chapter.chapter_number}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(chapter.status)}`}>
                                                {getStatusText(chapter.status)}
                                            </span>
                                            <span className="text-xs text-gray-500">{(chapter.word_count || 0).toLocaleString()} từ</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => setViewingChapter(chapter)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        title="Xem nhanh"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => router.push(`/project/${projectId}/chapters/${chapter.id}/edit`)}
                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(chapter.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewingChapter && (
                <ChapterViewModal
                    chapter={viewingChapter}
                    onClose={() => setViewingChapter(null)}
                    onEdit={() => { router.push(`/project/${projectId}/chapters/${viewingChapter.id}/edit`); setViewingChapter(null); }}
                />
            )}
        </MainLayout>
    );
}

function ChapterViewModal({ chapter, onClose, onEdit }) {
    const [fullChapter, setFullChapter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChapterContent = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/chapters/${chapter.id}`);
                setFullChapter(response.data.chapter);
            } catch (error) {
                toast.error('Không thể tải nội dung chương');
            } finally {
                setLoading(false);
            }
        };
        fetchChapterContent();
    }, [chapter.id]);

    const getStatusText = (status) => {
        const texts = { draft: 'Nháp', writing: 'Đang viết', completed: 'Hoàn thành', published: 'Đã xuất bản' };
        return texts[status] || 'Nháp';
    };

    const displayChapter = fullChapter || chapter;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden animate-fadeIn flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Chương {displayChapter.chapter_number}: {displayChapter.title}</h2>
                        <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-500">{getStatusText(displayChapter.status)}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{(displayChapter.word_count || 0).toLocaleString()} từ</span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={onEdit} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center space-x-2">
                            <Edit className="w-4 h-4" />
                            <span>Chỉnh sửa</span>
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                            <span className="text-gray-500">✕</span>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        <div className="prose max-w-none">
                            {displayChapter.content ? (
                                <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: displayChapter.content }} />
                            ) : (
                                <p className="text-gray-400 italic">Chưa có nội dung</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
