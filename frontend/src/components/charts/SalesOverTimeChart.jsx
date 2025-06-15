// src/components/charts/SalesOverTimeChart.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesOverTimeChart = ({ data }) => {
    // Data expects format like: [{ orderDay: '2024-01-01', dailySales: '123.45' }]
    // Convert dailySales to number for charting
    const chartData = data.map(item => ({
        orderDay: item.orderDay,
        "Daily Sales": parseFloat(item.dailySales),
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="orderDay" />
                <YAxis label={{ value: 'Sales Amount ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="Daily Sales" stroke="#82ca9d" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default SalesOverTimeChart;
