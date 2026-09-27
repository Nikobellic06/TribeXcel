import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReviewQueue from './pages/ReviewQueue';
import Merit from './pages/Merit';
import Analytics from './pages/Analytics';
import ApplicationDetail from './pages/ApplicationDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
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
        path="/queue"
        element={
          <ProtectedRoute>
            <ReviewQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/merit"
        element={
          <ProtectedRoute>
            <Merit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/application/:id"
        element={
          <ProtectedRoute>
            <ApplicationDetail />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
