// frontend/src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
    nationalId: '',
    userType: 'consumer',
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
  
  const [formError, setFormError] = useState('');
  const [step, setStep] = useState(1);
  
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();
  
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
    setFormError('');
    
    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    // Remove confirmPassword from data to send to API
    const { confirmPassword, ...registrationData } = formData;
    
    // Attempt registration
    const success = await register(registrationData);
    
    if (success) {
      navigate('/redirect'); // App.jsx will redirect based on user type
    }
  };
  
  const nextStep = () => {
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Step 1: Basic Information
  const renderStep1 = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
            First Name *
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
            Last Name *
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
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email *
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password *
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
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userType">
          Account Type *
        </label>
        <select
          id="userType"
          name="userType"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={formData.userType}
          onChange={handleChange}
          required
        >
          <option value="consumer">Consumer</option>
          <option value="lender">Lender</option>
        </select>
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={nextStep}
        >
          Next
        </button>
      </div>
    </>
  );
  
  // Step 2: Personal Information
  const renderStep2 = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
            Phone Number *
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
            Date of Birth *
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
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nationalId">
          National ID *
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
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.street">
          Street Address *
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.city">
            City *
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
            State/Province *
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address.postalCode">
            Postal Code *
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
            Country *
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
      
      <div className="flex justify-between mt-6">
        <button
          type="button"
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={prevStep}
        >
          Previous
        </button>
        
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={nextStep}
        >
          {formData.userType === 'consumer' ? 'Next' : 'Register'}
        </button>
      </div>
    </>
  );
  
  // Step 3: Employment Information (only for consumers)
  const renderStep3 = () => (
    <>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employmentInfo.employer">
          Employer Name *
        </label>
        <input
          id="employmentInfo.employer"
          name="employmentInfo.employer"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Employer Name"
          value={formData.employmentInfo.employer}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employmentInfo.position">
          Position/Title *
        </label>
        <input
          id="employmentInfo.position"
          name="employmentInfo.position"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Position/Title"
          value={formData.employmentInfo.position}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employmentInfo.yearEmployed">
            Year Employed *
          </label>
          <input
            id="employmentInfo.yearEmployed"
            name="employmentInfo.yearEmployed"
            type="number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Year Employed"
            value={formData.employmentInfo.yearEmployed}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employmentInfo.monthlyIncome">
            Monthly Income *
          </label>
          <input
            id="employmentInfo.monthlyIncome"
            name="employmentInfo.monthlyIncome"
            type="number"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Monthly Income"
            value={formData.employmentInfo.monthlyIncome}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          type="button"
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={prevStep}
        >
          Previous
        </button>
        
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
              Registering...
            </span>
          ) : (
            'Register'
          )}
        </button>
      </div>
    </>
  );
  
  return (
    <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
      
      {(formError || error) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError || error}
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
            2
          </div>
          {formData.userType === 'consumer' && (
            <>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                3
              </div>
            </>
          )}
        </div>
        <div className="flex mt-2">
          <div className="flex-1 text-center text-sm">Account</div>
          <div className="flex-1 text-center text-sm">Personal</div>
          {formData.userType === 'consumer' && (
            <div className="flex-1 text-center text-sm">Employment</div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && formData.userType === 'consumer' && renderStep3()}
      </form>
      
      <div className="text-center mt-6">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;