import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Loading } from './components/ui/States';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Applications = lazy(() => import('./pages/Applications'));
const ReviewQueue = lazy(() => import('./pages/ReviewQueue'));
const ApplicationDetail = lazy(() => import('./pages/ApplicationDetail'));
const Merit = lazy(() => import('./pages/Merit'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Reports = lazy(() => import('./pages/Reports'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

function App() {
  return (
    <Suspense fallback={<Loading className="min-h-screen" />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={guard(<Dashboard />)} />
        <Route path="/queue" element={guard(<ReviewQueue />)} />
        <Route path="/applications" element={guard(<Applications />)} />
        <Route path="/applications/:view" element={guard(<Applications />)} />
        <Route path="/application/:id" element={guard(<ApplicationDetail />)} />
        <Route path="/merit" element={guard(<Merit />)} />
        <Route path="/reports" element={guard(<Reports />)} />
        <Route path="/audit-logs" element={guard(<AuditLogs />)} />
        <Route path="/analytics" element={guard(<Analytics />)} />
        <Route path="/settings" element={guard(<Settings />)} />
        <Route path="*" element={guard(<NotFound />)} />
      </Routes>
    </Suspense>
  );
}

export default App;
