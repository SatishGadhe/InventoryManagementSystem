// src/pages/Dashboard.js
import React, { useEffect, useState, Suspense, lazy } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Lazy load chart components
const SupplierProductChart = lazy(() => import('../components/charts/SupplierProductChart'));
const CategoryProductChart = lazy(() => import('../components/charts/CategoryProductChart'));
const SalesOverTimeChart = lazy(() => import('../components/charts/SalesOverTimeChart'));

const Dashboard = () => {
  const [stockAlerts, setStockAlerts] = useState([]);
  const [reorderCount, setReorderCount] = useState(0);
  const [supplierProductData, setSupplierProductData] = useState([]);
  const [categoryProductData, setCategoryProductData] = useState([]);
  const [salesOverTimeData, setSalesOverTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Alerts and Reorder Status
        const alertsRes = await api.get(`/dashboard/alerts`);
        setStockAlerts(alertsRes.data.stockAlerts);
        setReorderCount(alertsRes.data.reorderCount);

        // Fetch Supplier Product Distribution for Chart
        const supplierRes = await api.get(`/dashboard/analytics/supplier-product-distribution`);
        setSupplierProductData(supplierRes.data);

        // Fetch Category Product Distribution for Chart
        const categoryRes = await api.get(`/dashboard/analytics/category-distribution`);
        setCategoryProductData(categoryRes.data);

        // Fetch Sales Over Time for Chart
        const salesRes = await api.get(`/dashboard/analytics/sales-over-time`);
        setSalesOverTimeData(salesRes.data);

      } catch (err) {
        console.error('Error fetching dashboard data:', err.response?.data?.msg || err.message);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-gray-700">Loading Dashboard...</p>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-md flex items-center justify-between transform transition-transform hover:scale-105">
          <div>
            <h3 className="text-lg font-semibold">Stock Alerts</h3>
            <p className="text-4xl font-bold">{stockAlerts.length}</p>
          </div>
          <span className="text-5xl opacity-75">⚠️</span>
        </div>
        <div className="bg-red-600 text-white p-6 rounded-lg shadow-md flex items-center justify-between transform transition-transform hover:scale-105">
          <div>
            <h3 className="text-lg font-semibold">Products to Reorder</h3>
            <p className="text-4xl font-bold">{reorderCount}</p>
          </div>
          <span className="text-5xl opacity-75">📦</span>
        </div>
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md flex items-center justify-between transform transition-transform hover:scale-105">
          <div>
            <h3 className="text-lg font-semibold">Total Suppliers</h3>
            <p className="text-4xl font-bold">
              <Suspense fallback={<div>Loading...</div>}>
                {/* A simplified way to count suppliers if we don't have a direct count from backend */}
                {supplierProductData.length}
              </Suspense>
            </p>
          </div>
          <span className="text-5xl opacity-75">🚚</span>
        </div>
      </div>

      {/* Stock Alerts List */}
      {stockAlerts.length > 0 && (
        <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Low Stock Products</h2>
          <ul className="list-disc list-inside text-gray-600">
            {stockAlerts.map(product => (
              <li key={product._id} className="mb-1">
                <span className="font-semibold">{product.name}</span> (Category: {product.category}) - Current Stock: {product.quantity} (Threshold: {product.threshold}) - Supplier: {product.supplier?.name || 'N/A'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Charts Section - Lazy Loaded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Products by Supplier</h2>
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
            </div>
          }>
            <SupplierProductChart data={supplierProductData} />
          </Suspense>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Products by Category</h2>
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
            </div>
          }>
            <CategoryProductChart data={categoryProductData} />
          </Suspense>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Over Time (Last 30 Days)</h2>
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
            </div>
          }>
            <SalesOverTimeChart data={salesOverTimeData} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
