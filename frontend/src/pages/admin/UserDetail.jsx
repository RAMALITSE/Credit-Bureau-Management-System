// frontend/src/pages/admin/UserDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user data
        const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`);
        
        if (userResponse.data.status === 'success') {
          setUser(userResponse.data.data.user);
          
          // If user is a consumer, also fetch their credit profile and accounts
          if (userResponse.data.data.user.userType === 'consumer') {
            try {
              // Fetch credit profile
              const profileResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/profiles/id/${id}`
              );
              
              if (profileResponse.data.status === 'success') {
                setProfile(profileResponse.data.data.profile);
                
                // Fetch accounts associated with this profile
                try {
                  const accountsResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL}/accounts/admin?profileId=${profileResponse.data.data.profile._id}`
                  );
                  
                  if (accountsResponse.data.status === 'success') {
                    setAccounts(accountsResponse.data.data.accounts);
                  }
                } catch (accountErr) {
                  console.error('Error fetching accounts:', accountErr);
                }
              }
            } catch (profileErr) {
              console.error('Error fetching profile:', profileErr);
            }
          }
        } else {
          setError('Failed to load user details: Unexpected response format');
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(`Failed to load user details: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const handleFreezeProfile = async () => {
    if (!profile) return;
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/profiles/${profile._id}/freeze`);
      // Refresh profile data
      const profileResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/id/${id}`);
      setProfile(profileResponse.data.data.profile);
    } catch (err) {
      console.error('Error freezing profile:', err);
      alert(`Failed to freeze profile: ${err.response?.data?.message || err.message}`);
    }
  };
  
  const handleUnfreezeProfile = async () => {
    if (!profile) return;
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/profiles/${profile._id}/unfreeze`);
      // Refresh profile data
      const profileResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profiles/id/${id}`);
      setProfile(profileResponse.data.data.profile);
    } catch (err) {
      console.error('Error unfreezing profile:', err);
      alert(`Failed to unfreeze profile: ${err.response?.data?.message || err.message}`);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}`);
      navigate('/admin/users', { replace: true });
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(`Failed to delete user: ${err.response?.data?.message || err.message}`);
    }
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
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <div className="mt-4">
          <Link
            to="/admin/users"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
        <p className="text-gray-600 mb-6">The requested user could not be found.</p>
        <Link
          to="/admin/users"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Details</h1>
        <div className="space-x-2">
          <Link
            to={`/admin/users/${id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit User
          </Link>
          <button
            onClick={handleDeleteUser}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete User
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          
          <div className="mb-4 flex justify-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-gray-600">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">Name</div>
            <div className="font-medium">{user.firstName} {user.lastName}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">Email</div>
            <div className="font-medium">{user.email}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">User Type</div>
            <div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                user.userType === 'consumer' 
                  ? 'bg-blue-100 text-blue-800'
                  : user.userType === 'lender'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">Phone</div>
            <div>{user.phoneNumber}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">Date of Birth</div>
            <div>{new Date(user.dateOfBirth).toLocaleDateString()}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">National ID</div>
            <div>{user.nationalId}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">Created At</div>
            <div>{new Date(user.createdAt).toLocaleString()}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600">Last Login</div>
            <div>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</div>
          </div>
        </div>
        
        {/* Address and Employment Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Address</h3>
            <div className="mb-2">
              <div className="text-sm text-gray-600">Street</div>
              <div>{user.address?.street || 'N/A'}</div>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-600">City</div>
              <div>{user.address?.city || 'N/A'}</div>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-600">State/Province</div>
              <div>{user.address?.state || 'N/A'}</div>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-600">Postal Code</div>
              <div>{user.address?.postalCode || 'N/A'}</div>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-600">Country</div>
              <div>{user.address?.country || 'N/A'}</div>
            </div>
          </div>
          
          {user.userType === 'consumer' && user.employmentInfo && (
            <div>
              <h3 className="text-lg font-medium mb-2">Employment Information</h3>
              <div className="mb-2">
                <div className="text-sm text-gray-600">Employer</div>
                <div>{user.employmentInfo?.employer || 'N/A'}</div>
              </div>
              <div className="mb-2">
                <div className="text-sm text-gray-600">Position</div>
                <div>{user.employmentInfo?.position || 'N/A'}</div>
              </div>
              <div className="mb-2">
                <div className="text-sm text-gray-600">Year Employed</div>
                <div>{user.employmentInfo?.yearEmployed || 'N/A'}</div>
              </div>
              <div className="mb-2">
                <div className="text-sm text-gray-600">Monthly Income</div>
                <div>${user.employmentInfo?.monthlyIncome?.toLocaleString() || 'N/A'}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Credit Profile Information (for consumers only) */}
        {user.userType === 'consumer' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Credit Profile</h2>
            
            {profile ? (
              <>
                <div className="mb-4 flex justify-center">
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
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Credit Score</div>
                  <div className="font-medium flex items-center">
                    {profile.creditScore}
                    <span className={`ml-2 px-2 text-xs leading-5 font-semibold rounded-full ${
                      profile.creditScore >= 740
                        ? 'bg-green-100 text-green-800' 
                        : profile.creditScore >= 670
                        ? 'bg-blue-100 text-blue-800'
                        : profile.creditScore >= 580
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
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
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Profile Status</div>
                  <div className="font-medium">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      profile.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : profile.status === 'frozen'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Fraud Alert</div>
                  <div className="font-medium">
                    {profile.fraudAlert ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        None
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Last Updated</div>
                  <div>{new Date(profile.lastUpdated).toLocaleString()}</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Accounts</div>
                  <div>{accounts.length} linked accounts</div>
                </div>
                
                <div className="mt-6">
                  {profile.status === 'active' ? (
                    <button
                      onClick={handleFreezeProfile}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Freeze Profile
                    </button>
                  ) : profile.status === 'frozen' ? (
                    <button
                      onClick={handleUnfreezeProfile}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Unfreeze Profile
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed"
                    >
                      Profile Disputed
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No credit profile found for this user</p>
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Create Credit Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Credit Accounts (for consumers only) */}
      {user.userType === 'consumer' && accounts.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Credit Accounts ({accounts.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {account.lenderName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {account.accountType.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        account.status === 'current' 
                          ? 'bg-green-100 text-green-800'
                          : account.status === 'closed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(account.openDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${account.currentBalance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/accounts/${account._id}`} className="text-blue-600 hover:text-blue-900">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <Link to="/admin/users" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Users
        </Link>
      </div>
    </div>
  );
};

export default UserDetail;