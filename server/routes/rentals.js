const express = require('express');
const { body, validationResult } = require('express-validator');
const Rental = require('../models/Rental');
const Equipment = require('../models/Equipment');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// GET /api/rentals
router.get('/', protect, async (req, res) => {
  try {
    let rentals;

    if (req.user.role === 'admin') {
      rentals = await Rental.find()
        .populate('user', 'name email')
        .populate('equipment', 'name')
        .sort({ createdAt: -1 });
    } else {
      rentals = await Rental.find({ user: req.user._id })
        .populate('equipment', 'name')
        .sort({ createdAt: -1 });
    }

    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/rentals
router.post(
  '/',
  protect,
  [
    body('equipment').notEmpty().withMessage('Equipment is required'),
    body('eventName').notEmpty().withMessage('Event name is required'),
    body('startDate').notEmpty().withMessage('Start date is required'),
    body('endDate').notEmpty().withMessage('End date is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { equipment: equipmentId, eventName, startDate, endDate, quantity } = req.body;

      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (days <= 0) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }

      const totalPrice = quantity * equipment.pricePerDay * days;

      const rental = await Rental.create({
        user: req.user._id,
        equipment: equipmentId,
        eventName,
        startDate: start,
        endDate: end,
        quantity,
        totalPrice,
      });

      const populatedRental = await Rental.findById(rental._id)
        .populate('equipment', 'name');

      res.status(201).json(populatedRental);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/rentals/:id/status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'returned', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('user', 'name email')
      .populate('equipment', 'name');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/rentals/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const rental = await Rental.findByIdAndDelete(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }
    res.json({ message: 'Rental deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
