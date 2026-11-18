const express = require('express');
const Appointment = require('../models/Appointment');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// 1. Kunin ang mga booked time slots sa napiling date (Anti-Double Booking)
router.get('/booked-slots', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const appointments = await Appointment.find({
      date,
      status: { $ne: 'cancelled' },
    });
    const bookedSlots = appointments.map((appt) => appt.timeSlot);
    res.json(bookedSlots);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch slots', error: err.message });
  }
});

// 2. Mag-book ng bagong appointment
router.post('/', verifyToken, async (req, res) => {
  try {
    const { petId, date, timeSlot, serviceType, notes } = req.body;

    const existing = await Appointment.findOne({
      date,
      timeSlot,
      status: { $ne: 'cancelled' },
    });
    if (existing) {
      return res.status(400).json({ message: 'This time slot is already booked.' });
    }

    const newAppointment = new Appointment({
      ownerId: req.user.id,
      petId,
      date,
      timeSlot,
      serviceType,
      notes,
    });
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
});

// 3. Kunin ang appointments ng naka-login na Pet Owner
router.get('/my-appointments', verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ ownerId: req.user.id })
      .populate('petId', 'name species breed')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// 4. Kunin LAHAT ng appointments (Staff, Admin, Super Admin lang)
router.get(
  '/all',
  verifyToken,
  authorizeRoles('staff', 'admin', 'super_admin'),
  async (req, res) => {
    try {
      const appointments = await Appointment.find()
        .populate('petId', 'name species breed')
        .populate('ownerId', 'name phone email')
        .sort({ date: 1 });
      res.json(appointments);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch all appointments', error: err.message });
    }
  }
);

// 5. I-update ang status ng appointment (Staff, Admin, Super Admin lang)
router.patch(
  '/:id/status',
  verifyToken,
  authorizeRoles('staff', 'admin', 'super_admin'),
  async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update status', error: err.message });
    }
  }
);

module.exports = router;