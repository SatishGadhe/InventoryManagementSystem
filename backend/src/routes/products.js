const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateJWT, authorizeRoles('Admin', 'Manager', 'Clerk'), productController.getAllProducts);
router.get('/:id', authenticateJWT, authorizeRoles('Admin', 'Manager', 'Clerk'), productController.getProductById);
router.post('/', authenticateJWT, authorizeRoles('Admin', 'Manager'), productController.createProduct);
router.put('/:id', authenticateJWT, authorizeRoles('Admin', 'Manager'), productController.updateProduct);
router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), productController.deleteProduct);

module.exports = router; 