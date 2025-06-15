// src/pages/Orders.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]); // For selecting products in order form
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  // Form States for Add/Edit Order
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null); // Null for add, order object for edit
  const [formData, setFormData] = useState({
     userId: user?.id,
  orderDate: new Date().toISOString().split('T')[0],
  product: null, // ✅ changed from products: []
  quantity: 1,
  totalAmount: 0,
  status: 'Pending',
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, limit: limit };
      const res = await api.get(`/orders`, { params });
      setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching orders:', err.response?.data?.msg || err.message);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [ currentPage, limit]);

  const fetchProductsForOrder = async () => {
    try {
      // Fetch all products (or a paginated/filtered list if too many)
      // For simplicity, fetching all here. In a real app, you might search products for orders.
      const res = await api.get(`/products?limit=1000`); // Fetch a large number
      setProducts(Array.isArray(res.data) ? res.data : res.data.products || []);
    } catch (err) {
      console.error('Error fetching products for order form:', err.response?.data?.msg || err.message);
      // Not critical, but user won't be able to select products.
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProductsForOrder();
  }, [fetchOrders]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductSelection = (productId, quantity) => {
    const product = products.find(p => p._id === productId);
    if (!product || quantity <= 0) return;

    let newProducts = [...formData.products];
    const existingProductIndex = newProducts.findIndex(item => item.productId === productId);

    if (existingProductIndex > -1) {
      newProducts[existingProductIndex].quantity = quantity;
    } else {
      newProducts.push({
        productId: product._id,
        productName: product.name,
        quantity: quantity,
        price: product.price,
      });
    }

    // Recalculate total amount
    const newTotalAmount = newProducts.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    setFormData(prev => ({
      ...prev,
      products: newProducts,
      totalAmount: newTotalAmount,
    }));
  };

  const handleRemoveProductFromOrder = (productId) => {
    const newProducts = formData.products.filter(item => item.productId !== productId);
    const newTotalAmount = newProducts.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setFormData(prev => ({
      ...prev,
      products: newProducts,
      totalAmount: newTotalAmount,
    }));
  };

  const handleAddOrder = () => {
    setCurrentOrder(null);
    setFormData({
      userId: user?.id,
      orderDate: new Date().toISOString().split('T')[0],
      products: [],
      totalAmount: 0,
      status: 'Pending',
    });
    setIsModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setCurrentOrder(order);
    // Ensure products from order are formatted for the form
    setFormData({
      userId: order.userId,
      orderDate: order.orderDate.split('T')[0], // Format to YYYY-MM-DD
      products: order.products || [],
      totalAmount: parseFloat(order.totalAmount), // Convert from string/decimal to float
      status: order.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order? This will restore product quantities.')) {
      try {
        await api.delete(`/orders/${id}`);
        fetchOrders(); // Refresh list
      } catch (err) {
        console.error('Error deleting order:', err.response?.data?.msg || err.message);
        setError('Failed to delete order. ' + (err.response?.data?.msg || ''));
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Ensure products array is not empty
      if (formData.products.length === 0) {
        setError('Order must contain at least one product.');
        return;
      }

      const {userId,products,status,totalAmount,orderDate}=formData;
      const payload={
        userId,
        productId:products[0].productId,
        quantity:products[0].quantity,
        status,
        totalAmount,
        orderDate
      }

      if (currentOrder) {
        await api.put(`/orders/${currentOrder.id}`, payload);
      } else {
        await api.post(`/orders`, payload);
      }
      setIsModalOpen(false);
      fetchOrders(); // Refresh list
    } catch (err) {
      console.error('Error saving order:', err.response?.data?.msg || err.message);
      setError('Failed to save order. ' + (err.response?.data?.msg || ''));
    }
  };

  // Check user role for permissions
  const canAddOrder = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Clerk';
  const canEditOrDelete = user?.role === 'Admin' || user?.role === 'Manager'; // Only Admin/Manager can edit/delete orders

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-gray-700">Loading Orders...</p>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Order Management</h1>

      {canAddOrder && (
        <button
          onClick={handleAddOrder}
          className="mb-6 px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition duration-200 ease-in-out transform hover:scale-105"
        >
          Create New Order
        </button>
      )}

      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {canEditOrDelete && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer?.username || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.products.map(p => `${p.productName} (x${p.quantity})`).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  {canEditOrDelete && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition duration-150 ease-in-out"
                      >
                        Edit
                      </button>
                      {user?.role === 'Admin' && ( // Only Admin can delete
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
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

      {/* Add/Edit Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentOrder ? 'Edit Order' : 'Create New Order'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="orderDate" className="block text-gray-700 text-sm font-semibold mb-2">Order Date</label>
                <input
                  type="date"
                  name="orderDate"
                  id="orderDate"
                  value={formData.orderDate}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="status" className="block text-gray-700 text-sm font-semibold mb-2">Status</label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Product Selection */}
              <div className="mb-6 border p-4 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Products in Order</h3>
                {formData.products.length === 0 ? (
                  <p className="text-gray-500 mb-3">No products added to this order yet.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto mb-3 border rounded-lg p-2">
                    {formData.products.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1 border-b last:border-b-0">
                        <span className="text-gray-800">{item.productName} (x{item.quantity}) - ${item.price?.toFixed(2)} each</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProductFromOrder(item.productId)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <div className="flex-grow">
                    <label htmlFor="productSelect" className="block text-gray-700 text-sm font-semibold mb-1">Add Product</label>
                    <select
                      id="productSelect"
                      className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        const selectedProduct = products.find(p => p._id === e.target.value);
                        if (selectedProduct) {
                          // Default quantity to 1 when selecting a product
                          handleProductSelection(selectedProduct._id, 1);
                        }
                      }}
                      value="" // Reset select value after selection
                    >
                      <option value="">Select a product to add</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} (Stock: {product.quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Quantity input for selected product in order.
                      This is a simpler approach. A more robust solution might use a dedicated
                      "Add Item" button that opens a mini-modal for quantity input, or
                      allow direct editing in the list of selected products.
                      For now, the quantity is set to 1 on selection, and the user can edit it
                      in the displayed list.
                  */}
                  <div className="flex-shrink-0">
                    <label htmlFor="selectedProductQuantity" className="block text-gray-700 text-sm font-semibold mb-1">Qty</label>
                    <input
                      type="number"
                      id="selectedProductQuantity"
                      min="1"
                      value={1} // Default value for new product add
                      className="shadow appearance-none border rounded-lg w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                          // This input is for the currently selected product from the dropdown
                          // For simplicity, we are setting quantity to 1 above.
                          // For a more advanced UX, you'd integrate this with handleProductSelection
                          // more dynamically.
                      }}
                    />
                  </div>
                </div>
                {formData.products.length > 0 && (
                    <div className="mt-4 text-right text-lg font-bold text-gray-800">
                        Total: ${formData.totalAmount.toFixed(2)}
                    </div>
                )}
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
                  {currentOrder ? 'Update Order' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

