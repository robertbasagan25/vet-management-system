const express = require('express');
const MedicalRecord = require('../models/MedicalRecord');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// 1. Gumawa ng bagong Medical Record (Staff, Admin, Super Admin lang)
router.post(
  '/',
  verifyToken,
  authorizeRoles('staff', 'admin', 'super_admin'),
  async (req, res) => {
    try {
      const { petId, ownerId, visitDate, diagnosis, treatment, prescriptions, nextVaccinationDate } = req.body;

      const newRecord = new MedicalRecord({
        petId,
        ownerId,
        vetId: req.user.id, // Automatic na ID ng naka-login na staff/vet
        visitDate,
        diagnosis,
        treatment,
        prescriptions,
        nextVaccinationDate,
      });

      await newRecord.save();
      res.status(201).json(newRecord);
    } catch (err) {
      res.status(500).json({ message: 'Failed to save medical record', error: err.message });
    }
  }
);

// 2. Kunin ang Medical Records ng mga alaga ng naka-login na Pet Owner
router.get('/my-records', verifyToken, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ ownerId: req.user.id })
      .populate('petId', 'name species breed')
      .populate('vetId', 'name')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch medical records', error: err.message });
  }
});

// 3. Kunin LAHAT ng Medical Records (Staff, Admin, Super Admin lang)
router.get(
  '/all',
  verifyToken,
  authorizeRoles('staff', 'admin', 'super_admin'),
  async (req, res) => {
    try {
      const records = await MedicalRecord.find()
        .populate('petId', 'name species breed')
        .populate('ownerId', 'name phone')
        .populate('vetId', 'name')
        .sort({ createdAt: -1 });
      res.json(records);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch all records', error: err.message });
    }
  }
);

module.exports = router;