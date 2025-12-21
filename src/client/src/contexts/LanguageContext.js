'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Định nghĩa các bản dịch
const translations = {
    vi: {
        // Common
        save: 'Lưu',
        cancel: 'Hủy',
        delete: 'Xóa',
        edit: 'Chỉnh sửa',
        create: 'Tạo mới',
        search: 'Tìm kiếm',
        loading: 'Đang tải...',
        noData: 'Không có dữ liệu',
        
        // Auth
        login: 'Đăng nhập',
        register: 'Đăng ký',
        logout: 'Đăng xuất',
        email: 'Email',
        password: 'Mật khẩu',
        username: 'Tên đăng nhập',
        fullName: 'Họ tên',
        forgotPassword: 'Quên mật khẩu?',
        
        // Navigation
        dashboard: 'Dashboard',
        projects: 'Dự án',
        characters: 'Nhân vật',
        locations: 'Địa điểm',
        timeline: 'Dòng thời gian',
        items: 'Vật phẩm',
        chapters: 'Chương truyện',
        notes: 'Ghi chú',
        relationships: 'Mối quan hệ',
        settings: 'Cài đặt',
        feedback: 'Phản hồi',
        admin: 'Quản trị',
        
        // Settings
        profile: 'Hồ sơ',
        preferences: 'Tùy chọn',
        dangerZone: 'Vùng nguy hiểm',
        theme: 'Giao diện',
        themeLight: 'Sáng',
        themeDark: 'Tối',
        themeSystem: 'Theo hệ thống',
        language: 'Ngôn ngữ',
        notifications: 'Thông báo',
        notificationsDesc: 'Nhận thông báo từ hệ thống',
        deleteAccount: 'Xóa tài khoản',
        deleteAccountDesc: 'Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn',
        changePassword: 'Đổi mật khẩu',
        currentPassword: 'Mật khẩu hiện tại',
        newPassword: 'Mật khẩu mới',
        confirmPassword: 'Xác nhận mật khẩu',
        
        // Messages
        saveSuccess: 'Lưu thành công',
        saveError: 'Có lỗi xảy ra',
        deleteSuccess: 'Xóa thành công',
        updateSuccess: 'Cập nhật thành công',
        loginSuccess: 'Đăng nhập thành công',
        registerSuccess: 'Đăng ký thành công',
        passwordChanged: 'Đổi mật khẩu thành công',
        passwordMismatch: 'Mật khẩu xác nhận không khớp',
        
        // Project
        myProjects: 'Dự án của tôi',
        createProject: 'Tạo dự án mới',
        projectName: 'Tên dự án',
        projectDesc: 'Mô tả',
        genre: 'Thể loại',
        status: 'Trạng thái',
        statusPlanning: 'Lên kế hoạch',
        statusWriting: 'Đang viết',
        statusCompleted: 'Hoàn thành',
        statusPaused: 'Tạm dừng',
        
        // Admin
        adminPanel: 'Quản trị hệ thống',
        users: 'Người dùng',
        totalUsers: 'Tổng người dùng',
        totalProjects: 'Tổng dự án',
        pendingFeedbacks: 'Phản hồi chờ xử lý',
        recentUsers: 'Người dùng mới',
        userRole: 'Vai trò',
        userStatus: 'Trạng thái',
        active: 'Hoạt động',
        locked: 'Bị khóa',
        lock: 'Khóa',
        unlock: 'Mở khóa',
        systemSettings: 'Cài đặt hệ thống',
    },
    en: {
        // Common
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        search: 'Search',
        loading: 'Loading...',
        noData: 'No data',
        
        // Auth
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        username: 'Username',
        fullName: 'Full name',
        forgotPassword: 'Forgot password?',
        
        // Navigation
        dashboard: 'Dashboard',
        projects: 'Projects',
        characters: 'Characters',
        locations: 'Locations',
        timeline: 'Timeline',
        items: 'Items',
        chapters: 'Chapters',
        notes: 'Notes',
        relationships: 'Relationships',
        settings: 'Settings',
        feedback: 'Feedback',
        admin: 'Admin',
        
        // Settings
        profile: 'Profile',
        preferences: 'Preferences',
        dangerZone: 'Danger Zone',
        theme: 'Theme',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeSystem: 'System',
        language: 'Language',
        notifications: 'Notifications',
        notificationsDesc: 'Receive system notifications',
        deleteAccount: 'Delete Account',
        deleteAccountDesc: 'Permanently delete your account and all data',
        changePassword: 'Change Password',
        currentPassword: 'Current password',
        newPassword: 'New password',
        confirmPassword: 'Confirm password',
        
        // Messages
        saveSuccess: 'Saved successfully',
        saveError: 'An error occurred',
        deleteSuccess: 'Deleted successfully',
        updateSuccess: 'Updated successfully',
        loginSuccess: 'Login successful',
        registerSuccess: 'Registration successful',
        passwordChanged: 'Password changed successfully',
        passwordMismatch: 'Passwords do not match',
        
        // Project
        myProjects: 'My Projects',
        createProject: 'Create New Project',
        projectName: 'Project name',
        projectDesc: 'Description',
        genre: 'Genre',
        status: 'Status',
        statusPlanning: 'Planning',
        statusWriting: 'Writing',
        statusCompleted: 'Completed',
        statusPaused: 'Paused',
        
        // Admin
        adminPanel: 'Admin Panel',
        users: 'Users',
        totalUsers: 'Total Users',
        totalProjects: 'Total Projects',
        pendingFeedbacks: 'Pending Feedbacks',
        recentUsers: 'Recent Users',
        userRole: 'Role',
        userStatus: 'Status',
        active: 'Active',
        locked: 'Locked',
        lock: 'Lock',
        unlock: 'Unlock',
        systemSettings: 'System Settings',
    }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('vi');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load language từ localStorage
        const savedLang = localStorage.getItem('language') || 'vi';
        setLanguage(savedLang);
        setMounted(true);
    }, []);

    const changeLanguage = useCallback((newLang) => {
        setLanguage(newLang);
        localStorage.setItem('language', newLang);
        // Update html lang attribute
        document.documentElement.lang = newLang;
    }, []);

    // Translation function
    const t = useCallback((key) => {
        return translations[language]?.[key] || translations['vi']?.[key] || key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, mounted }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
