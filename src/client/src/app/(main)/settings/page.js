'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Palette, Save, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import ImageUpload from '@/components/ImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const router = useRouter();
    const { user, setUser, logout } = useAuth();
    const { theme: currentTheme, changeTheme } = useTheme();
    const { language: currentLanguage, changeLanguage, t } = useLanguage();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const [profile, setProfile] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        username: user?.username || '',
        avatar: user?.avatar || ''
    });

    const [password, setPassword] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false, new: false, confirm: false
    });

    const [settings, setSettings] = useState({
        theme: currentTheme || 'system',
        language: currentLanguage || 'vi',
        notifications_enabled: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        setSettings(prev => ({ ...prev, theme: currentTheme, language: currentLanguage }));
    }, [currentTheme, currentLanguage]);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            if (response.data.settings) {
                setSettings(response.data.settings);
                // Sync language với context
                if (response.data.settings.language) {
                    changeLanguage(response.data.settings.language);
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put('/users/profile', profile);
            setUser({ ...user, ...response.data.user });
            toast.success('Cập nhật thông tin thành công');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (password.new_password !== password.confirm_password) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }
        if (password.new_password.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }
        setLoading(true);
        try {
            // Sử dụng đúng endpoint PUT /users/password
            await api.put('/users/password', {
                current_password: password.current_password,
                new_password: password.new_password
            });
            setPassword({ current_password: '', new_password: '', confirm_password: '' });
            toast.success('Đổi mật khẩu thành công');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async () => {
        setLoading(true);
        try {
            // Áp dụng theme và language ngay lập tức
            changeTheme(settings.theme);
            changeLanguage(settings.language);
            await api.put('/settings', settings);
            toast.success(t('updateSuccess'));
        } catch (error) {
            toast.error(t('saveError'));
        } finally {
            setLoading(false);
        }
    };

    const handleThemeChange = (newTheme) => {
        setSettings({ ...settings, theme: newTheme });
        changeTheme(newTheme); // Áp dụng ngay khi chọn
    };

    const handleLanguageChange = (newLang) => {
        setSettings({ ...settings, language: newLang });
        changeLanguage(newLang); // Áp dụng ngay khi chọn
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await api.delete('/users/account');
            toast.success('Xóa tài khoản thành công');
            logout();
            router.push('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    const tabs = [
        { id: 'profile', label: t('profile'), icon: User },
        { id: 'password', label: t('changePassword'), icon: Lock },
        { id: 'preferences', label: t('preferences'), icon: Palette },
        // Ẩn tab Danger Zone cho admin
        ...(user?.role !== 'admin' ? [{ id: 'danger', label: t('dangerZone'), icon: AlertTriangle }] : [])
    ];

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('settings')}</h1>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'text-primary-600 border-b-2 border-primary-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-5">
                                <div className="flex items-center space-x-6 mb-6">
                                    <div className="w-24 h-24">
                                        <ImageUpload
                                            value={profile.avatar}
                                            onChange={(url) => setProfile({ ...profile, avatar: url })}
                                            type="avatars"
                                            aspectRatio="avatar"
                                            placeholder="Ảnh đại diện"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{user?.full_name || user?.username}</h3>
                                        <p className="text-gray-500">{user?.email}</p>
                                        <p className="text-xs text-gray-400 mt-1">Click vào ảnh để thay đổi</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                                        <input
                                            type="text"
                                            value={profile.username}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                                        <input
                                            type="text"
                                            value={profile.full_name}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                                </button>
                            </form>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            value={password.current_password}
                                            onChange={(e) => setPassword({ ...password, current_password: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={password.new_password}
                                            onChange={(e) => setPassword({ ...password, new_password: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={password.confirm_password}
                                            onChange={(e) => setPassword({ ...password, confirm_password: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50"
                                >
                                    <Lock className="w-5 h-5" />
                                    <span>{loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</span>
                                </button>
                            </form>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-6 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('theme')}</label>
                                    <select
                                        value={settings.theme}
                                        onChange={(e) => handleThemeChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="light">{t('themeLight')}</option>
                                        <option value="dark">{t('themeDark')}</option>
                                        <option value="system">{t('themeSystem')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('language')}</label>
                                    <select
                                        value={settings.language}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="vi">Tiếng Việt</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{t('notifications')}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('notificationsDesc')}</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, notifications_enabled: !settings.notifications_enabled })}
                                        className={`w-12 h-6 rounded-full transition-colors ${
                                            settings.notifications_enabled ? 'bg-primary-500' : 'bg-gray-300'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                            settings.notifications_enabled ? 'translate-x-6' : 'translate-x-0.5'
                                        }`}></div>
                                    </button>
                                </div>
                                <button
                                    onClick={handleUpdateSettings}
                                    disabled={loading}
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>{loading ? t('loading') : t('save')}</span>
                                </button>
                            </div>
                        )}

                        {/* Danger Zone Tab - Ẩn cho admin */}
                        {activeTab === 'danger' && user?.role !== 'admin' && (
                            <div className="space-y-6 max-w-md">
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-red-800">Vùng nguy hiểm</h3>
                                            <p className="text-sm text-red-600 mt-1">
                                                Các hành động dưới đây không thể hoàn tác. Hãy cân nhắc kỹ trước khi thực hiện.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border border-red-200 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Xóa tài khoản</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Xóa tài khoản</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md animate-fadeIn">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Xóa tài khoản?</h2>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn xóa tài khoản? Hành động này sẽ xóa vĩnh viễn tất cả dự án, nhân vật, chương truyện và dữ liệu khác của bạn. Không thể hoàn tác!
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50"
                                >
                                    {loading ? 'Đang xóa...' : 'Xóa tài khoản'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
