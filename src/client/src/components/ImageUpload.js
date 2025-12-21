'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import api, { API_URL } from '@/services/api';
import toast from 'react-hot-toast';

export default function ImageUpload({ 
    value, 
    onChange, 
    type = 'general', 
    className = '',
    placeholder = 'Kéo thả ảnh hoặc click để chọn',
    aspectRatio = 'square' // 'square' | 'cover' | 'avatar'
}) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${API_URL}${url}`;
    };

    const handleUpload = async (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Chỉ cho phép upload file ảnh (jpg, png, gif, webp)');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File không được vượt quá 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post(`/upload/${type}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onChange(response.data.imageUrl);
            toast.success('Upload ảnh thành công');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Không thể upload ảnh');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (!value) return;
        
        try {
            // Extract filename from URL
            const parts = value.split('/');
            const filename = parts[parts.length - 1];
            await api.delete(`/upload/${type}/${filename}`);
        } catch (error) {
            console.error('Delete error:', error);
        }
        onChange('');
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const aspectClasses = {
        square: 'aspect-square',
        cover: 'aspect-video',
        avatar: 'aspect-square rounded-full'
    };

    const imageUrl = getImageUrl(value);

    return (
        <div className={`relative ${className}`}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />

            {imageUrl ? (
                <div className={`relative ${aspectClasses[aspectRatio]} overflow-hidden rounded-xl border border-gray-200 bg-gray-50`}>
                    <img
                        src={imageUrl}
                        alt="Preview"
                        className={`w-full h-full object-cover ${aspectRatio === 'avatar' ? 'rounded-full' : ''}`}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                            title="Thay đổi ảnh"
                        >
                            <Upload className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                            title="Xóa ảnh"
                        >
                            <X className="w-5 h-5 text-red-500" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
                        ${aspectClasses[aspectRatio]} 
                        border-2 border-dashed rounded-xl cursor-pointer
                        flex flex-col items-center justify-center gap-2
                        transition-all
                        ${dragActive 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-gray-100'
                        }
                        ${uploading ? 'pointer-events-none' : ''}
                    `}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                            <span className="text-sm text-gray-500">Đang upload...</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-500 text-center px-4">{placeholder}</span>
                            <span className="text-xs text-gray-400">JPG, PNG, GIF, WebP (max 5MB)</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// Component Avatar nhỏ gọn hơn
export function AvatarUpload({ value, onChange, size = 'md' }) {
    const sizes = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32'
    };

    return (
        <ImageUpload
            value={value}
            onChange={onChange}
            type="avatars"
            aspectRatio="avatar"
            className={sizes[size]}
            placeholder="Ảnh đại diện"
        />
    );
}
