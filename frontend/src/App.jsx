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
import Shareholders from './pages/Shareholders';

// Layout components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Layout wrapper for protected routes
const ProtectedLayout = ({ children }) => (
  <div className="app-container">
    <Navbar />
    <div className="content-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard route */}
        <Route path="/" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        {/* Cap Table routes - support both with and without hyphen */}
        <Route path="/cap-table" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <CapTable />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/captable" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <CapTable />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        {/* Shareholders route */}
        <Route path="/shareholders" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Shareholders />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        {/* Stock Options route */}
        <Route path="/options" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <StockOptions />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        {/* Reports route */}
        <Route path="/reports" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Reports />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        {/* Add missing routes for other features */}
        <Route path="/share-classes" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <div>Share Classes Page Coming Soon</div>
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/option-plans" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <div>Option Plans Page Coming Soon</div>
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/vesting-schedules" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <div>Vesting Schedules Page Coming Soon</div>
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/import" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <div>Import Data Page Coming Soon</div>
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <div>User Management Page Coming Soon</div>
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;