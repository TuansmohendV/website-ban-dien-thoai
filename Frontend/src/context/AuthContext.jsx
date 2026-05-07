import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../lib/api';
import {
    AUTH_TOKEN_KEY,
    clearSession,
    getStorageItem,
    normalizeUser,
    persistSession,
    readStoredUser,
} from '../lib/session';

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
        const bootstrapSession = async () => {
            const token = getStorageItem(AUTH_TOKEN_KEY);
            const storedUser = readStoredUser();

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            if (storedUser) {
                setUser(storedUser);
            }

            try {
                const response = await api.get('/api/users/profile');
                const nextUser = normalizeUser(response.data?.user || {});
                setUser(nextUser);
                persistSession({ token, user: nextUser });
            } catch {
                clearSession();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        bootstrapSession();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await api.post('/api/auth/login', credentials);
            const nextUser = normalizeUser(response.data?.user || {});
            persistSession({
                token: response.data?.token,
                user: nextUser,
            });
            setUser(nextUser);
            return nextUser;
        } catch (error) {
            throw new Error(
                getApiErrorMessage(error, 'Khong the dang nhap luc nay.')
            );
        }
    };

    const register = async (payload) => {
        try {
            const response = await api.post('/api/auth/register', payload);
            const nextUser = normalizeUser(response.data?.user || {});
            persistSession({
                token: response.data?.token,
                user: nextUser,
            });
            setUser(nextUser);
            return nextUser;
        } catch (error) {
            throw new Error(
                getApiErrorMessage(error, 'Khong the dang ky tai khoan luc nay.')
            );
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch {
            // Keep client-side logout even if network call fails.
        } finally {
            clearSession();
            setUser(null);
        }
    };

    const refreshProfile = async () => {
        const response = await api.get('/api/users/profile');
        const nextUser = normalizeUser(response.data?.user || {});
        persistSession({
            token: getStorageItem(AUTH_TOKEN_KEY),
            user: nextUser,
        });
        setUser(nextUser);
        return nextUser;
    };

    const updateProfile = async (payload) => {
        try {
            const response = await api.put('/api/users/profile', payload);
            const nextUser = normalizeUser(response.data?.user || {});
            persistSession({
                token: getStorageItem(AUTH_TOKEN_KEY),
                user: nextUser,
            });
            setUser(nextUser);
            return nextUser;
        } catch (error) {
            throw new Error(
                getApiErrorMessage(error, 'Khong the cap nhat thong tin tai khoan.')
            );
        }
    };

    const changePassword = async (payload) => {
        try {
            const response = await api.put('/api/auth/change-password', payload);
            return response.data;
        } catch (error) {
            throw new Error(
                getApiErrorMessage(error, 'Khong the doi mat khau luc nay.')
            );
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                refreshProfile,
                updateProfile,
                changePassword,
                loading,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};
