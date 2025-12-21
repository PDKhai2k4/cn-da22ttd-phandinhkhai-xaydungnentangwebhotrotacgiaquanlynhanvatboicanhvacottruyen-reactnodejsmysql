'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileText, Clock, Hash, AlignLeft, CloudOff, Cloud, RefreshCw } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import QuillWithTooltip from '@/components/QuillWithTooltip';
import api from '@/services/api';
import toast from 'react-hot-toast';

// Draft storage key
const getDraftKey = (projectId) => `chapter_draft_new_${projectId}`;

export default function NewChapterPage() {
    const { id: projectId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [chapterCount, setChapterCount] = useState(0);

    const [lastSaved, setLastSaved] = useState(null);
    const [draftStatus, setDraftStatus] = useState('idle'); // idle, saving, saved, error
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showDraftBanner, setShowDraftBanner] = useState(false);
    const initialLoadRef = useRef(true);
    const formDataRef = useRef(null);
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        chapter_number: 1,
        status: 'draft',
        notes: ''
    });

    // Entities for tooltip (characters, locations, items)
    const [entities, setEntities] = useState([]);

    // Keep formDataRef in sync
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    // Fetch entities for tooltip
    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const [charactersRes, locationsRes, itemsRes] = await Promise.all([
                    api.get(`/characters/project/${projectId}`).catch(() => ({ data: { characters: [] } })),
                    api.get(`/locations/project/${projectId}`).catch(() => ({ data: { locations: [] } })),
                    api.get(`/items/project/${projectId}`).catch(() => ({ data: { items: [] } }))
                ]);

                const allEntities = [
                    ...(charactersRes.data.characters || []).map(c => ({
                        id: c.id,
                        name: c.name,
                        type: 'character',
                        description: c.description,
                        role: c.role,
                        avatar: c.avatar,
                        age: c.age,
                        gender: c.gender
                    })),
                    ...(locationsRes.data.locations || []).map(l => ({
                        id: l.id,
                        name: l.name,
                        type: 'location',
                        description: l.description,
                        location_type: l.location_type
                    })),
                    ...(itemsRes.data.items || []).map(i => ({
                        id: i.id,
                        name: i.name,
                        type: 'item',
                        description: i.description,
                        item_type: i.item_type,
                        rarity: i.rarity
                    }))
                ];

                setEntities(allEntities);
            } catch (error) {
                console.error('Error fetching entities:', error);
            }
        };

        if (projectId) {
            fetchEntities();
        }
    }, [projectId]);

    // Quill modules configuration - các công cụ soạn thảo
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean']
            ],
        },
        clipboard: {
            matchVisual: false
        }
    }), []);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'bullet', 'indent',
        'direction', 'align',
        'blockquote', 'code-block',
        'link', 'image'
    ];

    useEffect(() => {
        fetchChapterCount();
    }, [projectId]);

    const fetchChapterCount = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/chapters/project/${projectId}`);
            const count = response.data.chapters?.length || 0;
            setChapterCount(count);
            setFormData(prev => ({ ...prev, chapter_number: count + 1 }));
        } catch (error) {
            console.error('Error fetching chapters:', error);
        } finally {
            setLoading(false);
        }
    };

    // Đếm số từ từ HTML content
    const getWordCount = useCallback((html) => {
        if (!html) return 0;
        const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return text ? text.split(' ').filter(word => word.length > 0).length : 0;
    }, []);

    // Đếm số ký tự
    const getCharCount = useCallback((html) => {
        if (!html) return 0;
        return html.replace(/<[^>]*>/g, '').length;
    }, []);

    const wordCount = getWordCount(formData.content);
    const charCount = getCharCount(formData.content);

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        
        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề chương');
            return;
        }

        setSaving(true);
        try {
            await api.post(`/chapters/project/${projectId}`, {
                ...formData,
                word_count: wordCount
            });
            clearDraft(); // Xóa draft sau khi lưu thành công
            toast.success('Tạo chương thành công!');
            router.push(`/project/${projectId}/chapters`);
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tạo chương');
        } finally {
            setSaving(false);
        }
    };

    // Save draft to localStorage
    const saveDraft = useCallback(() => {
        const currentData = formDataRef.current;
        if (!currentData) return;
        
        // Chỉ lưu nếu có nội dung
        if (!currentData.title?.trim() && !currentData.content?.trim()) return;
        
        try {
            setDraftStatus('saving');
            const draftData = {
                ...currentData,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(getDraftKey(projectId), JSON.stringify(draftData));
            setLastSaved(new Date());
            setDraftStatus('saved');
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Auto-save failed:', error);
            setDraftStatus('error');
        }
    }, [projectId]);

    // Load draft from localStorage on mount
    useEffect(() => {
        if (!initialLoadRef.current) return;
        
        const savedDraft = localStorage.getItem(getDraftKey(projectId));
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                if (draft.title || draft.content) {
                    setShowDraftBanner(true);
                    // Tự động load draft, hiển thị banner để user có thể hủy
                    setFormData(prev => ({ 
                        ...prev, 
                        title: draft.title || '',
                        content: draft.content || '',
                        notes: draft.notes || '',
                        status: draft.status || 'draft'
                    }));
                    if (draft.savedAt) {
                        setLastSaved(new Date(draft.savedAt));
                    }
                }
            } catch (e) {
                console.error('Error loading draft:', e);
            }
        }
        initialLoadRef.current = false;
    }, [projectId]);

    // Auto-save every 30 seconds when there are changes
    useEffect(() => {
        if (!hasUnsavedChanges) return;
        
        const interval = setInterval(() => {
            saveDraft();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [hasUnsavedChanges, saveDraft]);

    // Save draft on content change (debounced)
    useEffect(() => {
        if (initialLoadRef.current) return;
        
        setHasUnsavedChanges(true);
        setDraftStatus('idle');
        
        const timeout = setTimeout(() => {
            saveDraft();
        }, 5000); // Auto-save sau 5 giây không thao tác
        
        return () => clearTimeout(timeout);
    }, [formData.title, formData.content, formData.notes, saveDraft]);

    // Save draft before leaving page
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                saveDraft();
                e.preventDefault();
                e.returnValue = 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời đi?';
                return e.returnValue;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && hasUnsavedChanges) {
                saveDraft();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [hasUnsavedChanges, saveDraft]);

    // Clear draft after successful save
    const clearDraft = useCallback(() => {
        localStorage.removeItem(getDraftKey(projectId));
        setShowDraftBanner(false);
        setHasUnsavedChanges(false);
    }, [projectId]);

    // Discard draft
    const discardDraft = useCallback(() => {
        localStorage.removeItem(getDraftKey(projectId));
        setFormData({
            title: '',
            content: '',
            chapter_number: chapterCount + 1,
            status: 'draft',
            notes: ''
        });
        setShowDraftBanner(false);
        setLastSaved(null);
        setHasUnsavedChanges(false);
        toast.success('Đã xóa bản nháp');
    }, [projectId, chapterCount]);

    if (loading) {
        return (
            <MainLayout projectId={projectId}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout projectId={projectId}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push(`/project/${projectId}/chapters`)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Thêm chương mới</h1>
                            <p className="text-sm text-gray-500">Chương {formData.chapter_number}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Draft status indicator */}
                        <div className="flex items-center space-x-2">
                            {draftStatus === 'saving' && (
                                <span className="text-xs text-blue-500 flex items-center animate-pulse">
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                    Đang lưu nháp...
                                </span>
                            )}
                            {draftStatus === 'saved' && lastSaved && (
                                <span className="text-xs text-green-500 flex items-center">
                                    <Cloud className="w-3 h-3 mr-1" />
                                    Đã lưu nháp {lastSaved.toLocaleTimeString()}
                                </span>
                            )}
                            {draftStatus === 'error' && (
                                <span className="text-xs text-red-500 flex items-center">
                                    <CloudOff className="w-3 h-3 mr-1" />
                                    Lỗi lưu nháp
                                </span>
                            )}
                            {hasUnsavedChanges && draftStatus === 'idle' && (
                                <span className="text-xs text-amber-500 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Chưa lưu
                                </span>
                            )}
                        </div>
                        <button
                            onClick={saveDraft}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="Lưu nháp ngay"
                        >
                            <Cloud className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'Đang lưu...' : 'Lưu chương'}</span>
                        </button>
                    </div>
                </div>

                {/* Draft recovery banner */}
                {showDraftBanner && (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <RefreshCw className="w-5 h-5 text-amber-600" />
                            <div>
                                <p className="text-sm font-medium text-amber-800">Đã khôi phục bản nháp</p>
                                <p className="text-xs text-amber-600">
                                    {lastSaved ? `Lưu lần cuối: ${lastSaved.toLocaleString()}` : 'Bản nháp trước đó'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={discardDraft}
                            className="px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                            Xóa nháp
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Chapter Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 inline mr-1" />
                                    Tiêu đề chương *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Nhập tiêu đề chương..."
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Hash className="w-4 h-4 inline mr-1" />
                                        Số chương
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.chapter_number}
                                        onChange={(e) => setFormData({ ...formData, chapter_number: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    >
                                        <option value="draft">Nháp</option>
                                        <option value="writing">Đang viết</option>
                                        <option value="completed">Hoàn thành</option>
                                        <option value="published">Đã xuất bản</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rich Text Editor */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                <AlignLeft className="w-4 h-4 inline mr-1" />
                                Nội dung chương
                            </label>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{wordCount.toLocaleString()} từ</span>
                                <span>{charCount.toLocaleString()} ký tự</span>
                            </div>
                        </div>
                        <div className="editor-container">
                            <QuillWithTooltip
                                value={formData.content}
                                onChange={handleContentChange}
                                modules={modules}
                                formats={formats}
                                entities={entities}
                                placeholder="Bắt đầu viết nội dung chương của bạn..."
                                className="h-[500px] mb-12"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú (chỉ bạn thấy)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                            rows={3}
                            placeholder="Ghi chú về chương này..."
                        />
                    </div>
                </div>
            </div>

            {/* Custom styles for Quill */}
            <style jsx global>{`
                .ql-container {
                    font-family: inherit;
                    font-size: 16px;
                    border-bottom-left-radius: 0.75rem;
                    border-bottom-right-radius: 0.75rem;
                }
                .ql-toolbar {
                    border-top-left-radius: 0.75rem;
                    border-top-right-radius: 0.75rem;
                    background: #f9fafb;
                }
                .ql-editor {
                    min-height: 400px;
                    line-height: 1.8;
                }
                .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #9ca3af;
                }
                .ql-snow .ql-picker {
                    color: #374151;
                }
                .ql-snow .ql-stroke {
                    stroke: #374151;
                }
                .ql-snow .ql-fill {
                    fill: #374151;
                }
                .ql-snow.ql-toolbar button:hover,
                .ql-snow .ql-toolbar button:hover,
                .ql-snow.ql-toolbar button:focus,
                .ql-snow .ql-toolbar button:focus,
                .ql-snow.ql-toolbar .ql-picker-label:hover,
                .ql-snow .ql-toolbar .ql-picker-label:hover {
                    color: #6366f1;
                }
                .ql-snow.ql-toolbar button:hover .ql-stroke,
                .ql-snow .ql-toolbar button:hover .ql-stroke,
                .ql-snow.ql-toolbar button:focus .ql-stroke,
                .ql-snow .ql-toolbar button:focus .ql-stroke {
                    stroke: #6366f1;
                }
                .ql-snow.ql-toolbar button.ql-active,
                .ql-snow .ql-toolbar button.ql-active {
                    color: #6366f1;
                }
                .ql-snow.ql-toolbar button.ql-active .ql-stroke,
                .ql-snow .ql-toolbar button.ql-active .ql-stroke {
                    stroke: #6366f1;
                }
            `}</style>
        </MainLayout>
    );
}
