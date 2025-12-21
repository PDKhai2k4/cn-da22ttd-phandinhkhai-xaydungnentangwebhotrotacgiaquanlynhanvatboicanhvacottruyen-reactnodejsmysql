'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { User, MapPin, Package } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-400">Đang tải trình soạn thảo...</span>
    </div>
});

export default function QuillWithTooltip({ 
    value, 
    onChange, 
    entities = [], 
    modules, 
    formats, 
    placeholder,
    className 
}) {
    const [tooltip, setTooltip] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef(null);
    const hoverTimeoutRef = useRef(null);
    const lastWordRef = useRef('');

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!entities.length) return;
        
        // Chỉ xử lý khi hover trong .ql-editor
        const editorEl = containerRef.current?.querySelector('.ql-editor');
        if (!editorEl || !editorEl.contains(e.target)) {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setTooltip(null);
            return;
        }

        // Lấy vị trí text tại điểm chuột
        let range;
        if (document.caretRangeFromPoint) {
            range = document.caretRangeFromPoint(e.clientX, e.clientY);
        } else if (document.caretPositionFromPoint) {
            const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
            if (pos) {
                range = document.createRange();
                range.setStart(pos.offsetNode, pos.offset);
                range.setEnd(pos.offsetNode, pos.offset);
            }
        }

        if (!range || range.startContainer.nodeType !== Node.TEXT_NODE) {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setTooltip(null);
            return;
        }

        const textNode = range.startContainer;
        const text = textNode.textContent || '';
        const offset = range.startOffset;

        // Tìm từ tại vị trí chuột
        let wordStart = offset;
        let wordEnd = offset;
        
        while (wordStart > 0 && /[a-zA-ZÀ-ỹ0-9]/.test(text[wordStart - 1])) wordStart--;
        while (wordEnd < text.length && /[a-zA-ZÀ-ỹ0-9]/.test(text[wordEnd])) wordEnd++;
        
        const word = text.slice(wordStart, wordEnd).trim();
        
        if (!word || word.length < 2) {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setTooltip(null);
            lastWordRef.current = '';
            return;
        }

        // Nếu cùng từ thì không làm gì
        if (word === lastWordRef.current && tooltip) return;
        lastWordRef.current = word;

        // Tìm entity khớp
        const entity = entities.find(ent => 
            ent.name.toLowerCase() === word.toLowerCase()
        );

        if (entity) {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            
            hoverTimeoutRef.current = setTimeout(() => {
                // Tạo range cho từ để lấy vị trí chính xác
                const wordRange = document.createRange();
                wordRange.setStart(textNode, wordStart);
                wordRange.setEnd(textNode, wordEnd);
                const rect = wordRange.getBoundingClientRect();
                
                setTooltipPos({ 
                    x: rect.left + rect.width / 2, 
                    y: rect.top - 5 
                });
                setTooltip(entity);
            }, 300);
        } else {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setTooltip(null);
        }
    }, [entities, tooltip]);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setTooltip(null);
        lastWordRef.current = '';
    }, []);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const getEntityIcon = (type) => {
        if (type === 'character') return <User className="w-4 h-4" />;
        if (type === 'location') return <MapPin className="w-4 h-4" />;
        if (type === 'item') return <Package className="w-4 h-4" />;
        return null;
    };

    const getEntityColor = (type) => {
        if (type === 'character') return 'bg-blue-50 border-blue-300 text-blue-800';
        if (type === 'location') return 'bg-green-50 border-green-300 text-green-800';
        if (type === 'item') return 'bg-purple-50 border-purple-300 text-purple-800';
        return 'bg-gray-50 border-gray-300 text-gray-800';
    };

    const getEntityLabel = (type) => {
        if (type === 'character') return 'Nhân vật';
        if (type === 'location') return 'Địa điểm';
        if (type === 'item') return 'Vật phẩm';
        return '';
    };

    const getRoleText = (role) => {
        if (role === 'main') return 'Nhân vật chính';
        if (role === 'supporting') return 'Nhân vật phụ';
        if (role === 'antagonist') return 'Phản diện';
        return role;
    };

    const tooltipElement = tooltip && mounted ? createPortal(
        <div 
            className="fixed z-[99999] w-72 pointer-events-none animate-fadeIn"
            style={{ 
                left: `${tooltipPos.x}px`, 
                top: `${tooltipPos.y}px`, 
                transform: 'translate(-50%, -100%)'
            }}
        >
            <div className={`rounded-xl border-2 shadow-2xl p-4 ${getEntityColor(tooltip.type)}`}>
                <div className="flex items-center space-x-2 mb-2">
                    {getEntityIcon(tooltip.type)}
                    <span className="text-xs font-bold uppercase tracking-wide">
                        {getEntityLabel(tooltip.type)}
                    </span>
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">{tooltip.name}</h4>
                {tooltip.description ? (
                    <p className="text-sm text-gray-700 line-clamp-3">{tooltip.description}</p>
                ) : (
                    <p className="text-sm text-gray-400 italic">Chưa có mô tả</p>
                )}
                {tooltip.type === 'character' && (
                    <div className="mt-3 text-xs space-y-1 border-t border-current/20 pt-2">
                        {tooltip.role && <div><span className="font-semibold">Vai trò:</span> {getRoleText(tooltip.role)}</div>}
                        {tooltip.age && <div><span className="font-semibold">Tuổi:</span> {tooltip.age}</div>}
                        {tooltip.gender && <div><span className="font-semibold">Giới tính:</span> {tooltip.gender === 'male' ? 'Nam' : tooltip.gender === 'female' ? 'Nữ' : 'Khác'}</div>}
                    </div>
                )}
                {tooltip.type === 'location' && tooltip.location_type && (
                    <div className="mt-3 text-xs border-t border-current/20 pt-2">
                        <span className="font-semibold">Loại:</span> {tooltip.location_type}
                    </div>
                )}
                {tooltip.type === 'item' && (tooltip.item_type || tooltip.rarity) && (
                    <div className="mt-3 text-xs space-y-1 border-t border-current/20 pt-2">
                        {tooltip.item_type && <div><span className="font-semibold">Loại:</span> {tooltip.item_type}</div>}
                        {tooltip.rarity && <div><span className="font-semibold">Độ hiếm:</span> {tooltip.rarity}</div>}
                    </div>
                )}
            </div>
            <div className="flex justify-center">
                <div className="w-3 h-3 bg-inherit border-b-2 border-r-2 border-current transform rotate-45 -mt-1.5" 
                     style={{ backgroundColor: tooltip.type === 'character' ? '#eff6ff' : tooltip.type === 'location' ? '#f0fdf4' : '#faf5ff' }} />
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className={className}
            />
            {tooltipElement}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -90%); }
                    to { opacity: 1; transform: translate(-50%, -100%); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.15s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
