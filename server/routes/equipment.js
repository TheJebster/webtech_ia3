const express = require('express');
const { body, validationResult } = require('express-validator');
const Equipment = require('../models/Equipment');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// GET /api/equipment
router.get('/', protect, async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }

    const equipment = await Equipment.find(filter).sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/equipment/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/equipment
router.post(
  '/',
  protect,
  admin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('category')
      .isIn(['Audio', 'Lighting', 'Furniture', 'Structures', 'Visual', 'Decor'])
      .withMessage('Valid category is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('pricePerDay').isNumeric().withMessage('Price per day must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const equipment = await Equipment.create(req.body);
      res.status(201).json(equipment);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/equipment/:id
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/equipment/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
