const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const User = require('./models/User');
const Equipment = require('./models/Equipment');
const Rental = require('./models/Rental');

const ADMIN = {
  name: 'Admin',
  email: 'admin@example.com',
  password: 'Admin@123',
  role: 'admin',
};

const DEMO_USER = {
  name: 'Demo User',
  email: 'user@example.com',
  password: 'User@123',
  role: 'user',
};

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const equipmentData = [
  {
    name: 'Professional Speaker System',
    category: 'Audio',
    description:
      'High-quality professional speaker system suitable for events up to 500 people. Includes subwoofer and monitor speakers.',
    quantity: 10,
    pricePerDay: 150,
    imageUrl: img('photo-1470229722913-7c0e2dbbafd3'),
  },
  {
    name: 'Wireless Microphone Set',
    category: 'Audio',
    description:
      'Four-channel UHF wireless microphone set with handheld and lapel mics. Includes receiver and batteries.',
    quantity: 25,
    pricePerDay: 45,
    imageUrl: img('photo-1590602847861-f357a9332bbc'),
  },
  {
    name: 'LED Stage Light Kit',
    category: 'Lighting',
    description:
      'Complete LED stage lighting kit with DMX controller. Includes 8 par cans and 4 moving heads.',
    quantity: 20,
    pricePerDay: 80,
    imageUrl: img('photo-1501281668745-f7f57925c3b4'),
  },
  {
    name: 'Moving Head Spotlight Pair',
    category: 'Lighting',
    description:
      'Two professional moving-head spotlights with gobo wheels and colour mixing for stage and dance-floor effects.',
    quantity: 12,
    pricePerDay: 130,
    imageUrl: img('photo-1493225457124-a3eb161ffa5f'),
  },
  {
    name: 'Banquet Table Set',
    category: 'Furniture',
    description:
      'Round banquet table seating 8-10 guests. Includes white tablecloth and chair covers.',
    quantity: 50,
    pricePerDay: 25,
    imageUrl: img('photo-1519671482749-fd09be7ccebf'),
  },
  {
    name: 'Chiavari Chair Set',
    category: 'Furniture',
    description:
      'Elegant gold Chiavari chairs with cushioned seats. Priced per chair, ideal for weddings and formal dinners.',
    quantity: 120,
    pricePerDay: 18,
    imageUrl: img('photo-1503602642458-232111445657'),
  },
  {
    name: 'Event Tent 20x30',
    category: 'Structures',
    description:
      'Large event tent measuring 20x30 feet. Waterproof with sidewalls. Suitable for outdoor events.',
    quantity: 5,
    pricePerDay: 500,
    imageUrl: img('photo-1478146896981-b80fe463b330'),
  },
  {
    name: 'Modular Stage Platform',
    category: 'Structures',
    description:
      'Modular staging system, 4x8 ft decks with adjustable legs and guard rails. Expandable to any footprint.',
    quantity: 6,
    pricePerDay: 350,
    imageUrl: img('photo-1506157786151-b8491531f063'),
  },
  {
    name: 'HD Projector',
    category: 'Visual',
    description:
      '1080p HD projector with 5000 lumens brightness. Includes projection screen and HDMI cables.',
    quantity: 8,
    pricePerDay: 120,
    imageUrl: img('photo-1478720568477-152d9b164e26'),
  },
  {
    name: 'LED Video Wall Panel',
    category: 'Visual',
    description:
      'Indoor P3.9 LED video wall panels with processor. Modular tiles for backdrop and IMAG displays.',
    quantity: 10,
    pricePerDay: 220,
    imageUrl: img('photo-1593784991095-a205069470b6'),
  },
  {
    name: 'Red Carpet Runner',
    category: 'Decor',
    description:
      'Premium red carpet runner, 4 feet wide and 25 feet long. Perfect for grand entrances and VIP events.',
    quantity: 15,
    pricePerDay: 40,
    imageUrl: img('photo-1492684223066-81342ee5ff30'),
  },
  {
    name: 'Floral Centerpiece Set',
    category: 'Decor',
    description:
      'Set of ten artificial floral centerpieces with glass vases. Reusable and ideal for banquet tables.',
    quantity: 40,
    pricePerDay: 30,
    imageUrl: img('photo-1522673607200-164d1b6ce486'),
  },
];

const daysFromNow = (n) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
};

const upsertUser = async (data) => {
  let user = await User.findOne({ email: data.email });
  if (user) {
    user.name = data.name;
    user.role = data.role;
    user.password = data.password; // re-hashed by the model's pre-save hook
    await user.save();
    console.log(`  = updated  ${data.email} (${data.role})`);
  } else {
    user = await User.create(data);
    console.log(`  + created  ${data.email} (${data.role})`);
  }
  return user;
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...\n');

    console.log('Users:');
    await upsertUser(ADMIN);
    const demoUser = await upsertUser(DEMO_USER);

    console.log('\nEquipment:');
    const equipmentByName = {};
    for (const item of equipmentData) {
      const existing = await Equipment.findOne({ name: item.name });
      if (existing) {
        existing.category = item.category;
        existing.description = item.description;
        existing.pricePerDay = item.pricePerDay;
        existing.imageUrl = item.imageUrl;
        // Do not reset quantity/available: those reflect live reservations.
        await existing.save();
        equipmentByName[item.name] = existing;
        console.log(`  = updated  ${item.name} (${item.category})`);
      } else {
        const created = await Equipment.create(item);
        equipmentByName[item.name] = created;
        console.log(`  + created  ${item.name} (${item.category})`);
      }
    }

    // Sample rentals give the demo a story to tell. Only created once, so
    // re-running the seed never duplicates them or double-decrements stock.
    const existingSamples = await Rental.countDocuments({ user: demoUser._id });
    if (existingSamples === 0) {
      console.log('\nSample rentals:');

      const samples = [
        {
          equipment: equipmentByName['Professional Speaker System']._id,
          eventName: 'Annual Company Gala',
          startDate: daysFromNow(3),
          endDate: daysFromNow(5),
          quantity: 2,
          status: 'approved',
        },
        {
          equipment: equipmentByName['HD Projector']._id,
          eventName: 'Tech Conference 2026',
          startDate: daysFromNow(10),
          endDate: daysFromNow(12),
          quantity: 2,
          status: 'pending',
        },
        {
          equipment: equipmentByName['Banquet Table Set']._id,
          eventName: 'Wedding Reception',
          startDate: daysFromNow(-20),
          endDate: daysFromNow(-18),
          quantity: 5,
          status: 'returned',
        },
        {
          equipment: equipmentByName['Red Carpet Runner']._id,
          eventName: 'Product Launch',
          startDate: daysFromNow(-5),
          endDate: daysFromNow(-4),
          quantity: 1,
          status: 'cancelled',
        },
      ];

      for (const sample of samples) {
        const equipment = await Equipment.findById(sample.equipment);
        const days = Math.ceil((sample.endDate - sample.startDate) / (1000 * 60 * 60 * 24));
        const totalPrice = sample.quantity * equipment.pricePerDay * Math.max(days, 1);

        await Rental.create({
          user: demoUser._id,
          equipment: sample.equipment,
          eventName: sample.eventName,
          startDate: sample.startDate,
          endDate: sample.endDate,
          quantity: sample.quantity,
          totalPrice,
          status: sample.status,
        });

        // An approved rental holds stock until it is returned.
        if (sample.status === 'approved') {
          await Equipment.findByIdAndUpdate(sample.equipment, {
            $inc: { quantity: -sample.quantity },
          });
        }

        console.log(`  + ${sample.status.padEnd(9)} ${sample.eventName}`);
      }
    } else {
      console.log(`\nSample rentals already present (${existingSamples}) — left untouched.`);
    }

    // Keep availability flags consistent with remaining stock.
    const allEquipment = await Equipment.find();
    for (const eq of allEquipment) {
      const shouldBeAvailable = eq.quantity > 0;
      if (eq.available !== shouldBeAvailable) {
        eq.available = shouldBeAvailable;
        await eq.save();
      }
    }

    console.log('\nSeeding completed successfully!');
    console.log('Admin login: admin@example.com / Admin@123');
    console.log('Demo user  : user@example.com / User@123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
