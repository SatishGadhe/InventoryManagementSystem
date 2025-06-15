// src/pages/Users.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { API_URL, user } = useAuth(); // User for current logged-in user role check
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form States for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Null for add, user object for edit
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Clerk', // Default role for new users
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/users`);
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users. Only Admins can view this page.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    // Only fetch users if the current user is an Admin
    if (user?.role === 'Admin') {
      fetchUsers();
    } else {
      setLoading(false);
      setError('Access Denied: Only Admins can manage users.');
    }
  }, [user, fetchUsers]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = () => {
    setCurrentUser(null); // Clear for new user
    setFormData({
      username: '',
      password: '',
      role: 'Clerk',
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (u) => {
    setCurrentUser(u);
    setFormData({
      username: u.username,
      password: '', // Password is not pre-filled for security
      role: u.role,
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (currentUser) {
        // Only include password if it's explicitly provided
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.put(`/users/${currentUser.id}`, updateData);
      } else {
        await api.post(`/users`, formData);
      }
      setIsModalOpen(false);
      fetchUsers(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-gray-700">Loading Users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600 text-lg">
        {error}
      </div>
    );
  }

  // Ensure only Admins see user management content
  if (user?.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-full text-red-600 text-lg">
        Access Denied: You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">User Management</h1>

      <button
        onClick={handleAddUser}
        className="mb-6 px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition duration-200 ease-in-out transform hover:scale-105"
      >
        Add New User
      </button>

      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {u.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(u)}
                      className="text-blue-600 hover:text-blue-900 mr-4 transition duration-150 ease-in-out"
                    >
                      Edit
                    </button>
                    {/* Prevent deleting own account or the only admin account for safety */}
                    {u.id !== user.id && ( // Cannot delete self
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                  Password {currentUser ? '(Leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!currentUser} // Password is required only for new users
                />
              </div>
              <div className="mb-6">
                <label htmlFor="role" className="block text-gray-700 text-sm font-semibold mb-2">Role</label>
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Clerk">Clerk</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200 ease-in-out transform hover:scale-105"
                >
                  {currentUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
