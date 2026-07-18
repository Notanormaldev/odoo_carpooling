import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';
import Vehicle from '../models/Vehicle.model.js';

const diagnose = async () => {
  await connectDB();
  const user = await User.findOne({ email: 'raj.patel@co.com' });
  if (!user) {
    console.log('❌ User raj.patel@co.com not found in DB!');
  } else {
    console.log('✅ User found in DB:', user._id, user.name, 'DL:', user.drivingLicense);
    const vehicles = await Vehicle.find({ ownerId: user._id });
    console.log(`✅ Vehicles count: ${vehicles.length}`);
    vehicles.forEach(v => {
      console.log(`   - Model: ${v.model}, Reg: ${v.registrationNumber}, Status: ${v.status}`);
    });
  }
  mongoose.connection.close();
};

diagnose();
