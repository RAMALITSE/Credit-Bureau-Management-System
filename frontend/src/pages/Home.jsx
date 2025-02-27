// frontend/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated, userType } = useAuth();

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to the Credit Bureau Management System
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          A comprehensive system for managing credit information, reports, and scores.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {userType === 'consumer' && (
                <Link
                  to="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Go to Dashboard
                </Link>
              )}
              {userType === 'lender' && (
                <Link
                  to="/lender/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Go to Lender Dashboard
                </Link>
              )}
              {userType === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Go to Admin Dashboard
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">For Consumers</h2>
          <p className="text-gray-600 mb-4">
            Monitor your credit profile, check your credit score, and manage dispute resolutions.
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li>View your credit report</li>
            <li>Monitor your credit score</li>
            <li>File disputes</li>
            <li>Set fraud alerts</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">For Lenders</h2>
          <p className="text-gray-600 mb-4">
            Access credit reports, perform credit checks, and manage account information.
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li>Request credit reports</li>
            <li>Submit account updates</li>
            <li>Respond to disputes</li>
            <li>Add payment information</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">For Administrators</h2>
          <p className="text-gray-600 mb-4">
            Manage the system, oversee disputes, and generate analytics and reports.
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li>User management</li>
            <li>Dispute resolution</li>
            <li>System analytics</li>
            <li>Report generation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;