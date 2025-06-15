const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/authMiddleware');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router; 