import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/common/Navigation';
import { KanbanPage } from './pages/KanbanPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TodosPage } from './pages/TodosPage';
import { SettingsPage } from './pages/SettingsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { EditorPage } from './pages/EditorPage';
import { InvitePage } from './pages/InvitePage';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore, useThemeStore, useSettingsStore } from './store';

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
  const { checkAuth, token } = useAuthStore();
  // Subscribe to theme store so theme changes trigger re-render
  useThemeStore();
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Load user settings when authenticated
  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token, fetchSettings]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/documents/invite/:token" element={
        <ProtectedRoute>
          <InvitePage />
        </ProtectedRoute>
      } />
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
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/documents/:id" element={<EditorPage />} />
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
