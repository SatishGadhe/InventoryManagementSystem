// src/components/charts/SupplierProductChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SupplierProductChart = ({ data }) => {
  // Ensure data is in the correct format for Recharts
  const chartData = data.map(item => ({
    name: item.supplierName,
    "Product Count": item.productCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Product Count" fill="#8884d8" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SupplierProductChart;
