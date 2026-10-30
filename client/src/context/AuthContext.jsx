import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { tokenStore } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Restore the session on page load.
  useEffect(() => {
    if (!tokenStore.get()) return;
    api.get('/auth/me')
      .then((res) => setUser(res.data.data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setBooting(false));
  }, []);

  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const authenticate = useCallback(async (path, payload) => {
    const res = await api.post(path, payload);
    tokenStore.set(res.data.data.token);
    setUser(res.data.data.user);
  }, []);

  const value = useMemo(() => ({
    user,
    booting,
    login: (p) => authenticate('/auth/login', p),
    register: (p) => authenticate('/auth/register', p),
    logout,
  }), [user, booting, authenticate, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
