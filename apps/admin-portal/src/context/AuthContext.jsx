import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

function readAdmin() {
  try {
    const saved = localStorage.getItem('admin');
    return saved && localStorage.getItem('token') ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(readAdmin);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
  }, []);

  // Confirm the stored session with the server once per visit.
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api
      .get('/admin/me')
      .then(({ data }) => {
        if (data?.admin) {
          localStorage.setItem('admin', JSON.stringify(data.admin));
          setAdmin(data.admin);
        }
      })
      .catch((err) => {
        if (err?.response?.status === 401) logout();
      });
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/admin/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('admin', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const value = useMemo(() => ({ admin, login, logout }), [admin, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
