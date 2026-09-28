import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

function readSavedStudent() {
  try {
    const saved = localStorage.getItem('student');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(readSavedStudent);

  /** Keep the cached copy of the student in sync (profile edits, e-KYC). */
  const updateStudent = useCallback((next) => {
    if (!next) return;
    localStorage.setItem('student', JSON.stringify(next));
    setStudent(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('student');
    setStudent(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) return;
    api
      .get('/student/me')
      .then((res) => {
        if (res.data?.student) updateStudent(res.data.student);
      })
      .catch((err) => {
        // Only sign out when the token is rejected; stay signed in if the server is just unreachable.
        if (err?.response?.status === 401) logout();
      });
  }, [updateStudent, logout]);

  const login = useCallback(
    async (identifier, password) => {
      const { data } = await api.post('/student/login', { identifier, password });
      localStorage.setItem('studentToken', data.token);
      updateStudent(data.student);
      return data.student;
    },
    [updateStudent]
  );

  const signup = useCallback(
    async (formData) => {
      const { data } = await api.post('/student/register', formData);
      localStorage.setItem('studentToken', data.token);
      updateStudent(data.student);
      return data.student;
    },
    [updateStudent]
  );

  const value = useMemo(
    () => ({ student, login, signup, logout, updateStudent }),
    [student, login, signup, logout, updateStudent]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
