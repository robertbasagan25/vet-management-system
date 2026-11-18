const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    species: { type: String, required: true }, // e.g., Dog, Cat
    breed: { type: String, default: 'Unknown' },
    age: { type: String, required: true },     // e.g., "2 years"
    weight: { type: String, default: '' },     // e.g., "5 kg"
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pet', petSchema);