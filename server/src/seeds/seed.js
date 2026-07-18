import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Organization from '../models/Organization.model.js';
import User from '../models/User.model.js';
import Vehicle from '../models/Vehicle.model.js';
import Ride from '../models/Ride.model.js';
import Trip from '../models/Trip.model.js';

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing old database records...');
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Ride.deleteMany({});
    await Trip.deleteMany({});

    console.log('🏢 Creating Organization...');
    const org = await Organization.create({
      name: 'Odoo Pvt Ltd',
      registeredAddress: 'Odoo House, Infocity, Gandhinagar, Gujarat 382007',
      industry: 'Software Services',
      adminContact: 'admin@co.com',
      allowedEmailDomain: 'co.com',
      logo: 'https://ik.imagekit.io/default/odoo_logo.png',
      fuelCostPerLitre: 96.5,
      costPerKm: 8.0,
      travelCostOperational: 2.5,
    });

    console.log('👥 Creating Users (Admin & Employees)...');
    // Admin user
    const admin = await User.create({
      name: 'Odoo Admin',
      email: 'admin@co.com',
      password: 'Password123!',
      orgId: org._id,
      role: 'admin',
      isEmailVerified: true,
      platformAccess: true,
    });

    // Driver 1: Raj Patel
    const raj = await User.create({
      name: 'Raj Patel',
      email: 'raj.patel@co.com',
      password: 'Password123!',
      mobile: '9876543210',
      orgId: org._id,
      role: 'employee',
      department: 'Engineering',
      manager: 'Siddharth Shah',
      officeLocation: 'Tower A, Floor 5',
      profilePhoto: 'https://ik.imagekit.io/default/raj_patel.jpg',
      walletBalance: 500,
      trustScore: 4.8,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Driver 2: Krishna Singh
    const krishna = await User.create({
      name: 'Krishna Singh',
      email: 'krishna.s@co.com',
      password: 'Password123!',
      mobile: '8765432109',
      orgId: org._id,
      role: 'employee',
      department: 'Sales',
      manager: 'Nisha Vyas',
      officeLocation: 'Tower B, Floor 2',
      profilePhoto: 'https://ik.imagekit.io/default/krishna_s.jpg',
      walletBalance: 200,
      trustScore: 4.9,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Passenger: Priya Nair
    const priya = await User.create({
      name: 'Priya Nair',
      email: 'priya.nair@co.com',
      password: 'Password123!',
      mobile: '7654321098',
      orgId: org._id,
      role: 'employee',
      department: 'HR',
      manager: 'Anjali Sharma',
      officeLocation: 'Tower A, Floor 1',
      profilePhoto: 'https://ik.imagekit.io/default/priya_nair.jpg',
      walletBalance: 1000,
      trustScore: 5.0,
      isEmailVerified: true,
      platformAccess: true,
    });

    console.log('🚗 Registering and approving Vehicles...');
    // Raj's Swift Dzire
    const rajVehicle = await Vehicle.create({
      ownerId: raj._id,
      orgId: org._id,
      model: 'Swift Dzire',
      registrationNumber: 'GJ01AB1234',
      seatingCapacity: 4,
      fuelType: 'petrol',
      fuelEfficiency: 18,
      status: 'active',
      approvedAt: new Date(),
      approvedBy: admin._id,
    });

    // Krishna's Alto 800
    const krishnaVehicle = await Vehicle.create({
      ownerId: krishna._id,
      orgId: org._id,
      model: 'Alto 800',
      registrationNumber: 'GJ01AB5034',
      seatingCapacity: 4,
      fuelType: 'cng',
      fuelEfficiency: 22,
      status: 'active',
      approvedAt: new Date(),
      approvedBy: admin._id,
    });

    // Update org employee count
    await Organization.findByIdAndUpdate(org._id, { totalRegisteredEmployees: 4 });

    console.log('🏁 Seeding finished successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
