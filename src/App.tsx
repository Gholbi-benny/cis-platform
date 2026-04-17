import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Messages from "./pages/Messages";
import TechnicalStatus from "./pages/TechnicalStatus";
import Profile from "./pages/Profile";

const getHomePage = (role?: string) => {
  switch (role) {
    case 'Directeur':
    case 'Chef de projet':
      return '/dashboard';
    case 'Équipe technique':
      return '/technical-status';
    case 'Commercial':
      return '/messages';
    default:
      return '/login';
  }
};

// Composant pour protéger les routes
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredPermission?: string }> = ({
  children,
  requiredPermission
}) => {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={getHomePage(user.role)} replace />;
  }

  return <>{children}</>;
};

// Layout pour les pages authentifiées
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-blue-600 text-white">
    <Navbar />
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 xl:p-10 max-w-7xl mx-auto flex items-center justify-center min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredPermission="view_dashboard">
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute requiredPermission="view_projects">
                  <AuthenticatedLayout>
                    <Projects />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute requiredPermission="view_tasks">
                  <AuthenticatedLayout>
                    <Tasks />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute requiredPermission="view_messages">
                  <AuthenticatedLayout>
                    <Messages />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/technical-status"
              element={
                <ProtectedRoute requiredPermission="update_tasks">
                  <AuthenticatedLayout>
                    <TechnicalStatus />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Profile />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;