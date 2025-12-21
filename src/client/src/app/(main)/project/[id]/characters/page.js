'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search, Users, Edit, Trash2, X, User } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import ImageUpload from '@/components/ImageUpload';
import api from '@/services/api';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CharactersPage() {
    const { id: projectId } = useParams();
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingChar, setEditingChar] = useState(null);
    const [selectedChar, setSelectedChar] = useState(null);

    useEffect(() => {
        fetchCharacters();
    }, [projectId]);

    const fetchCharacters = async () => {
        try {
            const response = await api.get(`/characters/project/${projectId}`);
            setCharacters(response.data.characters || []);
        } catch (error) {
            toast.error('Không thể tải danh sách nhân vật');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingChar) {
                await api.put(`/characters/${editingChar.id}`, data);
                toast.success('Cập nhật thành công');
            } else {
                await api.post(`/characters/project/${projectId}`, data);
                toast.success('Tạo nhân vật thành công');
            }
            fetchCharacters();
            setShowModal(false);
            setEditingChar(null);
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (charId) => {
        if (!confirm('Bạn có chắc muốn xóa nhân vật này?')) return;
        try {
            await api.delete(`/characters/${charId}`);
            setCharacters(characters.filter(c => c.id !== charId));
            toast.success('Xóa thành công');
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    const getRoleStyle = (role) => {
        const styles = {
            protagonist: 'bg-blue-100 text-blue-700',
            antagonist: 'bg-red-100 text-red-700',
            supporting: 'bg-green-100 text-green-700',
            minor: 'bg-gray-100 text-gray-700'
        };
        return styles[role] || styles.supporting;
    };

    const getRoleText = (role) => {
        const texts = {
            protagonist: 'Nhân vật chính',
            antagonist: 'Phản diện',
            supporting: 'Phụ',
            minor: 'Phụ nhỏ'
        };
        return texts[role] || 'Phụ';
    };

    const filteredChars = characters.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <MainLayout projectId={projectId}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nhân vật</h1>
                    <p className="text-gray-600">Quản lý hệ thống nhân vật trong truyện</p>
                </div>
                <button
                    onClick={() => { setEditingChar(null); setShowModal(true); }}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Thêm nhân vật</span>
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
                        placeholder="Tìm kiếm nhân vật..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Characters Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredChars.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có nhân vật nào</h3>
                    <p className="text-gray-600 mb-4">Bắt đầu xây dựng hệ thống nhân vật</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Thêm nhân vật đầu tiên</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredChars.map((char) => (
                        <div
                            key={char.id}
                            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all cursor-pointer card-hover"
                            onClick={() => setSelectedChar(char)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                                        {char.avatar ? (
                                            <img src={char.avatar.startsWith('http') ? char.avatar : `${API_URL}${char.avatar}`} alt={char.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User className="w-7 h-7 text-primary-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{char.name}</h3>
                                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getRoleStyle(char.role)}`}>
                                            {getRoleText(char.role)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => { setEditingChar(char); setShowModal(true); }}
                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(char.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {char.description && (
                                <p className="text-gray-600 text-sm mt-3 line-clamp-2">{char.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <CharacterModal
                    character={editingChar}
                    onClose={() => { setShowModal(false); setEditingChar(null); }}
                    onSave={handleSave}
                />
            )}

            {/* Detail Modal */}
            {selectedChar && (
                <CharacterDetailModal
                    character={selectedChar}
                    onClose={() => setSelectedChar(null)}
                    onEdit={() => { setEditingChar(selectedChar); setShowModal(true); setSelectedChar(null); }}
                />
            )}
        </MainLayout>
    );
}

function CharacterModal({ character, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: character?.name || '',
        description: character?.description || '',
        appearance: character?.appearance || '',
        personality: character?.personality || '',
        background: character?.background || '',
        skills: character?.skills || '',
        avatar: character?.avatar || '',
        age: character?.age || '',
        gender: character?.gender || '',
        role: character?.role || 'supporting'
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
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {character ? 'Chỉnh sửa nhân vật' : 'Thêm nhân vật mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Avatar Upload */}
                    <div className="flex justify-center">
                        <div className="w-32 h-32">
                            <ImageUpload
                                value={formData.avatar}
                                onChange={(url) => setFormData({ ...formData, avatar: url })}
                                type="characters"
                                aspectRatio="avatar"
                                placeholder="Ảnh nhân vật"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhân vật *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="protagonist">Nhân vật chính</option>
                                <option value="antagonist">Phản diện</option>
                                <option value="supporting">Phụ</option>
                                <option value="minor">Phụ nhỏ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tuổi</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngoại hình</label>
                        <textarea
                            value={formData.appearance}
                            onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tính cách</label>
                        <textarea
                            value={formData.personality}
                            onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lịch sử/Quá khứ</label>
                        <textarea
                            value={formData.background}
                            onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            rows={3}
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

function CharacterDetailModal({ character, onClose, onEdit }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                            {character.avatar ? (
                                <img src={character.avatar.startsWith('http') ? character.avatar : `${API_URL}${character.avatar}`} alt={character.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-primary-500" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{character.name}</h2>
                            <span className="text-sm text-gray-500">{character.gender === 'male' ? 'Nam' : character.gender === 'female' ? 'Nữ' : ''} {character.age && `• ${character.age} tuổi`}</span>
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
                <div className="p-6 space-y-6">
                    {character.description && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Mô tả</h3>
                            <p className="text-gray-700">{character.description}</p>
                        </div>
                    )}
                    {character.appearance && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Ngoại hình</h3>
                            <p className="text-gray-700">{character.appearance}</p>
                        </div>
                    )}
                    {character.personality && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Tính cách</h3>
                            <p className="text-gray-700">{character.personality}</p>
                        </div>
                    )}
                    {character.background && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Lịch sử</h3>
                            <p className="text-gray-700">{character.background}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
