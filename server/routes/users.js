const express = require('express');
const User = require('../models/User');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// 1. Kunin lahat ng users (Admin at Super Admin lang)
router.get(
  '/',
  verifyToken,
  authorizeRoles('admin', 'super_admin'),
  async (req, res) => {
    try {
      // .select('-password') para HINDI ipadala ang password sa frontend
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch users', error: err.message });
    }
  }
);

// 2. Palitan ang role ng user (Super Admin lang)
router.patch(
  '/:id/role',
  verifyToken,
  authorizeRoles('super_admin'),
  async (req, res) => {
    try {
      const { role } = req.body;
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select('-password');
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update role', error: err.message });
    }
  }
);

// 3. Mag-delete ng user (Super Admin lang)
router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('super_admin'),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
  }
);

module.exports = router;