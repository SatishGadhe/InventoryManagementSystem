// src/pages/Products.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // For filter dropdown and product forms
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterMinQuantity, setFilterMinQuantity] = useState('');
  const [filterMaxQuantity, setFilterMaxQuantity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Form States for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // Null for add, product object for edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 0,
    price: 0,
    supplier: '',
    threshold: 10,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: limit,
        search: searchQuery,
        supplier: filterSupplier,
        minQuantity: filterMinQuantity,
        maxQuantity: filterMaxQuantity,
        category: filterCategory,
      };
      const res = await api.get(`/products`, { params });
      setProducts(Array.isArray(res.data) ? res.data : res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching products:', err.response?.data?.msg || err.message);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchQuery, filterSupplier, filterMinQuantity, filterMaxQuantity, filterCategory]);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get(`/suppliers`);
      setSuppliers(Array.isArray(res.data) ? res.data : res.data.suppliers || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err.response?.data?.msg || err.message);
      // Not critical for product page, so just log error
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSuppliers(); // Fetch suppliers once for dropdowns
  }, [fetchProducts]); // Depend on fetchProducts for re-fetching on filter/pagination changes

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' || name === 'threshold' ? Number(value) : value,
    }));
  };

  const handleAddProduct = () => {
    setCurrentProduct(null); // Clear for new product
    setFormData({
      name: '',
      description: '',
      category: '',
      quantity: 0,
      price: 0,
      supplier: '',
      threshold: 10,
    });
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
      supplier: product.supplier?._id || '', // Use _id for MongoDB reference
      threshold: product.threshold,
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {

        await api.delete(`/products/${id}`);
        fetchProducts(); // Refresh list
      } catch (err) {
        console.error('Error deleting product:', err.response?.data?.msg || err.message);
        setError('Failed to delete product.');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
          console.log("Price is required and must be a number")
console.log("formdata",formData)
    if(formData.price===''||isNaN(formData.price)){
      console.log("Price is required and must be a number")
      setError("Price is required and must be a number");
    }
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        quantity: formData.quantity,
        price: formData.price,
        supplierId: formData.supplier, // Use _id for MongoDB reference
        threshold: formData.threshold,
      }
      console.log("payload",payload)
      if (currentProduct) {
        await api.put(`/products/${currentProduct._id}`, payload);
      } else {
        console.log("formdata",formData)
        console.log("payload",payload)
        await api.post(`/products`, payload);
      }
      setIsModalOpen(false);
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error('Error saving product:', err.response?.data?.msg || err.message);
      setError('Failed to save product. ' + (err.response?.data?.msg || ''));
    }
  };

  // Check user role for permissions
  const canEditOrDelete = user?.role === 'Admin' || user?.role === 'Manager';
  const canAdd = user?.role === 'Admin' || user?.role === 'Manager';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-gray-700">Loading Products...</p>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Product Management</h1>

      {/* Search and Filter */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg shadow-inner">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by Name/Description</label>
          <input
            type="text"
            id="search"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="filterSupplier" className="block text-sm font-medium text-gray-700">Filter by Supplier</label>
          <select
            id="filterSupplier"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700">Filter by Category</label>
          <input
            type="text"
            id="filterCategory"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Category..."
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700">Min Quantity</label>
            <input
              type="number"
              id="minQuantity"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filterMinQuantity}
              onChange={(e) => setFilterMinQuantity(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="maxQuantity" className="block text-sm font-medium text-gray-700">Max Quantity</label>
            <input
              type="number"
              id="maxQuantity"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filterMaxQuantity}
              onChange={(e) => setFilterMaxQuantity(e.target.value)}
            />
          </div>
          <button
            onClick={() => setCurrentPage(1) /* Reset page to 1 on filter/search apply */}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors self-end"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterSupplier('');
              setFilterMinQuantity('');
              setFilterMaxQuantity('');
              setFilterCategory('');
              setCurrentPage(1); // Also reset page on clear
            }}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors self-end"
          >
            Clear
          </button>
        </div>
      </div>


      {canAdd && (
        <button
          onClick={handleAddProduct}
          className="mb-6 px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition duration-200 ease-in-out transform hover:scale-105"
        >
          Add New Product
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
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Threshold
              </th>
              {canEditOrDelete && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className={product.quantity <= product.threshold ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.quantity}
                    {product.quantity <= product.threshold && (
                      <span className="ml-2 text-red-500 text-xs font-semibold"> (Low Stock!)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.supplier?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.threshold}
                  </td>
                  {canEditOrDelete && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition duration-150 ease-in-out"
                      >
                        Edit
                      </button>
                      {user?.role === 'Admin' && ( // Only Admin can delete
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
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

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
        >
          Next
        </button>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md relative
                 max-h-[80vh] overflow-y-auto p-6"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  min="0"
                  required
                  className="shadow appearance-none border rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  step="0.01"
                  min="0"
                  required
                  className="shadow appearance-none border rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="supplier"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Supplier
                </label>
                <select
                  name="supplier"
                  id="supplier"
                  value={formData.supplier}
                  onChange={handleFormChange}
                  required
                  className="shadow appearance-none border rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="threshold"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="threshold"
                  id="threshold"
                  value={formData.threshold}
                  onChange={handleFormChange}
                  min="0"
                  required
                  className="shadow appearance-none border rounded-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  {currentProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
