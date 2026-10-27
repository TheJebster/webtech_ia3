const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const User = require('./models/User');
const Equipment = require('./models/Equipment');

const ADMIN = {
  name: 'Admin',
  email: 'admin@example.com',
  password: 'Admin@123',
  role: 'admin',
};

const equipmentData = [
  {
    name: 'Professional Speaker System',
    category: 'Audio',
    description:
      'High-quality professional speaker system suitable for events up to 500 people. Includes subwoofer and monitor speakers.',
    quantity: 10,
    pricePerDay: 150,
    available: true,
  },
  {
    name: 'LED Stage Light Kit',
    category: 'Lighting',
    description:
      'Complete LED stage lighting kit with DMX controller. Includes 8 par cans and 4 moving heads.',
    quantity: 20,
    pricePerDay: 80,
    available: true,
  },
  {
    name: 'Banquet Table Set',
    category: 'Furniture',
    description:
      'Round banquet table seating 8-10 guests. Includes white tablecloth and chair covers.',
    quantity: 50,
    pricePerDay: 25,
    available: true,
  },
  {
    name: 'Event Tent 20x30',
    category: 'Structures',
    description:
      'Large event tent measuring 20x30 feet. Waterproof with sidewalls. Suitable for outdoor events.',
    quantity: 5,
    pricePerDay: 500,
    available: true,
  },
  {
    name: 'HD Projector',
    category: 'Visual',
    description:
      '1080p HD projector with 5000 lumens brightness. Includes projection screen and HDMI cables.',
    quantity: 8,
    pricePerDay: 120,
    available: true,
  },
  {
    name: 'Red Carpet Runner',
    category: 'Decor',
    description:
      'Premium red carpet runner, 4 feet wide and 25 feet long. Perfect for grand entrances and VIP events.',
    quantity: 15,
    pricePerDay: 40,
    available: true,
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Idempotent: never wipe real users. Only ensure the admin account exists.
    let admin = await User.findOne({ email: ADMIN.email });
    if (admin) {
      admin.name = ADMIN.name;
      admin.role = 'admin';
      admin.password = ADMIN.password; // re-hashed by the model's pre-save hook
      await admin.save();
      console.log(`Admin user updated: ${admin.email}`);
    } else {
      admin = await User.create(ADMIN);
      console.log(`Admin user created: ${admin.email}`);
    }

    // Upsert equipment by name so re-running the seed does not create duplicates
    // or destroy rentals/stock already recorded against an item.
    for (const item of equipmentData) {
      const existing = await Equipment.findOne({ name: item.name });
      if (existing) {
        existing.category = item.category;
        existing.description = item.description;
        existing.pricePerDay = item.pricePerDay;
        // Do not reset quantity/available: those reflect live reservations.
        await existing.save();
        console.log(`  = updated  ${item.name} (${item.category})`);
      } else {
        await Equipment.create(item);
        console.log(`  + created  ${item.name} (${item.category})`);
      }
    }

    console.log('\nSeeding completed successfully!');
    console.log('Admin login: admin@example.com / Admin@123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
