'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search, MapPin, Edit, Trash2, X, ChevronRight, ChevronDown, List, FolderTree, Folder, FolderOpen } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import ImageUpload from '@/components/ImageUpload';
import api from '@/services/api';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LocationsPage() {
    const { id: projectId } = useParams();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingLoc, setEditingLoc] = useState(null);
    const [selectedLoc, setSelectedLoc] = useState(null);
    const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'list'
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    useEffect(() => { fetchLocations(); }, [projectId]);

    const fetchLocations = async () => {
        try {
            const response = await api.get(`/locations/project/${projectId}`);
            setLocations(response.data.locations || []);
            // Mở rộng tất cả nodes mặc định
            const allIds = new Set((response.data.locations || []).map(l => l.id));
            setExpandedNodes(allIds);
        } catch (error) {
            toast.error('Không thể tải danh sách địa điểm');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingLoc) {
                await api.put(`/locations/${editingLoc.id}`, data);
                toast.success('Cập nhật thành công');
            } else {
                await api.post(`/locations/project/${projectId}`, data);
                toast.success('Tạo địa điểm thành công');
            }
            fetchLocations();
            setShowModal(false);
            setEditingLoc(null);
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (locId) => {
        if (!confirm('Bạn có chắc muốn xóa địa điểm này?')) return;
        try {
            await api.delete(`/locations/${locId}`);
            setLocations(locations.filter(l => l.id !== locId));
            toast.success('Xóa thành công');
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    const getTypeText = (type) => {
        const texts = { world: 'Thế giới', continent: 'Lục địa', country: 'Quốc gia', city: 'Thành phố', building: 'Tòa nhà', room: 'Phòng', other: 'Khác' };
        return texts[type] || 'Khác';
    };

    const getTypeIcon = (type) => {
        const colors = { world: 'text-purple-500', continent: 'text-blue-500', country: 'text-green-500', city: 'text-orange-500', building: 'text-red-500', room: 'text-pink-500', other: 'text-gray-500' };
        return colors[type] || 'text-gray-500';
    };

    // Xây dựng cây địa điểm
    const locationTree = useMemo(() => {
        const map = new Map();
        const roots = [];
        
        locations.forEach(loc => map.set(loc.id, { ...loc, children: [] }));
        
        locations.forEach(loc => {
            const node = map.get(loc.id);
            if (loc.parent_id && map.has(loc.parent_id)) {
                map.get(loc.parent_id).children.push(node);
            } else {
                roots.push(node);
            }
        });
        
        return roots;
    }, [locations]);

    const toggleNode = (id) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const filteredLocs = locations.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <MainLayout projectId={projectId}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Địa điểm</h1>
                    <p className="text-gray-600">Quản lý bối cảnh và địa điểm trong truyện</p>
                </div>
                <button onClick={() => { setEditingLoc(null); setShowModal(true); }} className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                    <Plus className="w-5 h-5" />
                    <span>Thêm địa điểm</span>
                </button>
            </div>

            {/* Search & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm địa điểm..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                </div>
                <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                    <button onClick={() => setViewMode('tree')} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'tree' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <FolderTree className="w-4 h-4" />
                        <span>Cây thư mục</span>
                    </button>
                    <button onClick={() => setViewMode('list')} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <List className="w-4 h-4" />
                        <span>Danh sách</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl p-8 animate-pulse">
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-200 rounded w-full"></div>)}
                    </div>
                </div>
            ) : filteredLocs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có địa điểm nào</h3>
                    <p className="text-gray-600 mb-4">Bắt đầu xây dựng thế giới của bạn</p>
                    <button onClick={() => setShowModal(true)} className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
                        <Plus className="w-5 h-5" />
                        <span>Thêm địa điểm đầu tiên</span>
                    </button>
                </div>
            ) : viewMode === 'tree' ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <TreeView nodes={search ? filteredLocs.map(l => ({ ...l, children: [] })) : locationTree} expandedNodes={expandedNodes} toggleNode={toggleNode} onSelect={setSelectedLoc} onEdit={(loc) => { setEditingLoc(loc); setShowModal(true); }} onDelete={handleDelete} getTypeText={getTypeText} getTypeIcon={getTypeIcon} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLocs.map((loc) => (
                        <div key={loc.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer card-hover" onClick={() => setSelectedLoc(loc)}>
                            <div className="h-32 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                                {loc.image ? (
                                    <img src={loc.image.startsWith('http') ? loc.image : `${API_URL}${loc.image}`} alt={loc.name} className="w-full h-full object-cover" />
                                ) : (
                                    <MapPin className={`w-12 h-12 ${getTypeIcon(loc.location_type)}`} />
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{loc.name}</h3>
                                        <span className="text-xs text-gray-500">{getTypeText(loc.location_type)}</span>
                                    </div>
                                    <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => { setEditingLoc(loc); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(loc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                {loc.description && <p className="text-gray-600 text-sm mt-2 line-clamp-2">{loc.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && <LocationModal location={editingLoc} locations={locations} onClose={() => { setShowModal(false); setEditingLoc(null); }} onSave={handleSave} />}
            {selectedLoc && <LocationDetailModal location={selectedLoc} locations={locations} onClose={() => setSelectedLoc(null)} onEdit={() => { setEditingLoc(selectedLoc); setShowModal(true); setSelectedLoc(null); }} />}
        </MainLayout>
    );
}

// Component hiển thị cây thư mục
function TreeView({ nodes, expandedNodes, toggleNode, onSelect, onEdit, onDelete, getTypeText, getTypeIcon, level = 0 }) {
    return (
        <div className={level > 0 ? 'ml-6 border-l border-gray-200 pl-2' : ''}>
            {nodes.map(node => (
                <div key={node.id}>
                    <div className="flex items-center group py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                        {node.children?.length > 0 ? (
                            <button onClick={() => toggleNode(node.id)} className="p-1 hover:bg-gray-200 rounded mr-1">
                                {expandedNodes.has(node.id) ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                            </button>
                        ) : <span className="w-6" />}
                        
                        <div className="flex items-center flex-1 cursor-pointer" onClick={() => onSelect(node)}>
                            {expandedNodes.has(node.id) && node.children?.length > 0 ? (
                                <FolderOpen className={`w-5 h-5 mr-2 ${getTypeIcon(node.location_type)}`} />
                            ) : node.children?.length > 0 ? (
                                <Folder className={`w-5 h-5 mr-2 ${getTypeIcon(node.location_type)}`} />
                            ) : (
                                <MapPin className={`w-5 h-5 mr-2 ${getTypeIcon(node.location_type)}`} />
                            )}
                            <span className="font-medium text-gray-900">{node.name}</span>
                            <span className="ml-2 text-xs text-gray-400">{getTypeText(node.location_type)}</span>
                        </div>
                        
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(node); }} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                    
                    {expandedNodes.has(node.id) && node.children?.length > 0 && (
                        <TreeView nodes={node.children} expandedNodes={expandedNodes} toggleNode={toggleNode} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} getTypeText={getTypeText} getTypeIcon={getTypeIcon} level={level + 1} />
                    )}
                </div>
            ))}
        </div>
    );
}

function LocationModal({ location, locations, onClose, onSave }) {
    const [formData, setFormData] = useState({ name: location?.name || '', description: location?.description || '', history: location?.history || '', location_type: location?.location_type || 'city', parent_id: location?.parent_id || '', image: location?.image || '' });
    const [loading, setLoading] = useState(false);

    // Định nghĩa thứ tự phân cấp địa điểm (số nhỏ hơn = cấp cao hơn)
    const typeHierarchy = {
        world: 1,
        continent: 2,
        country: 3,
        city: 4,
        building: 5,
        room: 6,
        other: 7
    };

    const getTypeText = (type) => {
        const texts = { world: 'Thế giới', continent: 'Lục địa', country: 'Quốc gia', city: 'Thành phố', building: 'Tòa nhà', room: 'Phòng', other: 'Khác' };
        return texts[type] || 'Khác';
    };

    // Lọc danh sách parent: chỉ hiển thị địa điểm có cấp cao hơn (số hierarchy nhỏ hơn)
    const parentOptions = useMemo(() => {
        const currentTypeLevel = typeHierarchy[formData.location_type] || 7;
        
        return locations.filter(l => {
            // Không cho phép chọn chính nó làm parent
            if (l.id === location?.id) return false;
            
            // Chỉ cho phép chọn địa điểm có cấp cao hơn
            const parentTypeLevel = typeHierarchy[l.location_type] || 7;
            return parentTypeLevel < currentTypeLevel;
        });
    }, [locations, formData.location_type, location?.id]);

    // Reset parent_id khi đổi loại địa điểm nếu parent hiện tại không còn hợp lệ
    useEffect(() => {
        if (formData.parent_id) {
            const isValidParent = parentOptions.some(p => p.id.toString() === formData.parent_id.toString());
            if (!isValidParent) {
                setFormData(prev => ({ ...prev, parent_id: '' }));
            }
        }
    }, [formData.location_type, parentOptions]);

    const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); await onSave({ ...formData, parent_id: formData.parent_id || null }); setLoading(false); };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{location ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm mới'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                        <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} type="locations" aspectRatio="cover" placeholder="Ảnh địa điểm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên địa điểm *</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại địa điểm</label>
                            <select value={formData.location_type} onChange={(e) => setFormData({ ...formData, location_type: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none">
                                <option value="world">Thế giới</option>
                                <option value="continent">Lục địa</option>
                                <option value="country">Quốc gia</option>
                                <option value="city">Thành phố</option>
                                <option value="building">Tòa nhà</option>
                                <option value="room">Phòng</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thuộc về</label>
                            <select value={formData.parent_id} onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none">
                                <option value="">Không có</option>
                                {parentOptions.map(p => <option key={p.id} value={p.id}>{p.name} ({getTypeText(p.location_type)})</option>)}
                            </select>
                            {parentOptions.length === 0 && formData.location_type !== 'world' && (
                                <p className="text-xs text-amber-600 mt-1">Không có địa điểm cấp cao hơn. Hãy tạo {formData.location_type === 'continent' ? 'Thế giới' : formData.location_type === 'country' ? 'Lục địa/Thế giới' : 'địa điểm cấp cao hơn'} trước.</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none" rows={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lịch sử</label>
                        <textarea value={formData.history} onChange={(e) => setFormData({ ...formData, history: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none" rows={3} />
                    </div>
                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">Hủy</button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50">{loading ? 'Đang lưu...' : 'Lưu'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function LocationDetailModal({ location, locations, onClose, onEdit }) {
    const getTypeText = (type) => { const texts = { world: 'Thế giới', continent: 'Lục địa', country: 'Quốc gia', city: 'Thành phố', building: 'Tòa nhà', room: 'Phòng', other: 'Khác' }; return texts[type] || 'Khác'; };
    const parent = locations.find(l => l.id === location.parent_id);
    const children = locations.filter(l => l.parent_id === location.id);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                <div className="h-40 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                    {location.image ? (
                        <img src={location.image.startsWith('http') ? location.image : `${API_URL}${location.image}`} alt={location.name} className="w-full h-full object-cover" />
                    ) : (
                        <MapPin className="w-16 h-16 text-green-400" />
                    )}
                </div>
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{location.name}</h2>
                            <span className="text-sm text-gray-500">{getTypeText(location.location_type)}</span>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={onEdit} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"><Edit className="w-5 h-5" /></button>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {parent && <div><h3 className="text-sm font-medium text-gray-500 mb-1">Thuộc về</h3><p className="text-gray-700">{parent.name}</p></div>}
                        {children.length > 0 && <div><h3 className="text-sm font-medium text-gray-500 mb-1">Địa điểm con ({children.length})</h3><div className="flex flex-wrap gap-2">{children.map(c => <span key={c.id} className="px-2 py-1 bg-gray-100 rounded-lg text-sm text-gray-700">{c.name}</span>)}</div></div>}
                        {location.description && <div><h3 className="text-sm font-medium text-gray-500 mb-1">Mô tả</h3><p className="text-gray-700">{location.description}</p></div>}
                        {location.history && <div><h3 className="text-sm font-medium text-gray-500 mb-1">Lịch sử</h3><p className="text-gray-700">{location.history}</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
