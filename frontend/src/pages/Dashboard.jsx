// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/me`);
        setProfile(response.data.data.profile);
      } catch (err) {
        setError('Failed to load your credit profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.firstName}</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Credit Overview</h2>
          
          <div className="flex justify-center items-center mb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-32 h-32 stroke-current">
                <path
                  className="stroke-gray-200"
                  fill="none"
                  strokeWidth="3"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    profile.creditScore >= 740
                      ? 'stroke-green-500' 
                      : profile.creditScore >= 670
                      ? 'stroke-blue-500'
                      : profile.creditScore >= 580
                      ? 'stroke-yellow-500'
                      : 'stroke-red-500'
                  }`}
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${(profile.creditScore - 300) / 550 * 100}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="text-xl fill-current font-semibold" textAnchor="middle">
                  {profile.creditScore}
                </text>
              </svg>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Credit Score:</span>
            <span className="font-semibold">{profile.creditScore}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Category:</span>
            <span 
              className={`font-semibold ${
                profile.creditScore >= 740
                  ? 'text-green-600' 
                  : profile.creditScore >= 670
                  ? 'text-blue-600'
                  : profile.creditScore >= 580
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {profile.creditScore >= 800 
                ? 'Excellent' 
                : profile.creditScore >= 740
                ? 'Very Good'
                : profile.creditScore >= 670
                ? 'Good'
                : profile.creditScore >= 580
                ? 'Fair'
                : 'Poor'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <span className={`font-semibold ${
              profile.status === 'active' 
                ? 'text-green-600' 
                : profile.status === 'frozen'
                ? 'text-blue-600'
                : 'text-yellow-600'
            }`}>
              {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
            </span>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Link 
              to="/credit-score" 
              className="text-blue-600 hover:text-blue-800"
            >
              View Details
            </Link>
            <Link 
              to="/credit-report"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              View Report
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          
          <div className="space-y-4">
            <Link 
              to="/credit-report"
              className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
            >
              <div className="flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </span>
                Generate Credit Report
              </div>
            </Link>
            
            {profile.status === 'active' ? (
              <Link 
                to="/profiles/freeze"
                className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </span>
                  Freeze Credit Profile
                </div>
              </Link>
            ) : (
              <Link 
                to="/profiles/unfreeze"
                className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                    </svg>
                  </span>
                  Unfreeze Credit Profile
                </div>
              </Link>
            )}
            
            {!profile.fraudAlert ? (
              <Link 
                to="/profiles/fraud-alert"
                className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </span>
                  Set Fraud Alert
                </div>
              </Link>
            ) : (
              <Link 
                to="/profiles/remove-fraud-alert"
                className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </span>
                  Remove Fraud Alert
                </div>
              </Link>
            )}
            
            <Link 
              to="/disputes"
              className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-4 rounded"
            >
              <div className="flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </span>
                View Disputes
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          
          <div className="space-y-4">
            {profile.scoreHistory && profile.scoreHistory.length > 0 ? (
              profile.scoreHistory.slice(0, 3).map((item, index) => (
                <div key={index} className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Score Update</span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.calculatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-semibold">{item.score}</span>
                    <span className={`text-sm ${
                      index < profile.scoreHistory.length - 1 && 
                      item.score > profile.scoreHistory[index + 1].score
                        ? 'text-green-600'
                        : item.score < profile.scoreHistory[index + 1].score
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      {index < profile.scoreHistory.length - 1 ? (
                        item.score > profile.scoreHistory[index + 1].score
                          ? `+${item.score - profile.scoreHistory[index + 1].score}`
                          : item.score < profile.scoreHistory[index + 1].score
                          ? `-${profile.scoreHistory[index + 1].score - item.score}`
                          : 'No change'
                      ) : 'Initial score'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent score history available</p>
            )}
          </div>
          
          <div className="mt-4">
            <Link 
              to="/credit-score" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All Activity
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Credit Factors</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Payment History</span>
                <span className="text-gray-500 text-sm">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Credit Utilization</span>
                <span className="text-gray-500 text-sm">30%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Credit Age</span>
                <span className="text-gray-500 text-sm">15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Account Mix</span>
                <span className="text-gray-500 text-sm">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Recent Inquiries</span>
                <span className="text-gray-500 text-sm">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Link 
              to="/credit-factors" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Learn More About Credit Factors
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tips to Improve</h2>
          
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2 mt-1 text-green-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </span>
              Pay all bills on time to maintain a positive payment history
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1 text-green-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </span>
              Keep credit card balances below 30% of your credit limit
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1 text-green-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </span>
              Maintain a mix of different types of credit accounts
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1 text-green-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </span>
              Limit applications for new credit to avoid hard inquiries
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1 text-green-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </span>
              Check your credit report regularly for errors and dispute any inaccuracies
            </li>
          </ul>
          
          <div className="mt-4">
            <Link 
              to="/credit-education" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              More Credit Tips
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;