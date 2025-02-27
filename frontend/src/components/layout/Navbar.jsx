// frontend/src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, user, logout, userType } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold">
            Credit Bureau System
          </Link>

          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            
            {isAuthenticated ? (
              <>
                {userType === 'consumer' && (
                  <>
                    <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                    <Link to="/credit-report" className="hover:text-blue-200">Credit Report</Link>
                    <Link to="/credit-score" className="hover:text-blue-200">Credit Score</Link>
                  </>
                )}
                
                {userType === 'lender' && (
                  <Link to="/lender/dashboard" className="hover:text-blue-200">Dashboard</Link>
                )}
                
                {userType === 'admin' && (
                  <Link to="/admin/dashboard" className="hover:text-blue-200">Dashboard</Link>
                )}
                
                <Link to="/profile" className="hover:text-blue-200">Profile</Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <Link to="/" className="block hover:text-blue-200">Home</Link>
            
            {isAuthenticated ? (
              <>
                {userType === 'consumer' && (
                  <>
                    <Link to="/dashboard" className="block hover:text-blue-200">Dashboard</Link>
                    <Link to="/credit-report" className="block hover:text-blue-200">Credit Report</Link>
                    <Link to="/credit-score" className="block hover:text-blue-200">Credit Score</Link>
                  </>
                )}
                
                {userType === 'lender' && (
                  <Link to="/lender/dashboard" className="block hover:text-blue-200">Dashboard</Link>
                )}
                
                {userType === 'admin' && (
                  <Link to="/admin/dashboard" className="block hover:text-blue-200">Dashboard</Link>
                )}
                
                <Link to="/profile" className="block hover:text-blue-200">Profile</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:text-blue-200">Login</Link>
                <Link
                  to="/register"
                  className="block bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;