// frontend/src/pages/lender/LenderDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LenderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    delinquentAccounts: 0,
    closedAccounts: 0,
    totalDisputes: 0,
    pendingDisputes: 0,
    totalInquiries: 0,
    totalReports: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real application, you would fetch actual statistics from the backend
    // This is a placeholder for demonstration purposes
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls
        setTimeout(() => {
          setStats({
            totalAccounts: 142,
            activeAccounts: 120,
            delinquentAccounts: 8,
            closedAccounts: 14,
            totalDisputes: 5,
            pendingDisputes: 2,
            totalInquiries: 64,
            totalReports: 48
          });
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Lender Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user.firstName}. Here's an overview of your accounts and activities.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-gray-500 text-sm mb-1">Total Accounts</div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalAccounts}</div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Last 30 days</span>
            <span className="text-sm text-green-600">+8 (+6%)</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-gray-500 text-sm mb-1">Active Accounts</div>
          <div className="text-3xl font-bold text-green-600">{stats.activeAccounts}</div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Of total accounts</span>
            <span className="text-sm font-medium">{Math.round((stats.activeAccounts / stats.totalAccounts) * 100)}%</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-gray-500 text-sm mb-1">Delinquent Accounts</div>
          <div className="text-3xl font-bold text-red-600">{stats.delinquentAccounts}</div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Of total accounts</span>
            <span className="text-sm font-medium">{Math.round((stats.delinquentAccounts / stats.totalAccounts) * 100)}%</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-gray-500 text-sm mb-1">Pending Disputes</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pendingDisputes}</div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Require attention</span>
            <Link to="/lender/disputes" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Account Performance</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">Monthly</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded">Quarterly</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded">Yearly</button>
            </div>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            {/* In a real app, you would use a chart library like Chart.js or Recharts */}
            <div className="text-center text-gray-500">
              [Account Performance Chart Placeholder]
              <p>Monthly performance of your accounts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Account Status</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Current</span>
                <span className="text-green-600 font-medium">{stats.activeAccounts}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.activeAccounts / stats.totalAccounts) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Delinquent</span>
                <span className="text-red-600 font-medium">{stats.delinquentAccounts}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(stats.delinquentAccounts / stats.totalAccounts) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Closed</span>
                <span className="text-gray-600 font-medium">{stats.closedAccounts}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full" 
                  style={{ width: `${(stats.closedAccounts / stats.totalAccounts) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Link 
              to="/lender/accounts" 
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Manage Accounts
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link 
              to="/lender/activity" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="border-b pb-3">
              <div className="flex justify-between items-center">
                <div className="font-medium">New Account Added</div>
                <div className="text-sm text-gray-500">2 days ago</div>
              </div>
              <div className="text-gray-600 text-sm">Personal Loan for John Smith</div>
            </div>
            
            <div className="border-b pb-3">
              <div className="flex justify-between items-center">
                <div className="font-medium">Payment Reported</div>
                <div className="text-sm text-gray-500">3 days ago</div>
              </div>
              <div className="text-gray-600 text-sm">Credit Card payment for Jane Doe</div>
            </div>
            
            <div className="border-b pb-3">
              <div className="flex justify-between items-center">
                <div className="font-medium">Account Status Updated</div>
                <div className="text-sm text-gray-500">5 days ago</div>
              </div>
              <div className="text-gray-600 text-sm">Auto Loan for Michael Johnson marked as Current</div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <div className="font-medium">Dispute Received</div>
                <div className="text-sm text-gray-500">1 week ago</div>
              </div>
              <div className="text-gray-600 text-sm">Sarah Williams is disputing balance on Mortgage</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          
          <div className="space-y-3">
            <Link 
              to="/lender/accounts/new"
              className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
            >
              <div className="flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </span>
                Add New Account
              </div>
            </Link>
            
            <Link 
              to="/lender/reports/request"
              className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
            >
              <div className="flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </span>
                Request Credit Report
              </div>
            </Link>
            
            <Link 
              to="/lender/accounts/update"
              className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
            >
              <div className="flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </span>
                Update Account Information
              </div>
            </Link>
            
            <Link 
              to="/lender/disputes"
              className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
            >
              <div className="flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </span>
                Respond to Disputes ({stats.pendingDisputes})
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;