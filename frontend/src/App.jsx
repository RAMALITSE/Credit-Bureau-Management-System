// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

// Lender pages
import LenderDashboard from './pages/lender/LenderDashboard';

// Consumer pages
import CreditReport from './pages/consumer/CreditReport';
import CreditScore from './pages/consumer/CreditScore';

function App() {
  const { isAuthenticated, userType, loading } = useAuth();

  // Redirect based on user type
  const getDashboardRoute = () => {
    if (!isAuthenticated) return '/login';
    
    switch (userType) {
      case 'admin':
        return '/admin/dashboard';
      case 'lender':
        return '/lender/dashboard';
      default:
        return '/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* Consumer routes */}
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute allowedRoles={['consumer']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute allowedRoles={['consumer', 'lender', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="credit-report" 
          element={
            <ProtectedRoute allowedRoles={['consumer']}>
              <CreditReport />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="credit-score" 
          element={
            <ProtectedRoute allowedRoles={['consumer']}>
              <CreditScore />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin routes */}
        <Route 
          path="admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Lender routes */}
        <Route 
          path="lender/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['lender']}>
              <LenderDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect to appropriate dashboard */}
        <Route path="redirect" element={<Navigate to={getDashboardRoute()} />} />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;