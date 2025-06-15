// src/pages/Suppliers.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Suppliers = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form States for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null); // Null for add, supplier object for edit
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/suppliers`);
      setSuppliers(Array.isArray(res.data)?res.data:res.data.suppliers||[]);
    } catch (err) {
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSupplier = () => {
    setCurrentSupplier(null); // Clear for new supplier
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    const [contactPerson ='',email='',phone='',address='']=(supplier.contactInfo || '').split(' | ')
    setCurrentSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson,
      email,
      phone,
      address,
    });
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers(); // Refresh list
      } catch (err) {
        setError('Failed to delete supplier. ' + (err.response?.data?.msg || ''));
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
       const payload={
          name:formData.name,
          contactInfo:`${formData.contactPerson} | ${formData.email} | ${formData.phone} | ${formData.address}`,
        }
      if (currentSupplier) {
        await api.put(`/suppliers/${currentSupplier._id}`, payload);
      } else {
        await api.post(`/suppliers`, payload);
      }
      setIsModalOpen(false);
      fetchSuppliers(); // Refresh list
    } catch (err) {
      console.error('Error saving supplier:', err.response?.data?.msg || err.message);
      setError('Failed to save supplier. ' + (err.response?.data?.msg || ''));
    }
  };

  // Check user role for permissions (Admin, Manager)
  const canManageSuppliers = user?.role === 'Admin' || user?.role === 'Manager';
  const canDeleteSupplier = user?.role === 'Admin'; // Only Admin can delete

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-gray-700">Loading Suppliers...</p>
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Supplier Management</h1>

      {canManageSuppliers && (
        <button
          onClick={handleAddSupplier}
          className="mb-6 px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition duration-200 ease-in-out transform hover:scale-105"
        >
          Add New Supplier
        </button>
      )}

      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Person
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              {canManageSuppliers && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                  No suppliers found.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {supplier.contactPerson}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {supplier.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {supplier.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {supplier.address}
                  </td>
                  {canManageSuppliers && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditSupplier(supplier)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition duration-150 ease-in-out"
                      >
                        Edit
                      </button>
                      {canDeleteSupplier && (
                        <button
                          onClick={() => handleDeleteSupplier(supplier._id)}
                          className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Supplier Modal */}
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
              {currentSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="contactPerson" className="block text-gray-700 text-sm font-semibold mb-2">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 text-sm font-semibold mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="address" className="block text-gray-700 text-sm font-semibold mb-2">Address</label>
                <textarea
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
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
                  {currentSupplier ? 'Update Supplier' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
