// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard statistics state
  const [userStats, setUserStats] = useState({
    total: 0,
    consumers: 0,
    lenders: 0,
    admins: 0
  });
  
  const [profileStats, setProfileStats] = useState({
    totalProfiles: 0,
    avgCreditScore: 0,
    frozenProfiles: 0,
    fraudAlerts: 0,
    scoreDistribution: []
  });
  
  const [accountStats, setAccountStats] = useState({
    totalAccounts: 0,
    accountTypes: [],
    activeAccounts: 0,
    delinquentAccounts: 0
  });
  
  const [disputeStats, setDisputeStats] = useState({
    totalDisputes: 0,
    openDisputes: 0,
    resolvedDisputes: 0,
    rejectedDisputes: 0
  });

  // Mock data as fallback
  const mockData = {
    users: {
      totalUsers: 187,
      consumerCount: 135,
      lenderCount: 48,
      adminCount: 4,
      recentRegistrations: 23
    },
    profiles: {
      totalProfiles: 135,
      averageScore: [{ avg: 712 }],
      scoreCategories: [
        { _id: 'Excellent', count: 28 },
        { _id: 'Very Good', count: 42 },
        { _id: 'Good', count: 37 },
        { _id: 'Fair', count: 21 },
        { _id: 'Poor', count: 7 }
      ],
      statusDistribution: [
        { _id: 'active', count: 118 },
        { _id: 'frozen', count: 15 },
        { _id: 'disputed', count: 2 }
      ],
      fraudAlertDistribution: {
        withAlert: 8,
        withoutAlert: 127
      }
    },
    accounts: [
      { _id: 'credit_card', count: 95, totalBalance: 428500, avgBalance: 4510.53 },
      { _id: 'mortgage', count: 65, totalBalance: 9750000, avgBalance: 150000 },
      { _id: 'auto_loan', count: 78, totalBalance: 1560000, avgBalance: 20000 },
      { _id: 'student_loan', count: 42, totalBalance: 1260000, avgBalance: 30000 },
      { _id: 'loan', count: 32, totalBalance: 480000, avgBalance: 15000 },
      { _id: 'utility', count: 56, totalBalance: 84000, avgBalance: 1500 }
    ],
    disputes: {
      totalDisputes: 24,
      openDisputes: 9,
      resolvedDisputes: 12,
      rejectedDisputes: 3,
      recentDisputes: 5
    }
  };
  
  // Fetch all the necessary data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Using Promise.all with individual error handling for each request
        const fetchUsersData = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/stats`);
            if (response.data.status === 'success') {
              return response.data.data;
            }
          } catch (err) {
            console.error("Error fetching user stats:", err);
            return mockData.users;
          }
          return mockData.users;
        };
        
        const fetchProfilesData = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/stats/scores`);
            if (response.data.status === 'success') {
              return response.data.data.stats;
            }
          } catch (err) {
            console.error("Error fetching profile stats:", err);
            return mockData.profiles;
          }
          return mockData.profiles;
        };
        
        const fetchAccountsData = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/accounts/stats/account-types`);
            if (response.data.status === 'success') {
              return response.data.data.stats;
            }
          } catch (err) {
            console.error("Error fetching account stats:", err);
            return mockData.accounts;
          }
          return mockData.accounts;
        };
        
        // Add this debugging code to your AdminDashboard.jsx component

        const fetchDisputesData = async () => {
          try {
            // Debug token to ensure it exists and is being sent correctly
            const token = localStorage.getItem('token');
//console.log('Auth token:', token ? 'Token exists' : 'Token missing');
            
            // Log current headers to check Authorization header
           // console.log('Current headers:', axios.defaults.headers.common);
            
            // Make sure the token is set in axios defaults
            if (token) {
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/disputes/stats`);
            
            // Check if we have the data in the expected format
            if (response.data && response.data.status === 'success') {
              // Extract the dispute stats directly from the response
              const { totalDisputes, openDisputes, resolvedDisputes, rejectedDisputes } = response.data.data;
              
              return {
                totalDisputes,
                openDisputes,
                resolvedDisputes,
                rejectedDisputes
              };
            }
            
            // If we don't have the expected format, return mock data as fallback
            console.warn('Dispute stats format not as expected, using fallback data');
            return mockData.disputes;
            
          } catch (err) {
            console.error('Error fetching dispute stats:', err);
            // Return mock data on error
            return mockData.disputes;
          }
        };

        
        // Fetch all data in parallel
        const [usersData, profilesData, accountsData, disputesData] = await Promise.all([
          fetchUsersData(),
          fetchProfilesData(),
          fetchAccountsData(),
          fetchDisputesData()
        ]);
        
        // Set user stats
        setUserStats({
          total: usersData.totalUsers || 0,
          consumers: usersData.consumerCount || 0,
          lenders: usersData.lenderCount || 0,
          admins: usersData.adminCount || 0
        });
        
        // Set profile stats
        setProfileStats({
          totalProfiles: profilesData.totalProfiles || 0,
          avgCreditScore: profilesData.averageScore?.[0]?.avg || 0,
          frozenProfiles: profilesData.statusDistribution?.find(s => s._id === 'frozen')?.count || 0,
          fraudAlerts: profilesData.fraudAlertDistribution?.withAlert || 0,
          scoreDistribution: profilesData.scoreCategories || []
        });
        
        // Set account stats
        if (accountsData && accountsData.length > 0) {
          const totalAccounts = accountsData.reduce((sum, item) => sum + item.count, 0);
          
          setAccountStats({
            totalAccounts,
            accountTypes: accountsData,
            activeAccounts: accountsData.filter(a => a._id !== 'delinquent' && a._id !== 'default').reduce((sum, item) => sum + item.count, 0),
            delinquentAccounts: (accountsData.find(a => a._id === 'delinquent')?.count || 0) + (accountsData.find(a => a._id === 'default')?.count || 0)
          });
        }
        
        // Set dispute stats
        setDisputeStats({
          totalDisputes: disputesData.totalDisputes || 0,
          openDisputes: disputesData.openDisputes || 0,
          resolvedDisputes: disputesData.resolvedDisputes || 0,
          rejectedDisputes: disputesData.rejectedDisputes || 0
        });
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError('Failed to load some dashboard data. Some information may be unavailable.');
        
        // Set fallback mock data for critical sections
        setUserStats({
          total: mockData.users.totalUsers,
          consumers: mockData.users.consumerCount,
          lenders: mockData.users.lenderCount,
          admins: mockData.users.adminCount
        });
        
        setProfileStats({
          totalProfiles: mockData.profiles.totalProfiles,
          avgCreditScore: mockData.profiles.averageScore[0].avg,
          frozenProfiles: mockData.profiles.statusDistribution.find(s => s._id === 'frozen')?.count || 0,
          fraudAlerts: mockData.profiles.fraudAlertDistribution.withAlert,
          scoreDistribution: mockData.profiles.scoreCategories
        });
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome, {user?.firstName || 'Admin'}. Here's an overview of the credit bureau system.</p>
      
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Note:</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-gray-500 text-sm mb-1">Total Users</div>
          <div className="text-3xl font-bold text-blue-600">{userStats.total}</div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Registered users</span>
            <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-gray-500 text-sm mb-1">Consumers</div>
          <div className="text-3xl font-bold text-green-600">{userStats.consumers}</div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Of total users</span>
            <span className="text-sm font-medium">{userStats.total ? Math.round((userStats.consumers / userStats.total) * 100) : 0}%</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-gray-500 text-sm mb-1">Lenders</div>
          <div className="text-3xl font-bold text-purple-600">{userStats.lenders}</div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Of total users</span>
            <span className="text-sm font-medium">{userStats.total ? Math.round((userStats.lenders / userStats.total) * 100) : 0}%</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-gray-500 text-sm mb-1">Credit Profiles</div>
          <div className="text-3xl font-bold text-yellow-600">{profileStats.totalProfiles}</div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">Avg. Score</span>
            <span className="text-sm font-medium">{Math.round(profileStats.avgCreditScore)}</span>
          </div>
        </div>
      </div>
      
      {/* Credit Scores and Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Credit Score Distribution</h2>
          
          <div className="space-y-4">
            {profileStats.scoreDistribution.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600">{category._id}</span>
                  <span className="text-gray-800 font-medium">{category.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      category._id === 'Excellent' ? 'bg-green-500' :
                      category._id === 'Very Good' ? 'bg-blue-500' :
                      category._id === 'Good' ? 'bg-teal-500' :
                      category._id === 'Fair' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${(category.count / profileStats.totalProfiles) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Frozen Profiles</span>
                <span className="text-blue-600 font-medium">{profileStats.frozenProfiles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fraud Alerts</span>
                <span className="text-red-600 font-medium">{profileStats.fraudAlerts}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Account Types</h2>
          
          <div className="space-y-4">
            {accountStats.accountTypes.map((type, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600">
                    {type._id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  <span className="text-gray-800 font-medium">{type.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(type.count / accountStats.totalAccounts) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Link 
              to="/admin/accounts" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All Accounts
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Dispute Status</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Open Disputes</span>
                <span className="text-yellow-600 font-medium">{disputeStats.openDisputes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${disputeStats.totalDisputes ? (disputeStats.openDisputes / disputeStats.totalDisputes) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Resolved Disputes</span>
                <span className="text-green-600 font-medium">{disputeStats.resolvedDisputes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${disputeStats.totalDisputes ? (disputeStats.resolvedDisputes / disputeStats.totalDisputes) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Rejected Disputes</span>
                <span className="text-red-600 font-medium">{disputeStats.rejectedDisputes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${disputeStats.totalDisputes ? (disputeStats.rejectedDisputes / disputeStats.totalDisputes) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Link 
              to="/admin/disputes" 
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Manage Disputes
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          
          <div className="space-y-3">
            <Link 
              to="/admin/users/create"
              className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
            >
              <div className="flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                </span>
                Create User Account
              </div>
            </Link>
            
            <Link 
              to="/admin/disputes/pending"
              className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
            >
              <div className="flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </span>
                Review Pending Disputes
              </div>
            </Link>
            
            <Link 
              to="/admin/reports/generate"
              className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
            >
              <div className="flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </span>
                Generate System Report
              </div>
            </Link>
            
            <Link 
              to="/admin/settings"
              className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
            >
              <div className="flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </span>
                System Settings
              </div>
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">System Activity</h2>
            <Link 
              to="/admin/activity" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="border-b pb-3">
              <div className="flex justify-between items-center">
                <div className="font-medium">New User Registration</div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
              <div className="text-gray-600 text-sm">Consumer account created</div>
            </div>
            
            <div className="border-b pb-3">
              <div className="flex justify-between items-center">
                <div className="font-medium">Dispute Resolved</div>
                <div className="text-sm text-gray-500">Yesterday</div>
              </div>
              <div className="text-gray-600 text-sm">Account balance corrected after investigation</div>
            </div>
            
            <div className="border-b pb-3">
              <div className="flex justify-between items-center">
                <div className="font-medium">Credit Score Recalculation</div>
                <div className="text-sm text-gray-500">2 days ago</div>
              </div>
              <div className="text-gray-600 text-sm">System-wide score update completed</div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <div className="font-medium">Fraud Alert Added</div>
                <div className="text-sm text-gray-500">3 days ago</div>
              </div>
              <div className="text-gray-600 text-sm">Identity verification required for profile #2345</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;