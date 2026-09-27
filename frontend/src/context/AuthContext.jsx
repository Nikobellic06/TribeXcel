import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem('student');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (identifier, password) => {
    const { data } = await api.post('/student/login', { identifier, password });
    localStorage.setItem('studentToken', data.token);
    localStorage.setItem('student', JSON.stringify(data.student));
    setStudent(data.student);
    return data.student;
  };

  const signup = async (formData) => {
    const { data } = await api.post('/student/register', formData);
    localStorage.setItem('studentToken', data.token);
    localStorage.setItem('student', JSON.stringify(data.student));
    setStudent(data.student);
    return data.student;
  };

  const logout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('student');
    setStudent(null);
  };

  return (
    <AuthContext.Provider value={{ student, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
