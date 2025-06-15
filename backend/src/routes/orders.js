const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateJWT, authorizeRoles('Admin', 'Manager', 'Clerk'), orderController.getAllOrders);
router.get('/:id', authenticateJWT, authorizeRoles('Admin', 'Manager', 'Clerk'), orderController.getOrderById);
router.post('/', authenticateJWT, authorizeRoles('Admin', 'Manager'), orderController.createOrder);
router.put('/:id', authenticateJWT, authorizeRoles('Admin', 'Manager'), orderController.updateOrder);
router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), orderController.deleteOrder);

module.exports = router; 