import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ApplicationPage from './pages/ApplicationPage';
import ProgrammesPage from './pages/ProgrammesPage';
import ProgrammeDetailPage from './pages/ProgrammeDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplications from './pages/AdminApplications';
import AdminRegistrations from './pages/AdminRegistrations';
import AdminStudents from './pages/AdminStudents';
import AdminAllocations from './pages/AdminAllocations';
import StudentDashboard from './pages/StudentDashboard';
import StudentRegistration from './pages/StudentRegistration';
import StudentModules from './pages/StudentModules';
import LecturerDashboard from './pages/LecturerDashboard';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useApp();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={currentUser ? <Navigate to={`/${currentUser.role}`} replace /> : <LoginPage />} />
          <Route path="/apply" element={<ApplicationPage />} />
          <Route path="/programmes" element={<ProgrammesPage />} />
          <Route path="/programmes/:slug" element={<ProgrammeDetailPage />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute role="admin"><AdminApplications /></ProtectedRoute>} />
          <Route path="/admin/registrations" element={<ProtectedRoute role="admin"><AdminRegistrations /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/allocations" element={<ProtectedRoute role="admin"><AdminAllocations /></ProtectedRoute>} />

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/register" element={<ProtectedRoute role="student"><StudentRegistration /></ProtectedRoute>} />
          <Route path="/student/modules" element={<ProtectedRoute role="student"><StudentModules /></ProtectedRoute>} />

          {/* Lecturer */}
          <Route path="/lecturer" element={<ProtectedRoute role="lecturer"><LecturerDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
