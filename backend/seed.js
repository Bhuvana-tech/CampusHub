const mongoose = require('mongoose');
const User = require('./models/User');
const Note = require('./models/Note');
const Event = require('./models/Event');
const CafeteriaItem = require('./models/CafeteriaItem');
const CafeteriaStatus = require('./models/CafeteriaStatus');
const LostAndFound = require('./models/LostAndFound');

async function seedData() {
  console.log('Seeding data...');
  await Promise.all([
    User.deleteMany({}),
    Note.deleteMany({}),
    Event.deleteMany({}),
    CafeteriaItem.deleteMany({}),
    CafeteriaStatus.deleteMany({}),
    LostAndFound.deleteMany({})
  ]);

  const bcrypt = require('bcryptjs');
  const defaultPassword = await bcrypt.hash('password123', 10);

  const user1 = await User.create({
    name: 'Alice Johnson',
    email: 'alice@campus.edu',
    password: defaultPassword,
    branch: 'Computer Science',
    semester: '6',
    skills: ['React', 'Next.js', 'UI/UX'],
    interests: ['Hackathons', 'Design'],
    connections: [] // Will update after all created
  });

  const user2 = await User.create({
    name: 'Bob Smith',
    email: 'bob@campus.edu',
    password: defaultPassword,
    branch: 'Electronics',
    semester: '4',
    skills: ['Python', 'IoT', 'C++'],
    interests: ['Robotics', 'Gaming'],
    connections: [user1._id]
  });

  const user3 = await User.create({
    name: 'Charlie Davis',
    email: 'charlie@campus.edu',
    password: defaultPassword,
    branch: 'Mechanical',
    semester: '3',
    skills: ['CAD', 'Design', 'Physics'],
    interests: ['Automotive', 'Startups'],
    connections: [user1._id, user2._id]
  });

  // Update Alice to have Bob and Charlie as connections
  await User.findByIdAndUpdate(user1._id, { $set: { connections: [user2._id, user3._id] } });
  // Update Bob to have Charlie as well
  await User.findByIdAndUpdate(user2._id, { $addToSet: { connections: user3._id } });

  await Note.create([
    {
      title: 'Advanced React Patterns',
      subject: 'Web Development',
      uploader: 'Alice Johnson',
      rating: 4.8,
      tags: ['Highly Trusted', 'Exam Focused'],
      fileUrl: '/mock-url'
    },
    {
      title: 'Thermodynamics Cheat Sheet',
      subject: 'Physics',
      uploader: 'Charlie Davis',
      rating: 4.5,
      tags: ['Most Viewed'],
      fileUrl: '/mock-url'
    }
  ]);

  await Event.create([
    {
      title: 'Spring Campus Hackathon',
      date: new Date(Date.now() + 86400000),
      description: 'Join us for a 24-hour coding marathon to build solutions for campus life.',
      attendees: [user1._id, user2._id]
    },
    {
      title: 'Tech Talk: AI in 2024',
      date: new Date(Date.now() + 86400000 * 3),
      description: 'A deep dive into generative AI and its future.',
      attendees: [user1._id, user3._id]
    }
  ]);

  await CafeteriaItem.create([
    {
      itemName: 'Grilled Chicken Salad',
      price: 8.50,
      protein: 35,
      carbs: 15,
      isSpecial: true
    },
    {
      itemName: 'Vegan Buddha Bowl',
      price: 9.00,
      protein: 15,
      carbs: 45,
      isSpecial: false
    },
    {
      itemName: 'Classic Cheeseburger',
      price: 6.50,
      protein: 25,
      carbs: 40,
      isSpecial: false
    }
  ]);

  await CafeteriaStatus.create({
    notCrowded: 15,
    moderate: 24,
    crowded: 8,
    reactions: [
      { type: 'fast', count: 12 },
      { type: 'rush', count: 4 },
      { type: 'queue', count: 6 }
    ]
  });

  await LostAndFound.create([
    {
      type: 'lost',
      itemName: 'AirPods Pro 2',
      description: 'White case, no cover. Left it near the library entrance.',
      location: 'Central Library',
      contact: 'alice@campus.edu'
    },
    {
      type: 'found',
      itemName: 'Blue Hydro Flask',
      description: 'Found a 32oz blue water bottle with a sticker of a dog on it.',
      location: 'Main Auditorium, Row 4',
      contact: 'bob@campus.edu'
    }
  ]);

  console.log('Database seeded successfully');
}

module.exports = seedData;
