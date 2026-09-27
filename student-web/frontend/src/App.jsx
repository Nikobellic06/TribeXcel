import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SchemeSelection from './pages/SchemeSelection';
import ApplicationForm from './pages/ApplicationForm';
import DocumentUpload from './pages/DocumentUpload';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schemes"
        element={
          <ProtectedRoute>
            <SchemeSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apply/:schemeId"
        element={
          <ProtectedRoute>
            <ApplicationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apply/:schemeId/documents"
        element={
          <ProtectedRoute>
            <DocumentUpload />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
