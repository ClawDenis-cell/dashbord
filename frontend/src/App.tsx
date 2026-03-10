import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/common/Navigation';
import { KanbanPage } from './pages/KanbanPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TodosPage } from './pages/TodosPage';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore, useThemeStore } from './store';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 rounded-full mx-auto mb-4"
               style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { checkAuth } = useAuthStore();
  const { isDark } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    if (isDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
              <Navigation />
              <main className="max-w-7xl mx-auto px-4 py-6">
                <Routes>
                  <Route path="/" element={<KanbanPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/todos" element={<TodosPage />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
