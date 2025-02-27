// frontend/src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, userType } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    return <Navigate to="/unauthorized" />;
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;