// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    consumers: 0,
    lenders: 0,
    activeProfiles: 0,
    frozenProfiles: 0,
    disputedProfiles: 0,
    avgCreditScore: 0,
    totalAccounts: 0,
    totalDisputes: 0,
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
            users: 186,
            consumers: 145,
            lenders: 35,
            activeProfiles: 128,
            frozenProfiles: 12,
            disputedProfiles: 5,
            avgCreditScore: 702,
            totalAccounts: 478,
            totalDisputes: 23,
            totalReports: 312
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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">User Statistics</h2>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="font-semibold text-lg">{stats.users}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Consumers</span>
              <span className="font-semibold">{stats.consumers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lenders</span>
              <span className="font-semibold">{stats.lenders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Admins</span>
              <span className="font-semibold">{stats.users - stats.consumers - stats.lenders}</span>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/users" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Manage Users
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Profile Statistics</h2>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Profiles</span>
              <span className="font-semibold">{stats.activeProfiles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Frozen Profiles</span>
              <span className="font-semibold">{stats.frozenProfiles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Disputed Profiles</span>
              <span className="font-semibold">{stats.disputedProfiles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Credit Score</span>
              <span className="font-semibold">{stats.avgCreditScore}</span>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/profiles" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Manage Profiles
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Activity Statistics</h2>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Accounts</span>
              <span className="font-semibold">{stats.totalAccounts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Disputes</span>
              <span className="font-semibold">{stats.totalDisputes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Generated Reports</span>
              <span className="font-semibold">{stats.totalReports}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last 24 Hours Activity</span>
              <span className="font-semibold">24</span>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/activity" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View Activity Log
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Users</h2>
            <Link 
              to="/admin/users" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Consumer
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 days ago</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900">View</a>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Jane Smith</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Lender
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 days ago</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900">View</a>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Robert Johnson</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Consumer
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5 days ago</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900">View</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Disputes</h2>
            <Link 
              to="/admin/disputes" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                  <td className="px-6 py-4 whitespace-nowrap">Incorrect Balance</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900">Resolve</a>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Sarah Williams</td>
                  <td className="px-6 py-4 whitespace-nowrap">Not My Account</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Investigating
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900">Resolve</a>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Michael Brown</td>
                  <td className="px-6 py-4 whitespace-nowrap">Already Paid</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Resolved
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900">View</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;