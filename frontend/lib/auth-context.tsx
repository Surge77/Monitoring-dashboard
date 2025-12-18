'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('token');
        if (stored) {
            setToken(stored);
            api.setToken(stored);
            api.getMe()
                .then(res => setUser(res.user as User))
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await api.login(email, password);
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user as User);
    }, []);

    const register = useCallback(async (email: string, password: string) => {
        const res = await api.register(email, password);
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user as User);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        api.setToken(null);
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
