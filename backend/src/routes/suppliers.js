const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateJWT, authorizeRoles('Admin', 'Manager', 'Clerk'), supplierController.getAllSuppliers);
router.get('/:id', authenticateJWT, authorizeRoles('Admin', 'Manager', 'Clerk'), supplierController.getSupplierById);
router.post('/', authenticateJWT, authorizeRoles('Admin', 'Manager'), supplierController.createSupplier);
router.put('/:id', authenticateJWT, authorizeRoles('Admin', 'Manager'), supplierController.updateSupplier);
router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), supplierController.deleteSupplier);

module.exports = router; 