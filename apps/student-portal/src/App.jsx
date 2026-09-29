import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/ui/PageLoader';

/*
 * Every page is loaded on demand, so the landing page does not download the
 * application-form code (and vice versa). Keeps the first load light.
 */
const Landing = lazy(() => import('./pages/Landing'));
const SchemeDetail = lazy(() => import('./pages/SchemeDetail'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const SchemeSelection = lazy(() => import('./pages/SchemeSelection'));
const MyApplications = lazy(() => import('./pages/MyApplications'));
const Apply = lazy(() => import('./pages/apply/Apply'));
const Acknowledgement = lazy(() => import('./pages/Acknowledgement'));
const DigiLockerDevControl = lazy(() => import('./pages/dev/DigiLockerDevControl'));
const DigiLockerCallback = lazy(() => import('./pages/DigiLockerCallback'));
const DigiLockerWallet = lazy(() => import('./pages/DigiLockerWallet'));

const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

function App() {
  return (
    <Suspense fallback={<PageLoader full />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/schemes/:schemeId" element={<SchemeDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Developer Sandbox Control Route (Hidden from normal navigation) */}
        <Route path="/dev/digilocker" element={<DigiLockerDevControl />} />
        <Route path="/digilocker/callback" element={<DigiLockerCallback />} />

        <Route path="/dashboard" element={protect(<Dashboard />)} />
        <Route path="/digilocker-wallet" element={protect(<DigiLockerWallet />)} />
        <Route path="/wallet" element={protect(<DigiLockerWallet />)} />
        <Route path="/profile" element={protect(<Profile />)} />
        <Route path="/schemes" element={protect(<SchemeSelection />)} />
        <Route path="/applications" element={protect(<MyApplications />)} />
        <Route path="/applications/:id/acknowledgement" element={protect(<Acknowledgement />)} />
        <Route path="/apply/:schemeId" element={protect(<Apply />)} />
        <Route path="/apply/:schemeId/:step" element={protect(<Apply />)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
