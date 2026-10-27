import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Child from '../models/Child.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const sampleChildren = [
  {
    name: 'Amina Khatun',
    age: 7,
    location: 'Rayerbazar, Dhaka',
    gender: 'female',
    story: 'Amina loves painting and dreams of becoming an architect so she can design sturdy homes for her community.',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    sponsoredStatus: false,
  },
  {
    name: 'Rahim Ullah',
    age: 9,
    location: 'Korail, Dhaka',
    gender: 'male',
    story: 'Rahim is fascinated by science and mathematics. He wants to become a computer engineer to build software for rural schools.',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80',
    sponsoredStatus: false,
  },
  {
    name: 'Nusrat Jahan',
    age: 11,
    location: 'Bandarban Hill Tracts',
    gender: 'female',
    story: 'Nusrat walks two miles every morning to attend classes. She hopes to become a doctor to serve remote tribal communities.',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    sponsoredStatus: false,
  },
  {
    name: 'Tanvir Hossain',
    age: 8,
    location: 'Chittagong Coastal Belt',
    gender: 'male',
    story: 'Tanvir is an enthusiastic storyteller. After losing his family home to flooding, he is eager to study environmental sciences.',
    imageUrl: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=600&q=80',
    sponsoredStatus: false,
  },
  {
    name: 'Sumaiya Akter',
    age: 12,
    location: 'Sylhet Tea Gardens',
    gender: 'female',
    story: 'Sumaiya is the top student in her English literature class. She aspires to become a school teacher in her local community.',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    sponsoredStatus: false,
  },
  {
    name: 'Siam Mahmud',
    age: 6,
    location: 'Kurigram, Rangpur',
    gender: 'male',
    story: 'Siam is full of energy and loves puzzle games. With sponsorship support, he can attend early childhood preparatory schooling.',
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
    sponsoredStatus: false,
  },
];

export const seedChildren = async () => {
  try {
    const count = await Child.countDocuments();
    if (count === 0) {
      await Child.insertMany(sampleChildren);
      console.log(`[ChildSeed] Seeded ${sampleChildren.length} sample children profiles.`);
    }
  } catch (error) {
    console.error('[ChildSeed Error]:', error.message);
  }
};

const runStandalone = async () => {
  try {
    await connectDB();
    await seedChildren();
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].endsWith('childSeed.js')) {
  runStandalone();
}
