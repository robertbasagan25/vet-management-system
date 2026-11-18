const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    date: { type: String, required: true },      // Format: "YYYY-MM-DD"
    timeSlot: { type: String, required: true },  // e.g., "09:00 AM"
    serviceType: { type: String, required: true }, // Checkup, Vaccination, Grooming
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);