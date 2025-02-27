// frontend/src/pages/consumer/CreditScore.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CreditScore = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/me`);
      setProfile(response.data.data.profile);
    } catch (err) {
      setError('Failed to load credit profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recalculateScore = async () => {
    try {
      setRecalculating(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/profiles/recalculate`);
      setProfile(response.data.data.profile);
    } catch (err) {
      setError('Failed to recalculate credit score');
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const getScoreCategory = (score) => {
    if (score >= 800) return 'Excellent';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  const getScoreCategoryColor = (score) => {
    if (score >= 740) return 'text-green-600';
    if (score >= 670) return 'text-blue-600';
    if (score >= 580) return 'text-yellow-600';
    return 'text-red-600';
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Credit Score</h1>
        <button
          onClick={recalculateScore}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={recalculating}
        >
          {recalculating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Recalculating...
            </span>
          ) : (
            'Recalculate Score'
          )}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">Your Credit Score</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center mb-8">
              <div className="w-48 h-48 relative mb-6 md:mb-0 md:mr-10">
                <svg viewBox="0 0 36 36" className="w-48 h-48">
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
                  <text x="18" y="18" className="text-4xl fill-current font-bold" textAnchor="middle" dominantBaseline="middle">
                    {profile.creditScore}
                  </text>
                </svg>
              </div>
              
              <div>
                <div className="text-center md:text-left mb-4">
                  <div className="text-gray-600 mb-1">Your score is:</div>
                  <div className={`text-2xl font-bold ${getScoreCategoryColor(profile.creditScore)}`}>
                    {getScoreCategory(profile.creditScore)}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className={`h-2.5 rounded-full ${
                      profile.creditScore >= 740
                        ? 'bg-green-500' 
                        : profile.creditScore >= 670
                        ? 'bg-blue-500'
                        : profile.creditScore >= 580
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`} 
                    style={{ width: `${(profile.creditScore - 300) / 550 * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span>300</span>
                  <span>580</span>
                  <span>670</span>
                  <span>740</span>
                  <span>850</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Very Good</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Score History</h3>
              
              {profile.scoreHistory && profile.scoreHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {profile.scoreHistory.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.calculatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {item.score}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {index < profile.scoreHistory.length - 1 ? (
                              <span className={
                                item.score > profile.scoreHistory[index + 1].score
                                  ? 'text-green-600'
                                  : item.score < profile.scoreHistory[index + 1].score
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                              }>
                                {item.score > profile.scoreHistory[index + 1].score
                                  ? `+${item.score - profile.scoreHistory[index + 1].score}`
                                  : item.score < profile.scoreHistory[index + 1].score
                                  ? `-${profile.scoreHistory[index + 1].score - item.score}`
                                  : 'No change'}
                              </span>
                            ) : (
                              <span className="text-gray-500">Initial</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.score >= 740
                                ? 'bg-green-100 text-green-800' 
                                : item.score >= 670
                                ? 'bg-blue-100 text-blue-800'
                                : item.score >= 580
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {getScoreCategory(item.score)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No score history available yet</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Credit Factors</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Payment History</span>
                  <span className="text-gray-500 text-sm">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Always pay your bills on time to maintain a good payment history.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Credit Utilization</span>
                  <span className="text-gray-500 text-sm">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Keep your credit card balances below 30% of your credit limits.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Credit Age</span>
                  <span className="text-gray-500 text-sm">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Longer credit history generally improves your credit score.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Account Mix</span>
                  <span className="text-gray-500 text-sm">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  A variety of credit account types can improve your score.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Recent Inquiries</span>
                  <span className="text-gray-500 text-sm">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Limit applications for new credit to avoid multiple hard inquiries.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            
            <div className="space-y-3">
              <Link 
                to="/credit-report"
                className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-3 rounded"
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
              
              <Link 
                to="/disputes"
                className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-3 rounded"
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </span>
                  Dispute Information
                </div>
              </Link>
              
              <Link 
                to="/credit-education"
                className="block w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-3 rounded"
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </span>
                  Credit Education
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditScore;