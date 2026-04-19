import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock: Check localStorage for user session
        const storedUser = localStorage.getItem('phonesin_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // Mock login: always successful
        const mockUser = {
            id: 'mock-123',
            name: userData.phone || 'Tuấn',
            phone: userData.phone || '0336133880',
            email: 'user@phonesin.com',
            avatar: 'https://i.pravatar.cc/150?u=mock123',
            memberRank: 'Gold Member',
            points: 1250,
            address: '188Ter Trần Quang Khải, Quận 1, TP. HCM',
            ...userData
        };
        setUser(mockUser);
        localStorage.setItem('phonesin_user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('phonesin_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
