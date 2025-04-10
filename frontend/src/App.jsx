import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CapTable from './pages/CapTable';
import StockOptions from './pages/StockOptions';
import Reports from './pages/Reports';

// Layout components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <div className="app-container">
              <Navbar />
              <div className="content-container">
                <Sidebar />
                <main className="main-content">
                  <Dashboard />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="app-container">
              <Navbar />
              <div className="content-container">
                <Sidebar />
                <main className="main-content">
                  <Dashboard />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/cap-table" element={
          <ProtectedRoute>
            <div className="app-container">
              <Navbar />
              <div className="content-container">
                <Sidebar />
                <main className="main-content">
                  <CapTable />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/options" element={
          <ProtectedRoute>
            <div className="app-container">
              <Navbar />
              <div className="content-container">
                <Sidebar />
                <main className="main-content">
                  <StockOptions />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <div className="app-container">
              <Navbar />
              <div className="content-container">
                <Sidebar />
                <main className="main-content">
                  <Reports />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
