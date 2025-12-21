'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search, Clock, Edit, Trash2, X, GripVertical } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function TimelinePage() {
    const { id: projectId } = useParams();
    const [events, setEvents] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    
    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);
    const dragNode = useRef(null);

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const fetchData = async () => {
        try {
            const [eventsRes, locsRes] = await Promise.all([
                api.get(`/timeline/project/${projectId}`),
                api.get(`/locations/project/${projectId}`).catch(() => ({ data: { locations: [] } }))
            ]);
            setEvents(eventsRes.data.events || []);
            setLocations(locsRes.data.locations || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingEvent) {
                await api.put(`/timeline/${editingEvent.id}`, data);
                toast.success('Cập nhật thành công');
            } else {
                // Tự động gán thứ tự cuối cùng cho sự kiện mới
                const newOrder = events.length > 0 ? Math.max(...events.map(e => e.event_order)) + 1 : 0;
                await api.post(`/timeline/project/${projectId}`, { ...data, event_order: newOrder });
                toast.success('Tạo sự kiện thành công');
            }
            fetchData();
            setShowModal(false);
            setEditingEvent(null);
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (eventId) => {
        if (!confirm('Bạn có chắc muốn xóa sự kiện này?')) return;
        try {
            await api.delete(`/timeline/${eventId}`);
            setEvents(events.filter(e => e.id !== eventId));
            toast.success('Xóa thành công');
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    // Drag and drop handlers
    const handleDragStart = (e, index) => {
        dragNode.current = e.target;
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
        // Thêm class sau một chút để tránh ảnh hưởng đến drag image
        setTimeout(() => {
            if (dragNode.current) {
                dragNode.current.classList.add('opacity-50');
            }
        }, 0);
    };

    const handleDragEnter = (e, index) => {
        if (draggedItem === null || draggedItem === index) return;
        setDragOverItem(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnd = async () => {
        if (dragNode.current) {
            dragNode.current.classList.remove('opacity-50');
        }
        
        if (draggedItem !== null && dragOverItem !== null && draggedItem !== dragOverItem) {
            // Reorder locally first for instant feedback
            const sortedEvents = [...events].sort((a, b) => a.event_order - b.event_order);
            const newEvents = [...sortedEvents];
            const [draggedEvent] = newEvents.splice(draggedItem, 1);
            newEvents.splice(dragOverItem, 0, draggedEvent);
            
            // Update local state
            const reorderedEvents = newEvents.map((event, idx) => ({ ...event, event_order: idx }));
            setEvents(reorderedEvents);
            
            // Save to server
            try {
                const orderedIds = newEvents.map(e => e.id);
                await api.post(`/timeline/project/${projectId}/reorder`, { orderedIds });
                toast.success('Đã sắp xếp lại');
            } catch (error) {
                toast.error('Không thể lưu thứ tự');
                fetchData(); // Revert on error
            }
        }
        
        setDraggedItem(null);
        setDragOverItem(null);
        dragNode.current = null;
    };

    const getImportanceStyle = (imp) => {
        const styles = {
            low: 'bg-gray-100 text-gray-700 border-gray-300',
            medium: 'bg-blue-100 text-blue-700 border-blue-300',
            high: 'bg-orange-100 text-orange-700 border-orange-300',
            critical: 'bg-red-100 text-red-700 border-red-300'
        };
        return styles[imp] || styles.medium;
    };

    const getImportanceText = (imp) => {
        const texts = { low: 'Thấp', medium: 'Trung bình', high: 'Cao', critical: 'Quan trọng' };
        return texts[imp] || 'Trung bình';
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => a.event_order - b.event_order);

    const canDrag = !search; // Chỉ cho phép kéo thả khi không đang tìm kiếm

    return (
        <MainLayout projectId={projectId}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
                    <p className="text-gray-600">Quản lý dòng thời gian và sự kiện</p>
                </div>
                <button
                    onClick={() => { setEditingEvent(null); setShowModal(true); }}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Thêm sự kiện</span>
                </button>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm sự kiện..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
                {canDrag && events.length > 1 && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        <GripVertical className="w-4 h-4" />
                        Kéo thả để sắp xếp
                    </p>
                )}
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
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có sự kiện nào</h3>
                    <p className="text-gray-600 mb-4">Bắt đầu xây dựng dòng thời gian</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Thêm sự kiện đầu tiên</span>
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-4">
                        {filteredEvents.map((event, index) => (
                            <div 
                                key={event.id} 
                                className={`relative pl-16 ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''} ${dragOverItem === index ? 'border-t-2 border-primary-500' : ''}`}
                                draggable={canDrag}
                                onDragStart={(e) => canDrag && handleDragStart(e, index)}
                                onDragEnter={(e) => canDrag && handleDragEnter(e, index)}
                                onDragOver={handleDragOver}
                                onDragEnd={handleDragEnd}
                            >
                                <div className={`absolute left-6 w-4 h-4 rounded-full border-2 ${getImportanceStyle(event.importance)} bg-white`}></div>
                                <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all card-hover">
                                    <div className="flex items-start justify-between">
                                        {canDrag && (
                                            <div className="mr-3 text-gray-300 hover:text-gray-500 cursor-grab">
                                                <GripVertical className="w-5 h-5" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getImportanceStyle(event.importance)}`}>
                                                    {getImportanceText(event.importance)}
                                                </span>
                                            </div>
                                            {event.event_date && (
                                                <p className="text-sm text-primary-600 mb-2">{event.event_date}</p>
                                            )}
                                            {event.description && (
                                                <p className="text-gray-600 text-sm">{event.description}</p>
                                            )}
                                        </div>
                                        <div className="flex space-x-1 ml-4">
                                            <button
                                                onClick={() => { setEditingEvent(event); setShowModal(true); }}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showModal && (
                <TimelineModal
                    event={editingEvent}
                    locations={locations}
                    onClose={() => { setShowModal(false); setEditingEvent(null); }}
                    onSave={handleSave}
                />
            )}
        </MainLayout>
    );
}


function TimelineModal({ event, locations, onClose, onSave }) {
    const [formData, setFormData] = useState({
        title: event?.title || '',
        description: event?.description || '',
        event_date: event?.event_date || '',
        location_id: event?.location_id || '',
        importance: event?.importance || 'medium',
        event_type: event?.event_type || 'plot'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave({ ...formData, location_id: formData.location_id || null });
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {event ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian</label>
                        <input
                            type="text"
                            value={formData.event_date}
                            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="VD: Năm 1000, Mùa xuân..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ quan trọng</label>
                            <select
                                value={formData.importance}
                                onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="low">Thấp</option>
                                <option value="medium">Trung bình</option>
                                <option value="high">Cao</option>
                                <option value="critical">Quan trọng</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại sự kiện</label>
                            <select
                                value={formData.event_type}
                                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="plot">Cốt truyện</option>
                                <option value="character">Nhân vật</option>
                                <option value="world">Thế giới</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                    </div>
                    {locations.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
                            <select
                                value={formData.location_id}
                                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="">Chọn địa điểm</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={4}
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
