'use client';

import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback } from 'react';

const ThemeContext = createContext();

// Hook để dùng useLayoutEffect trên client, useEffect trên server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Helper để lấy theme key theo user
const getThemeKey = (userId) => userId ? `theme_${userId}` : 'theme_guest';

// Helper để lấy user ID từ localStorage
const getUserIdFromStorage = () => {
    if (typeof window === 'undefined') return null;
    try {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser)?.id : null;
    } catch {
        return null;
    }
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light'); // Mặc định là light cho guest
    const [actualTheme, setActualTheme] = useState('light');
    const [mounted, setMounted] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Hàm load theme theo user
    const loadThemeForUser = useCallback((userId) => {
        const themeKey = getThemeKey(userId);
        const savedTheme = localStorage.getItem(themeKey) || 'light';
        setCurrentUserId(userId);
        setTheme(savedTheme);
    }, []);

    // Load theme khi mount
    useIsomorphicLayoutEffect(() => {
        const userId = getUserIdFromStorage();
        loadThemeForUser(userId);
        setMounted(true);
    }, [loadThemeForUser]);

    // Lắng nghe thay đổi user trong localStorage (đăng nhập/đăng xuất)
    useEffect(() => {
        if (!mounted) return;

        // Custom event để lắng nghe thay đổi auth
        const handleAuthChange = () => {
            const userId = getUserIdFromStorage();
            if (userId !== currentUserId) {
                loadThemeForUser(userId);
            }
        };

        // Lắng nghe storage event (cho multi-tab)
        const handleStorageChange = (e) => {
            if (e.key === 'user' || e.key === 'token') {
                handleAuthChange();
            }
        };

        // Lắng nghe custom event
        window.addEventListener('auth-change', handleAuthChange);
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [currentUserId, mounted, loadThemeForUser]);

    useIsomorphicLayoutEffect(() => {
        if (!mounted) return;
        
        const applyTheme = () => {
            let resolvedTheme = theme;
            
            if (theme === 'system') {
                resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            
            setActualTheme(resolvedTheme);
            
            if (resolvedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            
            // Lưu theme theo user
            const themeKey = getThemeKey(currentUserId);
            localStorage.setItem(themeKey, theme);
        };

        applyTheme();

        // Lắng nghe thay đổi system theme
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') applyTheme();
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, mounted, currentUserId]);

    const changeTheme = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, actualTheme, changeTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
