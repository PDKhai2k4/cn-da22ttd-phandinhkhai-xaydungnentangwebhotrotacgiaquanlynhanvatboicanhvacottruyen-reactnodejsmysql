'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

const AuthContext = createContext({});

// Helper để dispatch event thay đổi auth
const dispatchAuthChange = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            
            if (token && savedUser) {
                setUser(JSON.parse(savedUser));
                // Verify token với server
                const response = await api.get('/auth/profile');
                setUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            dispatchAuthChange();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { user, token } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        // Thông báo theme context về thay đổi user
        dispatchAuthChange();
        
        return user;
    };

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        const { user, token } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        // Thông báo theme context về thay đổi user
        dispatchAuthChange();
        
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        
        // Thông báo theme context về thay đổi user (reset về guest)
        dispatchAuthChange();
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            setUser,
            loading, 
            login, 
            register, 
            logout, 
            updateUser,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
