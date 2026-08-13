import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectBrief from './pages/ProjectBrief';

function App() {
  // Clear any legacy localStorage to ensure fresh session requirements
  React.useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(sessionStorage.getItem('token') || null);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const handleLoginSuccess = (userData, userToken) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', userToken);
    setUser(userData);
    setToken(userToken);
  };

  // Protected route helper wrapper
  const ProtectedRoute = ({ children }) => {
    if (!token || !user) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Client Route */}
        <Route path="/" element={<Navigate to="/project-brief" replace />} />
        <Route path="/project-brief" element={<ProjectBrief />} />

        {/* Private ADMIN Auth routes */}
        <Route 
          path="/admin/login" 
          element={
            token && user ? <Navigate to="/admin/dashboard" replace /> : (
              <Login onNavigate={() => window.location.pathname = '/admin/register'} onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />
        <Route 
          path="/admin/register" 
          element={<Navigate to="/admin/login" replace />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard user={user} token={token} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
