import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchMe,
  getStoredToken,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  setStoredToken,
} from "../api/client.js";

const AuthContext = createContext(null);
const CACHED_USER_KEY = "techconnect_cached_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CACHED_USER_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchMe();
      setUser(data.user);
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(data.user));
    } catch {
      const cachedUser = JSON.parse(localStorage.getItem(CACHED_USER_KEY) || "null");
      setUser(cachedUser);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (credentials) => {
    const data = await apiLogin(credentials);
    setStoredToken(data.token);
    setUser(data.user);
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(data.user));
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await apiRegister(payload);
    setStoredToken(data.token);
    setUser(data.user);
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(data.user));
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Clear local session even if API call fails
    }
    setStoredToken(null);
    localStorage.removeItem(CACHED_USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isClient: user?.roles?.includes("client"),
      isTechnician: user?.roles?.includes("technician"),
      isAdmin: user?.roles?.includes("admin"),
      login,
      register,
      logout,
      refreshUser: loadUser,
    }),
    [user, loading, login, register, logout, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
