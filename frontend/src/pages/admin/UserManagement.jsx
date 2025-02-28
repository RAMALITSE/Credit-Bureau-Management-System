// frontend/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userType, setUserType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock user data for demo
  const mockUsers = [
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      userType: 'consumer',
      phoneNumber: '123-456-7890',
      createdAt: '2024-01-15T00:00:00.000Z',
      lastLogin: '2024-02-25T00:00:00.000Z'
    },
    {
      _id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      userType: 'lender',
      phoneNumber: '123-456-7891',
      createdAt: '2024-01-20T00:00:00.000Z',
      lastLogin: '2024-02-26T00:00:00.000Z'
    },
    {
      _id: '3',
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@example.com',
      userType: 'consumer',
      phoneNumber: '123-456-7892',
      createdAt: '2024-01-25T00:00:00.000Z',
      lastLogin: '2024-02-24T00:00:00.000Z'
    },
    {
      _id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@example.com',
      userType: 'consumer',
      phoneNumber: '123-456-7893',
      createdAt: '2024-02-01T00:00:00.000Z',
      lastLogin: '2024-02-27T00:00:00.000Z'
    },
    {
      _id: '5',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@example.com',
      userType: 'lender',
      phoneNumber: '123-456-7894',
      createdAt: '2024-02-05T00:00:00.000Z',
      lastLogin: '2024-02-26T00:00:00.000Z'
    },
    {
      _id: '6',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      userType: 'admin',
      phoneNumber: '123-456-7895',
      createdAt: '2024-02-10T00:00:00.000Z',
      lastLogin: '2024-02-27T00:00:00.000Z'
    }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would fetch from API
        // const response = await axios.get(`${import.meta.env.VITE_API_URL}/users?page=${currentPage}&userType=${userType !== 'all' ? userType : ''}&search=${searchTerm}`);
        // setUsers(response.data.data.users);
        // setTotalPages(response.data.pagination.pages);
        
        // For demo, filter the mock users
        let filteredUsers = [...mockUsers];
        
        if (userType !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.userType === userType);
        }
        
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredUsers = filteredUsers.filter(
            user => 
              user.firstName.toLowerCase().includes(term) ||
              user.lastName.toLowerCase().includes(term) ||
              user.email.toLowerCase().includes(term)
          );
        }
        
        setUsers(filteredUsers);
        setTotalPages(Math.ceil(filteredUsers.length / 10));
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, userType, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-blue-600 text-white p-1 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
          </form>
          
          <div className="flex gap-4">
            <select
              value={userType}
              onChange={handleUserTypeChange}
              className="p-3 border border-gray-300 rounded-lg"
            >
              <option value="all">All Users</option>
              <option value="consumer">Consumers</option>
              <option value="lender">Lenders</option>
              <option value="admin">Admins</option>
            </select>
            
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.location.href = '/admin/users/new'}
            >
              Add User
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.userType === 'consumer' 
                            ? 'bg-blue-100 text-blue-800'
                            : user.userType === 'lender'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/admin/users/${user._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          View
                        </Link>
                        <Link to={`/admin/users/${user._id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">
                          Edit
                        </Link>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Showing {users.length} users
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border rounded ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Previous
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 border rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;