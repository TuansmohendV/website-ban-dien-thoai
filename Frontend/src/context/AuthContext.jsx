import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getApiMessage } from '../lib/api';
import {
  clearStoredAuth,
  getStoredAuth,
  normalizeUser,
  setStoredAuth,
  updateStoredUser,
} from '../lib/session';
import { authService, userService } from '../services/shopApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const initialAuth = getStoredAuth();
  const [token, setToken] = useState(initialAuth.token);
  const [user, setUser] = useState(initialAuth.user);
  const [loading, setLoading] = useState(true);

  const syncAuthState = (nextAuth) => {
    setToken(nextAuth.token || '');
    setUser(nextAuth.user ? normalizeUser(nextAuth.user) : null);
    setStoredAuth(nextAuth);
  };

  const clearAuthState = () => {
    setToken('');
    setUser(null);
    clearStoredAuth();
  };

  const refreshProfile = async () => {
    const profile = await userService.getProfile();
    const normalizedUser = normalizeUser(profile);
    setUser(normalizedUser);
    updateStoredUser(normalizedUser);
    return normalizedUser;
  };

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      if (!initialAuth.token) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await userService.getProfile();

        if (!mounted) {
          return;
        }

        syncAuthState({
          token: initialAuth.token,
          user: profile,
        });
      } catch {
        if (mounted) {
          clearAuthState();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const authPayload = await authService.login(credentials);
    syncAuthState(authPayload);
    return authPayload.user;
  };

  const register = async (payload) => {
    const authPayload = await authService.register(payload);
    syncAuthState(authPayload);
    return authPayload.user;
  };

  const updateProfile = async (payload) => {
    const nextUser = normalizeUser(await userService.updateProfile(payload));
    setUser(nextUser);
    updateStoredUser(nextUser);
    return nextUser;
  };

  const changePassword = async (payload) => {
    const response = await authService.changePassword(payload);

    if (response.token) {
      syncAuthState({
        token: response.token,
        user,
      });
    }

    return response;
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch {
      // Keep UX smooth even if logout request fails.
    } finally {
      clearAuthState();
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
      getErrorMessage: getApiMessage,
    }),
    [loading, token, user]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
