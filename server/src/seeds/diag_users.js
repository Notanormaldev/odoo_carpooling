import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';

const diagnose = async () => {
  await connectDB();
  const users = await User.find({});
  console.log('--- USERS IN DATABASE ---');
  users.forEach(u => {
    console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, GoogleID: ${u.googleId}`);
  });
  mongoose.connection.close();
};

diagnose();
