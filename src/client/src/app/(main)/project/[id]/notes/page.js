'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search, StickyNote, Edit, Trash2, X, Lightbulb, FileText, BookOpen, CheckSquare } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function NotesPage() {
    const { id: projectId } = useParams();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, [projectId]);

    const fetchNotes = async () => {
        try {
            const response = await api.get(`/notes/project/${projectId}`);
            setNotes(response.data.notes || []);
        } catch (error) {
            toast.error('Không thể tải danh sách ghi chú');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingNote) {
                await api.put(`/notes/${editingNote.id}`, data);
                toast.success('Cập nhật thành công');
            } else {
                await api.post(`/notes/project/${projectId}`, data);
                toast.success('Tạo ghi chú thành công');
            }
            fetchNotes();
            setShowModal(false);
            setEditingNote(null);
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (noteId) => {
        if (!confirm('Bạn có chắc muốn xóa ghi chú này?')) return;
        try {
            await api.delete(`/notes/${noteId}`);
            setNotes(notes.filter(n => n.id !== noteId));
            toast.success('Xóa thành công');
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    const getTypeIcon = (type) => {
        const icons = { idea: Lightbulb, outline: FileText, research: BookOpen, todo: CheckSquare, other: StickyNote };
        return icons[type] || StickyNote;
    };

    const getTypeStyle = (type) => {
        const styles = {
            idea: 'bg-yellow-100 text-yellow-700',
            outline: 'bg-blue-100 text-blue-700',
            research: 'bg-green-100 text-green-700',
            todo: 'bg-purple-100 text-purple-700',
            other: 'bg-gray-100 text-gray-700'
        };
        return styles[type] || styles.other;
    };

    const getTypeText = (type) => {
        const texts = { idea: 'Ý tưởng', outline: 'Dàn ý', research: 'Nghiên cứu', todo: 'Việc cần làm', other: 'Khác' };
        return texts[type] || 'Khác';
    };

    const filteredNotes = notes
        .filter(n => n.title.toLowerCase().includes(search.toLowerCase()))
        .filter(n => filter === 'all' || n.note_type === filter);

    const noteTypes = [
        { value: 'all', label: 'Tất cả' },
        { value: 'idea', label: 'Ý tưởng' },
        { value: 'outline', label: 'Dàn ý' },
        { value: 'research', label: 'Nghiên cứu' },
        { value: 'todo', label: 'Việc cần làm' },
        { value: 'other', label: 'Khác' }
    ];

    return (
        <MainLayout projectId={projectId}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ghi chú</h1>
                    <p className="text-gray-600">Lưu trữ ý tưởng và ghi chú cho dự án</p>
                </div>
                <button
                    onClick={() => { setEditingNote(null); setShowModal(true); }}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Thêm ghi chú</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm ghi chú..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {noteTypes.map(type => (
                        <button
                            key={type.value}
                            onClick={() => setFilter(type.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                filter === type.value
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <StickyNote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có ghi chú nào</h3>
                    <p className="text-gray-600 mb-4">Bắt đầu ghi lại ý tưởng của bạn</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Thêm ghi chú đầu tiên</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNotes.map((note) => {
                        const TypeIcon = getTypeIcon(note.note_type);
                        return (
                            <div
                                key={note.id}
                                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all cursor-pointer card-hover"
                                onClick={() => setSelectedNote(note)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeStyle(note.note_type)}`}>
                                        <TypeIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => { setEditingNote(note); setShowModal(true); }}
                                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{note.title}</h3>
                                {note.content && (
                                    <p className="text-gray-600 text-sm line-clamp-3">{note.content}</p>
                                )}
                                {note.tags && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {note.tags.split(',').slice(0, 3).map((tag, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <NoteModal
                    note={editingNote}
                    onClose={() => { setShowModal(false); setEditingNote(null); }}
                    onSave={handleSave}
                />
            )}

            {selectedNote && (
                <NoteDetailModal
                    note={selectedNote}
                    onClose={() => setSelectedNote(null)}
                    onEdit={() => { setEditingNote(selectedNote); setShowModal(true); setSelectedNote(null); }}
                />
            )}
        </MainLayout>
    );
}


function NoteModal({ note, onClose, onSave }) {
    const [formData, setFormData] = useState({
        title: note?.title || '',
        content: note?.content || '',
        note_type: note?.note_type || 'idea',
        tags: note?.tags || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {note ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại ghi chú</label>
                        <select
                            value={formData.note_type}
                            onChange={(e) => setFormData({ ...formData, note_type: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="idea">Ý tưởng</option>
                            <option value="outline">Dàn ý</option>
                            <option value="research">Nghiên cứu</option>
                            <option value="todo">Việc cần làm</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={6}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (phân cách bằng dấu phẩy)</label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="VD: nhân vật, cốt truyện, ý tưởng"
                        />
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50">
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function NoteDetailModal({ note, onClose, onEdit }) {
    const getTypeText = (type) => {
        const texts = { idea: 'Ý tưởng', outline: 'Dàn ý', research: 'Nghiên cứu', todo: 'Việc cần làm', other: 'Khác' };
        return texts[type] || 'Khác';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{note.title}</h2>
                        <span className="text-sm text-gray-500">{getTypeText(note.note_type)}</span>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={onEdit} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                            <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    {note.content ? (
                        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    ) : (
                        <p className="text-gray-400 italic">Chưa có nội dung</p>
                    )}
                    {note.tags && (
                        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
                            {note.tags.split(',').map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
