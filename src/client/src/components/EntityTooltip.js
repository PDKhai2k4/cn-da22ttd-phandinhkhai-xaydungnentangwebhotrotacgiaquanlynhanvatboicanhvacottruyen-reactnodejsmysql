'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { User, MapPin, Package, X } from 'lucide-react';

/**
 * Component hiển thị popup thông tin khi hover vào từ khóa trùng với entities
 * (nhân vật, địa điểm, vật phẩm)
 */
export default function EntityTooltip({ content, entities, className = '' }) {
    const [tooltip, setTooltip] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const hoverTimeoutRef = useRef(null);
    const containerRef = useRef(null);

    // Tạo regex pattern từ danh sách entities
    const createHighlightedContent = useCallback(() => {
        if (!content || !entities || entities.length === 0) {
            return content;
        }

        let result = content;
        
        // Sắp xếp entities theo độ dài tên (dài trước) để tránh match sai
        const sortedEntities = [...entities].sort((a, b) => b.name.length - a.name.length);
        
        sortedEntities.forEach(entity => {
            // Escape special regex characters trong tên
            const escapedName = entity.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedName})`, 'gi');
            
            result = result.replace(regex, (match) => {
                return `<span class="entity-highlight entity-${entity.type}" data-entity-id="${entity.id}" data-entity-type="${entity.type}">${match}</span>`;
            });
        });

        return result;
    }, [content, entities]);

    // Xử lý hover
    const handleMouseEnter = useCallback((e) => {
        const target = e.target;
        if (!target.classList.contains('entity-highlight')) return;

        const entityId = target.dataset.entityId;
        const entityType = target.dataset.entityType;
        
        const entity = entities.find(ent => 
            ent.id.toString() === entityId && ent.type === entityType
        );
        
        if (!entity) return;

        // Delay 500ms trước khi hiển thị
        hoverTimeoutRef.current = setTimeout(() => {
            const rect = target.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
            
            setTooltipPosition({
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top - 10
            });
            setTooltip(entity);
        }, 500);
    }, [entities]);


    const handleMouseLeave = useCallback((e) => {
        const target = e.target;
        if (!target.classList.contains('entity-highlight')) return;
        
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    }, []);

    const closeTooltip = useCallback(() => {
        setTooltip(null);
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    const getEntityIcon = (type) => {
        switch (type) {
            case 'character': return <User className="w-4 h-4" />;
            case 'location': return <MapPin className="w-4 h-4" />;
            case 'item': return <Package className="w-4 h-4" />;
            default: return null;
        }
    };

    const getEntityColor = (type) => {
        switch (type) {
            case 'character': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'location': return 'text-green-600 bg-green-50 border-green-200';
            case 'item': return 'text-purple-600 bg-purple-50 border-purple-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getEntityLabel = (type) => {
        switch (type) {
            case 'character': return 'Nhân vật';
            case 'location': return 'Địa điểm';
            case 'item': return 'Vật phẩm';
            default: return '';
        }
    };

    const highlightedContent = createHighlightedContent();

    return (
        <div 
            ref={containerRef}
            className={`relative ${className}`}
            onMouseOver={handleMouseEnter}
            onMouseOut={handleMouseLeave}
        >
            <div 
                className="entity-content"
                dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />

            {tooltip && (
                <div 
                    className="absolute z-50 w-72 animate-fadeIn"
                    style={{
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className={`rounded-xl border shadow-lg p-4 ${getEntityColor(tooltip.type)}`}>
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                {getEntityIcon(tooltip.type)}
                                <span className="text-xs font-medium uppercase tracking-wide">
                                    {getEntityLabel(tooltip.type)}
                                </span>
                            </div>
                            <button 
                                onClick={closeTooltip}
                                className="p-1 hover:bg-white/50 rounded transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-1">{tooltip.name}</h4>
                        
                        {tooltip.description ? (
                            <p className="text-sm text-gray-600 line-clamp-3">{tooltip.description}</p>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Chưa có mô tả</p>
                        )}
                        
                        {tooltip.type === 'character' && (
                            <div className="mt-2 text-xs space-y-1">
                                {tooltip.role && (
                                    <div>
                                        <span className="font-medium">Vai trò:</span>{' '}
                                        {tooltip.role === 'main' ? 'Nhân vật chính' : 
                                         tooltip.role === 'supporting' ? 'Nhân vật phụ' : 
                                         tooltip.role === 'antagonist' ? 'Phản diện' : tooltip.role}
                                    </div>
                                )}
                                {tooltip.age && <div><span className="font-medium">Tuổi:</span> {tooltip.age}</div>}
                                {tooltip.gender && (
                                    <div>
                                        <span className="font-medium">Giới tính:</span>{' '}
                                        {tooltip.gender === 'male' ? 'Nam' : tooltip.gender === 'female' ? 'Nữ' : 'Khác'}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {tooltip.type === 'location' && tooltip.location_type && (
                            <div className="mt-2 text-xs">
                                <span className="font-medium">Loại:</span> {tooltip.location_type}
                            </div>
                        )}
                        
                        {tooltip.type === 'item' && (
                            <div className="mt-2 text-xs space-y-1">
                                {tooltip.item_type && <div><span className="font-medium">Loại:</span> {tooltip.item_type}</div>}
                                {tooltip.rarity && <div><span className="font-medium">Độ hiếm:</span> {tooltip.rarity}</div>}
                            </div>
                        )}

                        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
                            <div className="border-8 border-transparent border-t-current" style={{ borderTopColor: 'inherit' }} />
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .entity-highlight {
                    cursor: help;
                    border-radius: 2px;
                    padding: 0 2px;
                    transition: all 0.2s;
                }
                .entity-highlight:hover {
                    filter: brightness(0.95);
                }
                .entity-character {
                    background-color: rgba(59, 130, 246, 0.15);
                    border-bottom: 2px solid rgba(59, 130, 246, 0.5);
                }
                .entity-location {
                    background-color: rgba(34, 197, 94, 0.15);
                    border-bottom: 2px solid rgba(34, 197, 94, 0.5);
                }
                .entity-item {
                    background-color: rgba(168, 85, 247, 0.15);
                    border-bottom: 2px solid rgba(168, 85, 247, 0.5);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -90%); }
                    to { opacity: 1; transform: translate(-50%, -100%); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
