'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search, Package, Edit, Trash2, X, Sparkles, Sword, Wrench, Wand2, Cpu, Lightbulb, Box, Filter } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import ImageUpload from '@/components/ImageUpload';
import api from '@/services/api';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ItemsPage() {
    const { id: projectId } = useParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [filterRarity, setFilterRarity] = useState('all');

    useEffect(() => {
        fetchItems();
    }, [projectId]);

    const fetchItems = async () => {
        try {
            const response = await api.get(`/items/project/${projectId}`);
            setItems(response.data.items || []);
        } catch (error) {
            toast.error('Không thể tải danh sách vật phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingItem) {
                await api.put(`/items/${editingItem.id}`, data);
                toast.success('Cập nhật thành công');
            } else {
                await api.post(`/items/project/${projectId}`, data);
                toast.success('Tạo vật phẩm thành công');
            }
            fetchItems();
            setShowModal(false);
            setEditingItem(null);
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (itemId) => {
        if (!confirm('Bạn có chắc muốn xóa vật phẩm này?')) return;
        try {
            await api.delete(`/items/${itemId}`);
            setItems(items.filter(i => i.id !== itemId));
            toast.success('Xóa thành công');
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    const getRarityStyle = (rarity) => {
        const styles = {
            common: 'bg-gray-100 text-gray-700 border-gray-300',
            uncommon: 'bg-green-100 text-green-700 border-green-300',
            rare: 'bg-blue-100 text-blue-700 border-blue-300',
            legendary: 'bg-amber-100 text-amber-700 border-amber-300'
        };
        return styles[rarity] || styles.common;
    };

    const getRarityText = (rarity) => {
        const texts = { common: 'Thường', uncommon: 'Không phổ biến', rare: 'Hiếm', legendary: 'Huyền thoại' };
        return texts[rarity] || 'Thường';
    };

    const getTypeText = (type) => {
        const texts = { weapon: 'Vũ khí', tool: 'Công cụ', magic: 'Phép thuật', technology: 'Công nghệ', concept: 'Khái niệm', other: 'Khác' };
        return texts[type] || 'Khác';
    };

    const getTypeIcon = (type) => {
        const icons = { weapon: Sword, tool: Wrench, magic: Wand2, technology: Cpu, concept: Lightbulb, other: Box };
        return icons[type] || Box;
    };

    const itemTypes = [
        { value: 'all', label: 'Tất cả', icon: Package },
        { value: 'weapon', label: 'Vũ khí', icon: Sword },
        { value: 'tool', label: 'Công cụ', icon: Wrench },
        { value: 'magic', label: 'Phép thuật', icon: Wand2 },
        { value: 'technology', label: 'Công nghệ', icon: Cpu },
        { value: 'concept', label: 'Khái niệm', icon: Lightbulb },
        { value: 'other', label: 'Khác', icon: Box }
    ];

    const rarityTypes = [
        { value: 'all', label: 'Tất cả' },
        { value: 'common', label: 'Thường' },
        { value: 'uncommon', label: 'Không phổ biến' },
        { value: 'rare', label: 'Hiếm' },
        { value: 'legendary', label: 'Huyền thoại' }
    ];

    // Đếm số lượng theo loại
    const typeCounts = useMemo(() => {
        const counts = { all: items.length };
        items.forEach(item => {
            counts[item.item_type] = (counts[item.item_type] || 0) + 1;
        });
        return counts;
    }, [items]);

    const filteredItems = items.filter(i => {
        const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || i.item_type === filterType;
        const matchRarity = filterRarity === 'all' || i.rarity === filterRarity;
        return matchSearch && matchType && matchRarity;
    });

    return (
        <MainLayout projectId={projectId}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vật phẩm</h1>
                    <p className="text-gray-600">Quản lý vật phẩm và khái niệm trong truyện</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setShowModal(true); }}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Thêm vật phẩm</span>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm vật phẩm..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none">
                            {rarityTypes.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Quick Filter by Type */}
                <div className="flex flex-wrap gap-2">
                    {itemTypes.map(type => {
                        const Icon = type.icon;
                        const count = typeCounts[type.value] || 0;
                        const isActive = filterType === type.value;
                        return (
                            <button key={type.value} onClick={() => setFilterType(type.value)} className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${isActive ? 'bg-primary-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'}`}>
                                <Icon className="w-4 h-4" />
                                <span>{type.label}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                            <div className="h-24 bg-gray-200 rounded-lg mb-3"></div>
                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có vật phẩm nào</h3>
                    <p className="text-gray-600 mb-4">Bắt đầu tạo hệ thống vật phẩm</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Thêm vật phẩm đầu tiên</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => {
                        const TypeIcon = getTypeIcon(item.item_type);
                        const bgColors = { weapon: 'from-red-100 to-rose-100', tool: 'from-blue-100 to-cyan-100', magic: 'from-purple-100 to-violet-100', technology: 'from-emerald-100 to-teal-100', concept: 'from-yellow-100 to-amber-100', other: 'from-gray-100 to-slate-100' };
                        const iconColors = { weapon: 'text-red-400', tool: 'text-blue-400', magic: 'text-purple-400', technology: 'text-emerald-400', concept: 'text-yellow-500', other: 'text-gray-400' };
                        return (
                            <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer card-hover" onClick={() => setSelectedItem(item)}>
                                <div className={`h-24 bg-gradient-to-br ${bgColors[item.item_type] || bgColors.other} flex items-center justify-center relative overflow-hidden`}>
                                    {item.image ? (
                                        <img src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <TypeIcon className={`w-10 h-10 ${iconColors[item.item_type] || iconColors.other}`} />
                                    )}
                                    {item.rarity === 'legendary' && <Sparkles className="absolute top-2 right-2 w-5 h-5 text-amber-500" />}
                                    {item.rarity === 'rare' && <Sparkles className="absolute top-2 right-2 w-4 h-4 text-blue-400" />}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-xs text-gray-500">{getTypeText(item.item_type)}</span>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRarityStyle(item.rarity)}`}>{getRarityText(item.rarity)}</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    {item.description && <p className="text-gray-600 text-sm mt-2 line-clamp-2">{item.description}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <ItemModal
                    item={editingItem}
                    onClose={() => { setShowModal(false); setEditingItem(null); }}
                    onSave={handleSave}
                />
            )}

            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onEdit={() => { setEditingItem(selectedItem); setShowModal(true); setSelectedItem(null); }}
                />
            )}
        </MainLayout>
    );
}


function ItemModal({ item, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        description: item?.description || '',
        properties: item?.properties || '',
        item_type: item?.item_type || 'other',
        rarity: item?.rarity || 'common',
        image: item?.image || ''
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
                        {item ? 'Chỉnh sửa vật phẩm' : 'Thêm vật phẩm mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                        <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} type="items" aspectRatio="square" placeholder="Ảnh vật phẩm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên vật phẩm *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại</label>
                            <select
                                value={formData.item_type}
                                onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="weapon">Vũ khí</option>
                                <option value="tool">Công cụ</option>
                                <option value="magic">Phép thuật</option>
                                <option value="technology">Công nghệ</option>
                                <option value="concept">Khái niệm</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Độ hiếm</label>
                            <select
                                value={formData.rarity}
                                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="common">Thường</option>
                                <option value="uncommon">Không phổ biến</option>
                                <option value="rare">Hiếm</option>
                                <option value="legendary">Huyền thoại</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thuộc tính/Đặc điểm</label>
                        <textarea
                            value={formData.properties}
                            onChange={(e) => setFormData({ ...formData, properties: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={3}
                            placeholder="Các thuộc tính đặc biệt của vật phẩm..."
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

function ItemDetailModal({ item, onClose, onEdit }) {
    const getRarityStyle = (rarity) => {
        const styles = { common: 'bg-gray-100 text-gray-700', uncommon: 'bg-green-100 text-green-700', rare: 'bg-blue-100 text-blue-700', legendary: 'bg-amber-100 text-amber-700' };
        return styles[rarity] || styles.common;
    };
    const getRarityText = (rarity) => {
        const texts = { common: 'Thường', uncommon: 'Không phổ biến', rare: 'Hiếm', legendary: 'Huyền thoại' };
        return texts[rarity] || 'Thường';
    };
    const getTypeText = (type) => {
        const texts = { weapon: 'Vũ khí', tool: 'Công cụ', magic: 'Phép thuật', technology: 'Công nghệ', concept: 'Khái niệm', other: 'Khác' };
        return texts[type] || 'Khác';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                <div className="h-32 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative overflow-hidden">
                    {item.image ? (
                        <img src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <Package className="w-14 h-14 text-orange-400" />
                    )}
                    {item.rarity === 'legendary' && <Sparkles className="absolute top-3 right-3 w-6 h-6 text-amber-500" />}
                </div>
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-500">{getTypeText(item.item_type)}</span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRarityStyle(item.rarity)}`}>
                                    {getRarityText(item.rarity)}
                                </span>
                            </div>
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
                    <div className="space-y-4">
                        {item.description && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Mô tả</h3>
                                <p className="text-gray-700">{item.description}</p>
                            </div>
                        )}
                        {item.properties && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Thuộc tính</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{item.properties}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
