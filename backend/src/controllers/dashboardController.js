const { Product } = require('../models/mongo');
const { Order } = require('../models/mysql');
const sequelize = require('sequelize')

// Get low stock alerts and reorder count
exports.getAlerts = async (req, res) => {
  try {
const stockAlerts = await Product.find({$expr:{$lte:['$quantity','$threshold']}}).populate('supplierId','name')
    const reorderCount = stockAlerts.length;

    res.json({
      stockAlerts,
      reorderCount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch alerts', error: err.message });
  }
};

// Get product distribution by supplier
exports.getSupplierProductDistribution = async (req, res) => {
  try {
    const data = await Product.aggregate([
      { $group: { _id: '$supplierId', count: { $sum: 1 } } },
      { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplierInfo' } },
      { $unwind: '$supplierInfo' },
      { $project: { _id: 0, name: '$supplierInfo.name', count: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch supplier product distribution', error: err.message });
  }
};

// Get product distribution by category
exports.getCategoryProductDistribution = async (req, res) => {
  try {
    const data = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '_id', count: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch category product distribution', error: err.message });
  }
};

// Get sales over time
exports.getSalesOverTime = async (req, res) => {
  try {
    // Assuming Order model has orderDate and totalAmount fields
    // This will fetch total sales for each day in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('orderDate')), 'orderDate'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalSales'],
      ],
      where: {
        orderDate: { [sequelize.Op.gte]: thirtyDaysAgo },
        status: 'Completed' // Only count completed sales
      },
      group: [sequelize.fn('DATE', sequelize.col('orderDate'))],
      order: [[sequelize.fn('DATE', sequelize.col('orderDate')), 'ASC']],
      raw: true,
    });

    // Populate missing dates with 0 sales for a complete chart
    const dateMap = new Map();
    salesData.forEach(item => {
      dateMap.set(item.orderDate, parseFloat(item.totalSales));
    });

    const fullSalesData = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i)); // Iterate from 29 days ago to today
      const formattedDate = date.toISOString().split('T')[0];
      fullSalesData.push({
        date: formattedDate,
        sales: dateMap.get(formattedDate) || 0,
      });
    }

    res.json(fullSalesData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales over time', error: err.message });
  }
}; 