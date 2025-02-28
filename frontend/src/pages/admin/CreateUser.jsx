// frontend/src/pages/admin/CreateUser.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    userType: 'consumer',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    dateOfBirth: '',
    nationalId: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Lesotho'
    },
    employmentInfo: {
      employer: '',
      position: '',
      yearEmployed: '',
      monthlyIncome: ''
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
    setError('');
    setSuccess('');
    
    try {
      // Make sure token is in the headers
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Create user
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/admin/create`,
        formData
      );
      
      if (response.data.status === 'success') {
        setSuccess('User created successfully!');
        
        // Reset form
        setFormData({
          userType: 'consumer',
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phoneNumber: '',
          dateOfBirth: '',
          nationalId: '',
          address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'Lesotho'
          },
          employmentInfo: {
            employer: '',
            position: '',
            yearEmployed: '',
            monthlyIncome: ''
          }
        });
        
        // Redirect after short delay
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError(
        err.response?.data?.message || 
        'Failed to create user. Please check the information and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New User</h1>
        <button
          onClick={() => navigate('/admin/users')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Back to Users
        </button>
      </div>
      
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
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Account Type</h2>
            <div className="grid grid-cols-3 gap-4">
              <div 
                className={`p-4 border rounded cursor-pointer ${formData.userType === 'consumer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setFormData({ ...formData, userType: 'consumer' })}
              >
                <div className="font-medium mb-1">Consumer</div>
                <p className="text-sm text-gray-600">Personal credit profile user</p>
              </div>
              
              <div 
                className={`p-4 border rounded cursor-pointer ${formData.userType === 'lender' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setFormData({ ...formData, userType: 'lender' })}
              >
                <div className="font-medium mb-1">Lender</div>
                <p className="text-sm text-gray-600">Financial institution user</p>
              </div>
              
              <div 
                className={`p-4 border rounded cursor-pointer ${formData.userType === 'admin' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setFormData({ ...formData, userType: 'admin' })}
              >
                <div className="font-medium mb-1">Admin</div>
                <p className="text-sm text-gray-600">System administrator</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateOfBirth">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nationalId">
                National ID
              </label>
              <input
                id="nationalId"
                name="nationalId"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="National ID"
                value={formData.nationalId}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Address Information</h2>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.street">
                Street Address
              </label>
              <input
                id="address.street"
                name="address.street"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Street Address"
                value={formData.address.street}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.city">
                  City
                </label>
                <input
                  id="address.city"
                  name="address.city"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="City"
                  value={formData.address.city}
                  onChange={handleChange}
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="State/Province"
                  value={formData.address.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.postalCode">
                  Postal Code
                </label>
                <input
                  id="address.postalCode"
                  name="address.postalCode"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Postal Code"
                  value={formData.address.postalCode}
                  onChange={handleChange}
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Country"
                  value={formData.address.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          {formData.userType === 'consumer' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Employment Information</h2>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employmentInfo.employer">
                  Employer Name
                </label>
                <input
                  id="employmentInfo.employer"
                  name="employmentInfo.employer"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Employer Name"
                  value={formData.employmentInfo.employer}
                  onChange={handleChange}
                  required={formData.userType === 'consumer'}
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employmentInfo.position">
                  Position/Title
                </label>
                <input
                  id="employmentInfo.position"
                  name="employmentInfo.position"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Position/Title"
                  value={formData.employmentInfo.position}
                  onChange={handleChange}
                  required={formData.userType === 'consumer'}
                />
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employmentInfo.yearEmployed">
                    Year Employed
                  </label>
                  <input
                    id="employmentInfo.yearEmployed"
                    name="employmentInfo.yearEmployed"
                    type="number"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Year Employed"
                    value={formData.employmentInfo.yearEmployed}
                    onChange={handleChange}
                    required={formData.userType === 'consumer'}
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
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Monthly Income"
                    value={formData.employmentInfo.monthlyIncome}
                    onChange={handleChange}
                    required={formData.userType === 'consumer'}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;