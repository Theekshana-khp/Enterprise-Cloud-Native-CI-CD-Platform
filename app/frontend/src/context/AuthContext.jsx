import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, login as loginApi, register as registerApi } from '../api/auth';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('taskflow_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token'));
  const [bootstrapping, setBootstrapping] = useState(Boolean(localStorage.getItem('taskflow_token')));

  const persistSession = useCallback((auth) => {
    localStorage.setItem('taskflow_token', auth.token);
    localStorage.setItem('taskflow_user', JSON.stringify(auth.user));
    setToken(auth.token);
    setUser(auth.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setBootstrapping(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const login = useCallback(
    async (credentials) => {
      const auth = await loginApi(credentials);
      persistSession(auth);
      return auth;
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload) => {
      const auth = await registerApi(payload);
      persistSession(auth);
      return auth;
    },
    [persistSession],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      bootstrapping,
      login,
      register,
      logout,
    }),
    [user, token, bootstrapping, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
