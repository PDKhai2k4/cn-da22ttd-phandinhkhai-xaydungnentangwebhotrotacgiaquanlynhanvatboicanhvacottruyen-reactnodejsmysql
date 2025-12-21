'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
    BookOpen, Home, Users, MapPin, Clock, Package, FileText, 
    StickyNote, Settings, LogOut, Menu, X, Shield, ChevronLeft,
    MessageSquare, Heart
} from 'lucide-react';

export default function Sidebar({ projectId }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { user, logout, isAdmin } = useAuth();
    const { t } = useLanguage();

    const mainMenuItems = [
        { title: t('dashboard'), icon: Home, path: '/dashboard' },
    ];

    const projectMenuItems = projectId ? [
        { title: t('projects'), icon: BookOpen, path: `/project/${projectId}` },
        { title: t('characters'), icon: Users, path: `/project/${projectId}/characters` },
        { title: t('relationships'), icon: Heart, path: `/project/${projectId}/relationships` },
        { title: t('locations'), icon: MapPin, path: `/project/${projectId}/locations` },
        { title: t('timeline'), icon: Clock, path: `/project/${projectId}/timeline` },
        { title: t('items'), icon: Package, path: `/project/${projectId}/items` },
        { title: t('chapters'), icon: FileText, path: `/project/${projectId}/chapters` },
        { title: t('notes'), icon: StickyNote, path: `/project/${projectId}/notes` },
    ] : [];

    const bottomMenuItems = [
        { title: t('feedback'), icon: MessageSquare, path: '/feedback' },
        { title: t('settings'), icon: Settings, path: '/settings' },
    ];

    const isActive = (path) => pathname === path;

    return (
        <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 h-screen sticky top-0`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <Link href="/dashboard" className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-lg font-bold gradient-text">QL Truyện</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                    >
                        {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {/* Main Menu */}
                {mainMenuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                            isActive(item.path)
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                    </Link>
                ))}

                {/* Project Menu */}
                {projectMenuItems.length > 0 && (
                    <>
                        {!collapsed && (
                            <div className="pt-4 pb-2">
                                <Link 
                                    href="/dashboard"
                                    className="flex items-center space-x-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-primary-600"
                                >
                                    <ChevronLeft className="w-3 h-3" />
                                    <span>Dự án</span>
                                </Link>
                            </div>
                        )}
                        {projectMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                                    isActive(item.path)
                                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span>{item.title}</span>}
                            </Link>
                        ))}
                    </>
                )}

                {/* Admin Link */}
                {isAdmin && (
                    <>
                        {!collapsed && (
                            <div className="pt-4 pb-2">
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Admin</span>
                            </div>
                        )}
                        <Link
                            href="/admin"
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                                pathname.startsWith('/admin')
                                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <Shield className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>Admin Panel</span>}
                        </Link>
                    </>
                )}
            </nav>

            {/* Bottom Menu */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-1">
                {bottomMenuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                            isActive(item.path)
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                    </Link>
                ))}

                {/* User Info */}
                {!collapsed && user && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.full_name || user.username}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
}
