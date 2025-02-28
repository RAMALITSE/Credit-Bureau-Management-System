// frontend/src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const pageSize = 10;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterType, sortField, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Make sure token is in the headers
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Build query parameters
      let queryParams = `?page=${currentPage}&limit=${pageSize}`;
      
      if (filterType) {
        queryParams += `&userType=${filterType}`;
      }
      
      if (searchTerm) {
        queryParams += `&search=${searchTerm}`;
      }
      
      if (sortField) {
        queryParams += `&sortBy=${sortField}&sortOrder=${sortOrder}`;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/admin${queryParams}`
      );

      if (response.data.status === 'success') {
        setUsers(response.data.data.users);
        setTotalPages(response.data.pagination.pages || 1);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(
        err.response?.data?.message || 
        'Failed to load users. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Reset to first page when searching
    setCurrentPage(1);
    fetchUsers();
  };

  const handleSort = (field) => {
    // If clicking the same field, toggle the sort order
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending order when selecting a new field
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleFilter = () => {
    // Reset to first page when filtering
    setCurrentPage(1);
    fetchUsers();
  };

  const resetFilters = () => {
    setFilterType('');
    setSortField('createdAt');
    setSortOrder('desc');
    setSearchTerm('');
    setCurrentPage(1);
    fetchUsers();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/admin/${userToDelete._id}`);
      
      // Remove user from local state
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setDeleteError(
        err.response?.data?.message || 
        'Failed to delete user. Please try again.'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const getUserTypeBadgeClass = (userType) => {
    const classMap = {
      'consumer': 'bg-blue-100 text-blue-800',
      'lender': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800',
    };
    
    return classMap[userType] || 'bg-gray-100 text-gray-800';
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={resetFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
          >
            Reset Filters
          </button>
          <Link
            to="/admin/users/create"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Add New User
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="search">
              Search by Name or Email
            </label>
            <div className="flex">
              <input
                id="search"
                type="text"
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userType">
              User Type
            </label>
            <select
              id="userType"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="consumer">Consumer</option>
              <option value="lender">Lender</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastName')}
                >
                  <div className="flex items-center">
                    Name
                    {sortField === 'lastName' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortField === 'email' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('userType')}
                >
                  <div className="flex items-center">
                    Type
                    {sortField === 'userType' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Registered
                    {sortField === 'createdAt' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserTypeBadgeClass(user.userType)}`}>
                      {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">
                      {user.phoneNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/admin/users/${user._id}`} 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/admin/users/${user._id}/edit`} 
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-gray-600 text-sm">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Showing 2 pages before and after current page, or first 5 pages
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            
            <p className="mb-4">
              Are you sure you want to delete the user <span className="font-bold">{userToDelete?.firstName} {userToDelete?.lastName}</span>?
              This action cannot be undone.
            </p>
            
            {deleteError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
                {deleteError}
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                  setDeleteError(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;