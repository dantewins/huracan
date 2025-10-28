"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoginOpen: boolean;
    setIsLoginOpen: (open: boolean) => void;
    isSignupOpen: boolean;
    setIsSignupOpen: (open: boolean) => void;
    openLogin: () => void;
    openSignup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
            await fetchUser();
        } else {
            const { error } = await res.json();
            throw new Error(error || 'Login failed');
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        if (res.ok) {
            await fetchUser();
        } else {
            const { error } = await res.json();
            throw new Error(error || 'Signup failed');
        }
    };

    const logout = async () => {
        setUser(null);
        await fetch('/api/auth/logout', { method: 'POST' });
    };

    const openLogin = () => setIsLoginOpen(true);
    const openSignup = () => setIsSignupOpen(true);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, isLoginOpen, setIsLoginOpen, isSignupOpen, setIsSignupOpen, openLogin, openSignup }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (undefined === context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}