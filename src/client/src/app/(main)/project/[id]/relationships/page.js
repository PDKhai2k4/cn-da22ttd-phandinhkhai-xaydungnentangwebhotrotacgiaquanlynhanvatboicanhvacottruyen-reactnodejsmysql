'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Heart, Edit, Trash2, X, Users, ArrowRight, List, GitBranch, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function RelationshipsPage() {
    const { id: projectId } = useParams();
    const [relationships, setRelationships] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRel, setEditingRel] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'diagram'
    const [selectedChar, setSelectedChar] = useState(null);

    useEffect(() => { fetchData(); }, [projectId]);

    const fetchData = async () => {
        try {
            const [relsRes, charsRes] = await Promise.all([
                api.get(`/relationships/project/${projectId}`),
                api.get(`/characters/project/${projectId}`)
            ]);
            setRelationships(relsRes.data.relationships || []);
            setCharacters(charsRes.data.characters || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingRel) {
                await api.put(`/relationships/${editingRel.id}`, data);
                toast.success('Cập nhật thành công');
            } else {
                await api.post(`/relationships/project/${projectId}`, data);
                toast.success('Tạo mối quan hệ thành công');
            }
            fetchData();
            setShowModal(false);
            setEditingRel(null);
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (relId) => {
        if (!confirm('Bạn có chắc muốn xóa mối quan hệ này?')) return;
        try {
            await api.delete(`/relationships/${relId}`);
            setRelationships(relationships.filter(r => r.id !== relId));
            toast.success('Xóa thành công');
        } catch (error) {
            toast.error('Không thể xóa');
        }
    };

    const getCharName = (id) => characters.find(c => c.id === id)?.name || 'Không xác định';

    return (
        <MainLayout projectId={projectId}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mối quan hệ</h1>
                    <p className="text-gray-600">Quản lý mối quan hệ giữa các nhân vật</p>
                </div>
                <button onClick={() => { setEditingRel(null); setShowModal(true); }} disabled={characters.length < 2} className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <Plus className="w-5 h-5" />
                    <span>Thêm mối quan hệ</span>
                </button>
            </div>

            {characters.length < 2 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <p className="text-amber-700">Cần có ít nhất 2 nhân vật để tạo mối quan hệ. Hãy thêm nhân vật trước.</p>
                </div>
            )}

            {/* View Toggle */}
            <div className="flex justify-end mb-6">
                <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                    <button onClick={() => setViewMode('list')} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <List className="w-4 h-4" />
                        <span>Danh sách</span>
                    </button>
                    <button onClick={() => setViewMode('diagram')} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'diagram' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <GitBranch className="w-4 h-4" />
                        <span>Sơ đồ</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl p-5 animate-pulse"><div className="h-5 bg-gray-200 rounded w-1/2"></div></div>)}
                </div>
            ) : relationships.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có mối quan hệ nào</h3>
                    <p className="text-gray-600 mb-4">Xây dựng mạng lưới quan hệ giữa các nhân vật</p>
                    {characters.length >= 2 && (
                        <button onClick={() => setShowModal(true)} className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
                            <Plus className="w-5 h-5" />
                            <span>Thêm mối quan hệ đầu tiên</span>
                        </button>
                    )}
                </div>
            ) : viewMode === 'list' ? (
                <ListView relationships={relationships} getCharName={getCharName} onEdit={(rel) => { setEditingRel(rel); setShowModal(true); }} onDelete={handleDelete} />
            ) : (
                <DiagramView characters={characters} relationships={relationships} selectedChar={selectedChar} setSelectedChar={setSelectedChar} onEdit={(rel) => { setEditingRel(rel); setShowModal(true); }} />
            )}

            {showModal && <RelationshipModal relationship={editingRel} characters={characters} onClose={() => { setShowModal(false); setEditingRel(null); }} onSave={handleSave} />}
        </MainLayout>
    );
}

// Chế độ xem danh sách
function ListView({ relationships, getCharName, onEdit, onDelete }) {
    return (
        <div className="space-y-3">
            {relationships.map((rel) => (
                <div key={rel.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all card-hover">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-wrap">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="font-medium text-gray-900">{getCharName(rel.character1_id)}</span>
                            </div>
                            <div className="flex items-center space-x-2 px-4 py-1.5 bg-pink-50 rounded-full">
                                <ArrowRight className="w-4 h-4 text-pink-500" />
                                <span className="text-sm font-medium text-pink-700">{rel.relationship_type}</span>
                                <ArrowRight className="w-4 h-4 text-pink-500" />
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-purple-500" />
                                </div>
                                <span className="font-medium text-gray-900">{getCharName(rel.character2_id)}</span>
                            </div>
                        </div>
                        <div className="flex space-x-1">
                            <button onClick={() => onEdit(rel)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => onDelete(rel.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                    {rel.description && <p className="text-gray-600 text-sm mt-3 ml-14">{rel.description}</p>}
                </div>
            ))}
        </div>
    );
}

// Chế độ xem sơ đồ
function DiagramView({ characters, relationships, selectedChar, setSelectedChar, onEdit }) {
    const containerRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // State cho kéo thả node
    const [draggingNode, setDraggingNode] = useState(null);
    const [customPositions, setCustomPositions] = useState({});

    // Tính toán vị trí các node theo hình tròn (vị trí mặc định)
    const defaultPositions = useMemo(() => {
        const positions = {};
        const centerX = 400;
        const centerY = 300;
        const radius = Math.min(250, 80 + characters.length * 20);
        
        characters.forEach((char, index) => {
            const angle = (2 * Math.PI * index) / characters.length - Math.PI / 2;
            positions[char.id] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
        return positions;
    }, [characters]);

    // Kết hợp vị trí mặc định với vị trí custom
    const nodePositions = useMemo(() => {
        const positions = { ...defaultPositions };
        Object.keys(customPositions).forEach(id => {
            if (positions[id]) {
                positions[id] = customPositions[id];
            }
        });
        return positions;
    }, [defaultPositions, customPositions]);

    // Lấy biểu tượng giới tính
    const getGenderIcon = (gender, size = 10) => {
        if (gender === 'male') {
            return (
                <g>
                    <circle cx={0} cy={2} r={size * 0.4} fill="none" stroke="#3b82f6" strokeWidth={size * 0.15} />
                    <line x1={size * 0.28} y1={-size * 0.28 + 2} x2={size * 0.6} y2={-size * 0.6 + 2} stroke="#3b82f6" strokeWidth={size * 0.15} />
                    <line x1={size * 0.3} y1={-size * 0.6 + 2} x2={size * 0.6} y2={-size * 0.6 + 2} stroke="#3b82f6" strokeWidth={size * 0.15} />
                    <line x1={size * 0.6} y1={-size * 0.3 + 2} x2={size * 0.6} y2={-size * 0.6 + 2} stroke="#3b82f6" strokeWidth={size * 0.15} />
                </g>
            );
        } else if (gender === 'female') {
            return (
                <g>
                    <circle cx={0} cy={-size * 0.15} r={size * 0.4} fill="none" stroke="#ec4899" strokeWidth={size * 0.15} />
                    <line x1={0} y1={size * 0.25} x2={0} y2={size * 0.7} stroke="#ec4899" strokeWidth={size * 0.15} />
                    <line x1={-size * 0.25} y1={size * 0.5} x2={size * 0.25} y2={size * 0.5} stroke="#ec4899" strokeWidth={size * 0.15} />
                </g>
            );
        }
        return null;
    };

    // Lấy màu cho loại quan hệ
    const getRelColor = (type) => {
        const colors = {
            'Bạn bè': '#3b82f6', 'Người yêu': '#ec4899', 'Vợ chồng': '#f43f5e',
            'Anh em': '#8b5cf6', 'Chị em': '#a855f7', 'Cha con': '#f59e0b',
            'Mẹ con': '#f97316', 'Thầy trò': '#10b981', 'Đồng nghiệp': '#6366f1',
            'Kẻ thù': '#ef4444', 'Đối thủ': '#dc2626', 'Đồng minh': '#22c55e',
            'Chủ tớ': '#64748b', 'Bạn thân': '#0ea5e9', 'Quen biết': '#94a3b8'
        };
        return colors[type] || '#6b7280';
    };

    // Lọc quan hệ theo nhân vật được chọn
    const filteredRels = selectedChar 
        ? relationships.filter(r => r.character1_id === selectedChar || r.character2_id === selectedChar)
        : relationships;

    // Nhóm các mối quan hệ giữa cùng 2 nhân vật
    const groupedRelationships = useMemo(() => {
        const groups = {};
        filteredRels.forEach(rel => {
            // Tạo key duy nhất cho cặp nhân vật (sắp xếp để đảm bảo A-B và B-A cùng key)
            const ids = [rel.character1_id, rel.character2_id].sort();
            const key = `${ids[0]}-${ids[1]}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(rel);
        });
        return groups;
    }, [filteredRels]);

    // Tính toán đường cong cho mỗi mối quan hệ trong nhóm
    const getPathData = (pos1, pos2, index, total) => {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Tính góc xoay cho label (theo hướng đường nối)
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        // Đảm bảo text luôn đọc được (không bị lộn ngược)
        if (angle > 90) angle -= 180;
        if (angle < -90) angle += 180;
        
        // Nếu chỉ có 1 mối quan hệ, vẽ đường thẳng
        if (total === 1) {
            return {
                path: `M ${pos1.x} ${pos1.y} L ${pos2.x} ${pos2.y}`,
                midX: (pos1.x + pos2.x) / 2,
                midY: (pos1.y + pos2.y) / 2,
                angle
            };
        }
        
        // Tính độ cong dựa trên vị trí trong nhóm
        const curveOffset = 40 + (Math.floor(index / 2) * 30);
        const direction = index % 2 === 0 ? 1 : -1;
        const curvature = curveOffset * direction;
        
        // Tính vector vuông góc với đường nối
        const perpX = -dy / dist;
        const perpY = dx / dist;
        
        // Điểm điều khiển cho đường cong Bezier
        const ctrlX = (pos1.x + pos2.x) / 2 + perpX * curvature;
        const ctrlY = (pos1.y + pos2.y) / 2 + perpY * curvature;
        
        // Tính điểm giữa trên đường cong (t = 0.5 cho quadratic bezier)
        const midX = 0.25 * pos1.x + 0.5 * ctrlX + 0.25 * pos2.x;
        const midY = 0.25 * pos1.y + 0.5 * ctrlY + 0.25 * pos2.y;
        
        // Tính góc tiếp tuyến tại điểm giữa đường cong
        // Đạo hàm của quadratic bezier tại t=0.5: B'(0.5) = (ctrl - pos1) + (pos2 - ctrl) = pos2 - pos1
        // Nhưng với đường cong, ta cần tính tiếp tuyến chính xác hơn
        const tangentX = (pos2.x - pos1.x);
        const tangentY = (pos2.y - pos1.y);
        let curveAngle = Math.atan2(tangentY, tangentX) * 180 / Math.PI;
        if (curveAngle > 90) curveAngle -= 180;
        if (curveAngle < -90) curveAngle += 180;
        
        return {
            path: `M ${pos1.x} ${pos1.y} Q ${ctrlX} ${ctrlY} ${pos2.x} ${pos2.y}`,
            midX,
            midY,
            angle: curveAngle
        };
    };

    // Xử lý kéo canvas
    const handleMouseDown = (e) => {
        if (draggingNode) return;
        if (e.target === containerRef.current || e.target.tagName === 'svg') {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e) => {
        if (draggingNode) {
            const svgRect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - svgRect.left - pan.x) / zoom;
            const y = (e.clientY - svgRect.top - pan.y) / zoom;
            setCustomPositions(prev => ({
                ...prev,
                [draggingNode]: { x, y }
            }));
        } else if (isDragging) {
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDraggingNode(null);
    };

    const handleNodeMouseDown = (e, charId) => {
        e.stopPropagation();
        setDraggingNode(charId);
    };

    const resetPositions = () => {
        setCustomPositions({});
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Lọc theo nhân vật:</span>
                    <select value={selectedChar || ''} onChange={(e) => setSelectedChar(e.target.value || null)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                        <option value="">Tất cả</option>
                        {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={resetPositions} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg" title="Reset vị trí">Reset</button>
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 hover:bg-gray-100 rounded-lg"><ZoomOut className="w-4 h-4" /></button>
                    <span className="text-sm text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 hover:bg-gray-100 rounded-lg"><ZoomIn className="w-4 h-4" /></button>
                    <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-2 hover:bg-gray-100 rounded-lg"><Maximize2 className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Diagram */}
            <div 
                ref={containerRef} 
                className={`h-[600px] overflow-hidden bg-gradient-to-br from-gray-50 to-white ${draggingNode ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown} 
                onMouseMove={handleMouseMove} 
                onMouseUp={handleMouseUp} 
                onMouseLeave={handleMouseUp}
            >
                <svg width="100%" height="100%" style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}>
                    {/* Vẽ các đường nối */}
                    {Object.entries(groupedRelationships).map(([, rels]) => {
                        return rels.map((rel, index) => {
                            const pos1 = nodePositions[rel.character1_id];
                            const pos2 = nodePositions[rel.character2_id];
                            if (!pos1 || !pos2) return null;
                            
                            const { path, midX, midY, angle } = getPathData(pos1, pos2, index, rels.length);
                            const color = getRelColor(rel.relationship_type);
                            
                            // Tính kích thước label dựa trên zoom (nhỏ lại khi phóng to)
                            const labelScale = 1 / zoom;
                            const baseFontSize = 11;
                            const fontSize = baseFontSize * labelScale;
                            const labelHeight = 20 * labelScale;
                            const labelPadding = 12 * labelScale;
                            const labelWidth = Math.max(50 * labelScale, rel.relationship_type.length * 6 * labelScale + labelPadding * 2);
                            
                            return (
                                <g key={rel.id} className="cursor-pointer group">
                                    {/* Đường cong */}
                                    <path 
                                        d={path} 
                                        stroke={color} 
                                        strokeWidth={2 / zoom} 
                                        strokeOpacity="0.6" 
                                        fill="none"
                                        className="group-hover:stroke-opacity-100 transition-all"
                                    />
                                    {/* Label xoay theo đường */}
                                    <g transform={`translate(${midX}, ${midY}) rotate(${angle})`}>
                                        <rect 
                                            x={-labelWidth / 2} 
                                            y={-labelHeight / 2} 
                                            width={labelWidth} 
                                            height={labelHeight} 
                                            rx={labelHeight / 2} 
                                            fill={color} 
                                            className="opacity-90 group-hover:opacity-100 transition-opacity" 
                                            onClick={() => onEdit(rel)} 
                                        />
                                        <text 
                                            x={0} 
                                            y={fontSize * 0.35} 
                                            textAnchor="middle" 
                                            fill="white" 
                                            fontSize={fontSize} 
                                            fontWeight="500" 
                                            className="pointer-events-none"
                                        >
                                            {rel.relationship_type}
                                        </text>
                                    </g>
                                </g>
                            );
                        });
                    })}

                    {/* Vẽ các node nhân vật */}
                    {characters.map(char => {
                        const pos = nodePositions[char.id];
                        if (!pos) return null;
                        const isSelected = selectedChar === char.id;
                        const hasRel = filteredRels.some(r => r.character1_id === char.id || r.character2_id === char.id);
                        const isDraggingThis = draggingNode === char.id;
                        
                        const nodeScale = 1 / zoom;
                        const baseRadius = isSelected ? 38 : 35;
                        const radius = baseRadius * nodeScale;
                        const nodeFontSize = 11 * nodeScale;
                        const strokeWidth = (isSelected ? 3 : 2) * nodeScale;
                        const genderIconSize = 12 * nodeScale;
                        
                        return (
                            <g 
                                key={char.id} 
                                className={`${isDraggingThis ? 'cursor-grabbing' : 'cursor-grab'}`}
                                onMouseDown={(e) => handleNodeMouseDown(e, char.id)}
                                onClick={(e) => {
                                    if (!isDraggingThis) {
                                        e.stopPropagation();
                                        setSelectedChar(isSelected ? null : char.id);
                                    }
                                }}
                            >
                                <circle 
                                    cx={pos.x} 
                                    cy={pos.y} 
                                    r={radius} 
                                    fill={isSelected ? '#6366f1' : hasRel || !selectedChar ? '#fff' : '#f3f4f6'} 
                                    stroke={isSelected ? '#4f46e5' : '#e5e7eb'} 
                                    strokeWidth={strokeWidth} 
                                    className="transition-all" 
                                />
                                <text 
                                    x={pos.x} 
                                    y={pos.y + nodeFontSize * 0.35} 
                                    textAnchor="middle" 
                                    fill={isSelected ? '#fff' : '#374151'} 
                                    fontSize={nodeFontSize} 
                                    fontWeight="600" 
                                    className="pointer-events-none"
                                >
                                    {char.name.length > 8 ? char.name.slice(0, 8) + '...' : char.name}
                                </text>
                                {/* Biểu tượng giới tính */}
                                {char.gender && (
                                    <g transform={`translate(${pos.x + radius * 0.65}, ${pos.y - radius * 0.65})`}>
                                        {getGenderIcon(char.gender, genderIconSize)}
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex flex-wrap gap-3">
                        {['Bạn bè', 'Người yêu', 'Gia đình', 'Kẻ thù', 'Đồng minh'].map(type => (
                            <div key={type} className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRelColor(type) }}></div>
                                <span className="text-xs text-gray-600">{type}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-l border-gray-300 pl-4 flex gap-3">
                        <div className="flex items-center space-x-1">
                            <span className="text-blue-500 text-sm">♂</span>
                            <span className="text-xs text-gray-600">Nam</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="text-pink-500 text-sm">♀</span>
                            <span className="text-xs text-gray-600">Nữ</span>
                        </div>
                    </div>
                    <span className="text-xs text-gray-400 ml-auto">Kéo thả để di chuyển nhân vật</span>
                </div>
            </div>
        </div>
    );
}

function RelationshipModal({ relationship, characters, onClose, onSave }) {
    const [formData, setFormData] = useState({ character1_id: relationship?.character1_id || '', character2_id: relationship?.character2_id || '', relationship_type: relationship?.relationship_type || '', description: relationship?.description || '' });
    const [loading, setLoading] = useState(false);

    const relationshipTypes = ['Bạn bè', 'Người yêu', 'Vợ chồng', 'Anh em', 'Chị em', 'Cha con', 'Mẹ con', 'Thầy trò', 'Đồng nghiệp', 'Kẻ thù', 'Đối thủ', 'Đồng minh', 'Chủ tớ', 'Bạn thân', 'Quen biết'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.character1_id === formData.character2_id) { toast.error('Vui lòng chọn 2 nhân vật khác nhau'); return; }
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{relationship ? 'Chỉnh sửa mối quan hệ' : 'Thêm mối quan hệ mới'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nhân vật 1 *</label>
                            <select value={formData.character1_id} onChange={(e) => setFormData({ ...formData, character1_id: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" required>
                                <option value="">Chọn nhân vật</option>
                                {characters.map(char => <option key={char.id} value={char.id}>{char.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nhân vật 2 *</label>
                            <select value={formData.character2_id} onChange={(e) => setFormData({ ...formData, character2_id: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" required>
                                <option value="">Chọn nhân vật</option>
                                {characters.map(char => <option key={char.id} value={char.id}>{char.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại quan hệ *</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {relationshipTypes.map(type => (
                                <button key={type} type="button" onClick={() => setFormData({ ...formData, relationship_type: type })} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${formData.relationship_type === type ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{type}</button>
                            ))}
                        </div>
                        <input type="text" value={formData.relationship_type} onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Hoặc nhập loại quan hệ khác..." required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none" rows={3} placeholder="Mô tả thêm về mối quan hệ này..." />
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
