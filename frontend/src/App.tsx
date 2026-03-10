import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from './components/common/Navigation';
import { KanbanPage } from './pages/KanbanPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TodosPage } from './pages/TodosPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<KanbanPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/todos" element={<TodosPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
