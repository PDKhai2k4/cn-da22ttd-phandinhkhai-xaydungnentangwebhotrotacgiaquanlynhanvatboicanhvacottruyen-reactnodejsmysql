'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileText, Clock, Hash, AlignLeft, Trash2, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import QuillWithTooltip from '@/components/QuillWithTooltip';
import api from '@/services/api';
import toast from 'react-hot-toast';

// Draft storage key
const getDraftKey = (chapterId) => `chapter_draft_edit_${chapterId}`;

export default function EditChapterPage() {
    const { id: projectId, chapterId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [lastSaved, setLastSaved] = useState(null);
    const [draftStatus, setDraftStatus] = useState('idle'); // idle, saving, saved, error
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showDraftBanner, setShowDraftBanner] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const initialLoadRef = useRef(true);
    const formDataRef = useRef(null);
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        chapter_number: 1,
        status: 'draft',
        notes: ''
    });

    // Entities for tooltip
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
                        id: c.id, name: c.name, type: 'character', 
                        description: c.description, role: c.role,
                        age: c.age, gender: c.gender, avatar: c.avatar
                    })),
                    ...(locationsRes.data.locations || []).map(l => ({
                        id: l.id, name: l.name, type: 'location', 
                        description: l.description, location_type: l.location_type
                    })),
                    ...(itemsRes.data.items || []).map(i => ({
                        id: i.id, name: i.name, type: 'item', 
                        description: i.description, item_type: i.item_type, rarity: i.rarity
                    }))
                ];
                setEntities(allEntities);
            } catch (error) {
                console.error('Error fetching entities:', error);
            }
        };
        if (projectId) fetchEntities();
    }, [projectId]);

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
        clipboard: { matchVisual: false }
    }), []);

    const formats = [
        'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'script', 'list', 'bullet', 'indent',
        'direction', 'align', 'blockquote', 'code-block', 'link', 'image'
    ];

    // Save draft to localStorage
    const saveDraft = useCallback(() => {
        const currentData = formDataRef.current;
        if (!currentData) return;
        
        try {
            setDraftStatus('saving');
            const draftData = {
                ...currentData,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(getDraftKey(chapterId), JSON.stringify(draftData));
            setLastSaved(new Date());
            setDraftStatus('saved');
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Auto-save failed:', error);
            setDraftStatus('error');
        }
    }, [chapterId]);

    // Clear draft
    const clearDraft = useCallback(() => {
        localStorage.removeItem(getDraftKey(chapterId));
        setShowDraftBanner(false);
        setHasUnsavedChanges(false);
    }, [chapterId]);

    // Discard draft and reload original
    const discardDraft = useCallback(() => {
        localStorage.removeItem(getDraftKey(chapterId));
        if (originalData) {
            setFormData(originalData);
        }
        setShowDraftBanner(false);
        setLastSaved(null);
        setHasUnsavedChanges(false);
        toast.success('Đã khôi phục về bản gốc');
    }, [chapterId, originalData]);

    useEffect(() => { fetchChapter(); }, [chapterId]);

    const fetchChapter = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/chapters/${chapterId}`);
            const chapter = response.data.chapter;
            const serverData = {
                title: chapter.title || '',
                content: chapter.content || '',
                chapter_number: chapter.chapter_number || 1,
                status: chapter.status || 'draft',
                notes: chapter.notes || ''
            };
            
            setOriginalData(serverData);
            
            // Check for saved draft
            const savedDraft = localStorage.getItem(getDraftKey(chapterId));
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    // So sánh draft với server data
                    const isDifferent = draft.title !== serverData.title || 
                                       draft.content !== serverData.content ||
                                       draft.notes !== serverData.notes;
                    
                    if (isDifferent && (draft.title || draft.content)) {
                        setShowDraftBanner(true);
                        setFormData(draft);
                        if (draft.savedAt) {
                            setLastSaved(new Date(draft.savedAt));
                        }
                        initialLoadRef.current = false;
                        return;
                    }
                } catch (e) {
                    console.error('Error loading draft:', e);
                }
            }
            
            setFormData(serverData);
            initialLoadRef.current = false;
        } catch (error) {
            toast.error('Không thể tải thông tin chương');
            router.push(`/project/${projectId}/chapters`);
        } finally {
            setLoading(false);
        }
    };

    // Auto-save every 30 seconds when there are changes
    useEffect(() => {
        if (!hasUnsavedChanges || initialLoadRef.current) return;
        
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
        }, 5000);
        
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

    const getWordCount = useCallback((html) => {
        if (!html) return 0;
        const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return text ? text.split(' ').filter(word => word.length > 0).length : 0;
    }, []);

    const getCharCount = useCallback((html) => {
        if (!html) return 0;
        return html.replace(/<[^>]*>/g, '').length;
    }, []);

    const wordCount = getWordCount(formData.content);
    const charCount = getCharCount(formData.content);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề chương');
            return;
        }
        setSaving(true);
        try {
            await api.put(`/chapters/${chapterId}`, { ...formData, word_count: wordCount });
            clearDraft(); // Xóa draft sau khi lưu thành công
            setOriginalData(formData); // Cập nhật original data
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
            toast.success('Cập nhật chương thành công!');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc muốn xóa chương này?')) return;
        try {
            await api.delete(`/chapters/${chapterId}`);
            toast.success('Xóa chương thành công');
            router.push(`/project/${projectId}/chapters`);
        } catch (error) {
            toast.error('Không thể xóa chương');
        }
    };

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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => router.push(`/project/${projectId}/chapters`)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa chương</h1>
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
                        <button onClick={saveDraft} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600" title="Lưu nháp ngay">
                            <Cloud className="w-5 h-5" />
                        </button>
                        <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50">
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
                                <p className="text-sm font-medium text-amber-800">Đã khôi phục bản nháp chưa lưu</p>
                                <p className="text-xs text-amber-600">
                                    {lastSaved ? `Lưu lần cuối: ${lastSaved.toLocaleString()}` : 'Có thay đổi chưa được lưu lên server'}
                                </p>
                            </div>
                        </div>
                        <button onClick={discardDraft} className="px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100 rounded-lg transition-colors">
                            Khôi phục bản gốc
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 inline mr-1" />Tiêu đề chương *
                                </label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="Nhập tiêu đề chương..." required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2"><Hash className="w-4 h-4 inline mr-1" />Số chương</label>
                                    <input type="number" value={formData.chapter_number} onChange={(e) => setFormData({ ...formData, chapter_number: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" min="1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none">
                                        <option value="draft">Nháp</option>
                                        <option value="writing">Đang viết</option>
                                        <option value="completed">Hoàn thành</option>
                                        <option value="published">Đã xuất bản</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700"><AlignLeft className="w-4 h-4 inline mr-1" />Nội dung chương</label>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{wordCount.toLocaleString()} từ</span>
                                <span>{charCount.toLocaleString()} ký tự</span>
                            </div>
                        </div>
                        <QuillWithTooltip 
                            value={formData.content} 
                            onChange={(content) => setFormData(prev => ({ ...prev, content }))} 
                            modules={modules} 
                            formats={formats} 
                            entities={entities}
                            placeholder="Bắt đầu viết nội dung chương..." 
                            className="h-[500px] mb-12" 
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (chỉ bạn thấy)</label>
                        <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none" rows={3} placeholder="Ghi chú về chương này..." />
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .ql-container { font-family: inherit; font-size: 16px; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; }
                .ql-toolbar { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; background: #f9fafb; }
                .ql-editor { min-height: 400px; line-height: 1.8; }
                .ql-editor.ql-blank::before { font-style: normal; color: #9ca3af; }
            `}</style>
        </MainLayout>
    );
}
