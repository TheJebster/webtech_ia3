const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Audio', 'Lighting', 'Furniture', 'Structures', 'Visual', 'Decor'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
