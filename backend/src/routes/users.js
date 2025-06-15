const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');


router.get('/', authenticateJWT, authorizeRoles('Admin'), userController.getAllUsers);
router.get('/:id', authenticateJWT, authorizeRoles('Admin', 'Manager'), userController.getUserById);
router.put('/:id', authenticateJWT, authorizeRoles('Admin'), userController.updateUser);
router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), userController.deleteUser);

module.exports = router; 