const express = require('express');
const Pet = require('../models/Pet');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Mag-add ng bagong pet
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, species, breed, age, weight } = req.body;
    const newPet = new Pet({
      ownerId: req.user.id,
      name,
      species,
      breed,
      age,
      weight,
    });
    await newPet.save();
    res.status(201).json(newPet);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add pet', error: err.message });
  }
});

// Kunin lahat ng pets ng naka-login na Pet Owner
router.get('/my-pets', verifyToken, async (req, res) => {
  try {
    const pets = await Pet.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pets', error: err.message });
  }
});

module.exports = router;