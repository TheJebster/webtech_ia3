const express = require('express');
const { body, validationResult } = require('express-validator');
const Rental = require('../models/Rental');
const Equipment = require('../models/Equipment');
const { protect, admin } = require('../middleware/auth');
const { validObjectId, isValidObjectId } = require('../middleware/validObjectId');

const router = express.Router();

// Helper: keep the `available` flag in sync with the remaining stock.
const syncAvailability = async (equipmentId) => {
  const eq = await Equipment.findById(equipmentId);
  if (!eq) return;
  const shouldBeAvailable = eq.quantity > 0;
  if (eq.available !== shouldBeAvailable) {
    eq.available = shouldBeAvailable;
    await eq.save();
  }
};

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

      if (!isValidObjectId(equipmentId)) {
        return res.status(404).json({ message: 'Equipment not found' });
      }

      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }

      if (!equipment.available) {
        return res.status(400).json({ message: 'This equipment is currently unavailable' });
      }

      if (quantity > equipment.quantity) {
        return res.status(400).json({
          message: `Only ${equipment.quantity} unit(s) of ${equipment.name} are available`,
        });
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
router.put('/:id/status', protect, admin, validObjectId('Rental'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'returned', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    const previousStatus = rental.status;

    if (previousStatus === status) {
      return res.json(await rental.populate([
        { path: 'user', select: 'name email' },
        { path: 'equipment', select: 'name' },
      ]));
    }

    // Reserving stock: pending/cancelled/returned -> approved
    if (status === 'approved' && previousStatus !== 'approved') {
      const reserved = await Equipment.findOneAndUpdate(
        { _id: rental.equipment, quantity: { $gte: rental.quantity } },
        { $inc: { quantity: -rental.quantity } },
        { new: true }
      );

      if (!reserved) {
        return res.status(400).json({
          message: 'Not enough units available to approve this rental',
        });
      }
      await syncAvailability(reserved._id);
    }

    // Releasing stock: approved -> returned/cancelled/pending
    if (previousStatus === 'approved' && status !== 'approved') {
      await Equipment.findByIdAndUpdate(rental.equipment, {
        $inc: { quantity: rental.quantity },
      });
      await syncAvailability(rental.equipment);
    }

    rental.status = status;
    await rental.save();

    await rental.populate([
      { path: 'user', select: 'name email' },
      { path: 'equipment', select: 'name' },
    ]);

    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/rentals/:id
router.delete('/:id', protect, admin, validObjectId('Rental'), async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Deleting an approved rental must give the reserved units back.
    if (rental.status === 'approved') {
      await Equipment.findByIdAndUpdate(rental.equipment, {
        $inc: { quantity: rental.quantity },
      });
      await syncAvailability(rental.equipment);
    }

    await rental.deleteOne();
    res.json({ message: 'Rental deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
