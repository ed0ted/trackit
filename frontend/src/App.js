import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import YourWork from './pages/YourWork';
import ProjectLayout from './pages/ProjectLayout';
import BoardPage from './pages/BoardPage';
import IssuesPage from './pages/IssuesPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/admin/AdminPage';

// layout for logged in pages (navbar on top)
function AppLayout() {
  return (
    <PrivateRoute>
      <Navbar />
      <main className="main">
        <Outlet />
      </main>
    </PrivateRoute>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/your-work" element={<YourWork />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/projects/:projectId" element={<ProjectLayout />}>
          <Route index element={<Navigate to="board" replace />} />
          <Route path="board" element={<BoardPage />} />
          <Route path="issues" element={<IssuesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="page"><h2>404 - Page not found</h2></div>} />
    </Routes>
  );
}

export default App;
