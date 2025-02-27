// frontend/src/pages/Profile.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      postalCode: user?.address?.postalCode || '',
      country: user?.address?.country || 'Lesotho'
    },
    employmentInfo: {
      employer: user?.employmentInfo?.employer || '',
      position: user?.employmentInfo?.position || '',
      yearEmployed: user?.employmentInfo?.yearEmployed || '',
      monthlyIncome: user?.employmentInfo?.monthlyIncome || ''
    }
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects (address and employmentInfo)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Address</h3>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.street">
                  Street Address
                </label>
                <input
                  id="address.street"
                  name="address.street"
                  type="text"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.city">
                    City
                  </label>
                  <input
                    id="address.city"
                    name="address.city"
                    type="text"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.state">
                    State/Province
                  </label>
                  <input
                    id="address.state"
                    name="address.state"
                    type="text"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.postalCode">
                    Postal Code
                  </label>
                  <input
                    id="address.postalCode"
                    name="address.postalCode"
                    type="text"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.country">
                    Country
                  </label>
                  <input
                    id="address.country"
                    name="address.country"
                    type="text"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
              </div>
              
              {user.userType === 'consumer' && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employmentInfo.employer">
                      Employer
                    </label>
                    <input
                      id="employmentInfo.employer"
                      name="employmentInfo.employer"
                      type="text"
                      value={formData.employmentInfo.employer}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employmentInfo.position">
                      Position
                    </label>
                    <input
                      id="employmentInfo.position"
                      name="employmentInfo.position"
                      type="text"
                      value={formData.employmentInfo.position}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employmentInfo.yearEmployed">
                        Year Employed
                      </label>
                      <input
                        id="employmentInfo.yearEmployed"
                        name="employmentInfo.yearEmployed"
                        type="number"
                        value={formData.employmentInfo.yearEmployed}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employmentInfo.monthlyIncome">
                        Monthly Income
                      </label>
                      <input
                        id="employmentInfo.monthlyIncome"
                        name="employmentInfo.monthlyIncome"
                        type="number"
                        value={formData.employmentInfo.monthlyIncome}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm text-gray-600 mb-1">First Name</h3>
                  <p className="font-medium">{user.firstName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-600 mb-1">Last Name</h3>
                  <p className="font-medium">{user.lastName}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm text-gray-600 mb-1">Email</h3>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm text-gray-600 mb-1">Phone Number</h3>
                <p className="font-medium">{user.phoneNumber}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm text-gray-600 mb-1">National ID</h3>
                <p className="font-medium">{user.nationalId}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm text-gray-600 mb-1">Date of Birth</h3>
                <p className="font-medium">{new Date(user.dateOfBirth).toLocaleDateString()}</p>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Address</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm text-gray-600 mb-1">Street Address</h3>
                  <p className="font-medium">{user.address.street}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-600 mb-1">City</h3>
                  <p className="font-medium">{user.address.city}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm text-gray-600 mb-1">State/Province</h3>
                  <p className="font-medium">{user.address.state}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-600 mb-1">Postal Code</h3>
                  <p className="font-medium">{user.address.postalCode}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm text-gray-600 mb-1">Country</h3>
                <p className="font-medium">{user.address.country}</p>
              </div>
              
              {user.userType === 'consumer' && user.employmentInfo && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="text-sm text-gray-600 mb-1">Employer</h3>
                      <p className="font-medium">{user.employmentInfo.employer}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-600 mb-1">Position</h3>
                      <p className="font-medium">{user.employmentInfo.position}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-sm text-gray-600 mb-1">Year Employed</h3>
                      <p className="font-medium">{user.employmentInfo.yearEmployed}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-600 mb-1">Monthly Income</h3>
                      <p className="font-medium">${user.employmentInfo.monthlyIncome.toLocaleString()}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Account Security</h2>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Change Password</h3>
              <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => window.location.href = '/change-password'}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;