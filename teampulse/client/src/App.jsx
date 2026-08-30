import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import TaskDetail from './pages/TaskDetail.jsx';
import MyStatus from './pages/MyStatus.jsx';
import TeamBoard from './pages/TeamBoard.jsx';
import Profile from './pages/Profile.jsx';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Loading…
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;

  const protectedElement = (page) => (
    <ProtectedRoute>
      <Layout>{page}</Layout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={protectedElement(<Dashboard />)} />
      <Route path="/tasks" element={protectedElement(<Tasks />)} />
      <Route path="/tasks/:id" element={protectedElement(<TaskDetail />)} />
      <Route path="/status" element={protectedElement(<MyStatus />)} />
      <Route path="/team" element={protectedElement(<TeamBoard />)} />
      <Route path="/profile" element={protectedElement(<Profile />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
