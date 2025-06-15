const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/alerts', dashboardController.getAlerts);
router.get('/analytics/supplier-product-distribution', dashboardController.getSupplierProductDistribution);
router.get('/analytics/category-distribution', dashboardController.getCategoryProductDistribution);
router.get('/analytics/sales-over-time', dashboardController.getSalesOverTime);

module.exports = router; 