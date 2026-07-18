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
import WalletTransaction from '../models/WalletTransaction.model.js';

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing old database records...');
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Ride.deleteMany({});
    await Trip.deleteMany({});
    await WalletTransaction.deleteMany({});

    console.log('🏢 Creating Organization...');
    const org = await Organization.create({
      name: 'Odoo Pvt Ltd',
      registeredAddress: 'Odoo House, Infocity, Gandhinagar, Gujarat 382007',
      industry: 'Software Services',
      adminContact: 'admin@co.com',
      allowedEmailDomain: 'co.com',
      logo: '/logo.png',
      fuelCostPerLitre: 96.5,
      costPerKm: 8.0,
      travelCostOperational: 2.5,
    });

    console.log('👥 Creating Users (Admin, Drivers & Employees)...');
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

    // 10 Employee users
    const raj = await User.create({
      name: 'Raj Patel',
      email: 'rajpatel@gmail.com',
      password: 'Password123!',
      mobile: '9876543210',
      orgId: org._id,
      role: 'admin',
      department: 'Engineering',
      manager: 'Siddharth Shah',
      officeLocation: 'Tower A, Floor 5',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      drivingLicense: 'DL-IND-9992388',
      drivingLicenseStatus: 'approved',
      walletBalance: 2500,
      trustScore: 4.8,
      isEmailVerified: true,
      platformAccess: true,
    });

    const sujal = await User.create({
      name: 'Sujal Patel',
      email: 'sujalpanchal25072005@gmail.com',
      password: 'Password123!',
      mobile: '9898989000',
      orgId: org._id,
      role: 'admin',
      department: 'Engineering',
      manager: 'Siddharth Shah',
      officeLocation: 'Tower E',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      drivingLicense: 'DL-IND-9992389',
      drivingLicenseStatus: 'approved',
      walletBalance: 2500,
      trustScore: 4.8,
      isEmailVerified: true,
      platformAccess: true,
    });

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
      profilePhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      drivingLicense: 'DL-IND-8883299',
      drivingLicenseStatus: 'approved',
      walletBalance: 1200,
      trustScore: 4.9,
      isEmailVerified: true,
      platformAccess: true,
    });

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
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      walletBalance: 1800,
      trustScore: 5.0,
      isEmailVerified: true,
      platformAccess: true,
    });

    const amit = await User.create({
      name: 'Amit Sharma',
      email: 'amit.sharma@co.com',
      password: 'Password123!',
      mobile: '9654321876',
      orgId: org._id,
      role: 'employee',
      department: 'Marketing',
      manager: 'Nisha Vyas',
      officeLocation: 'Tower B, Floor 3',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      drivingLicense: 'DL-IND-7776512',
      drivingLicenseStatus: 'approved',
      walletBalance: 850,
      trustScore: 4.6,
      isEmailVerified: true,
      platformAccess: true,
    });

    const sneha = await User.create({
      name: 'Sneha Gupta',
      email: 'sneha.gupta@co.com',
      password: 'Password123!',
      mobile: '8543210987',
      orgId: org._id,
      role: 'employee',
      department: 'Product',
      manager: 'Siddharth Shah',
      officeLocation: 'Tower A, Floor 4',
      profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      walletBalance: 3100,
      trustScore: 4.7,
      isEmailVerified: true,
      platformAccess: true,
    });

    const rohan = await User.create({
      name: 'Rohan Mehta',
      email: 'rohan.mehta@co.com',
      password: 'Password123!',
      mobile: '7432109876',
      orgId: org._id,
      role: 'employee',
      department: 'Finance',
      manager: 'Ketan Patel',
      officeLocation: 'Tower B, Floor 1',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      drivingLicense: 'DL-IND-6663245',
      drivingLicenseStatus: 'approved',
      walletBalance: 900,
      trustScore: 4.5,
      isEmailVerified: true,
      platformAccess: true,
    });

    const divya = await User.create({
      name: 'Divya Desai',
      email: 'divya.desai@co.com',
      password: 'Password123!',
      mobile: '6321098765',
      orgId: org._id,
      role: 'employee',
      department: 'Support',
      manager: 'Anjali Sharma',
      officeLocation: 'Tower A, Floor 2',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      walletBalance: 400,
      trustScore: 4.8,
      isEmailVerified: true,
      platformAccess: true,
    });

    const rahul = await User.create({
      name: 'Rahul Verma',
      email: 'rahul.verma@co.com',
      password: 'Password123!',
      mobile: '9210987654',
      orgId: org._id,
      role: 'employee',
      department: 'Engineering',
      manager: 'Siddharth Shah',
      officeLocation: 'Tower A, Floor 5',
      profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      drivingLicense: 'DL-IND-5554312',
      walletBalance: 1500,
      trustScore: 4.4,
      isEmailVerified: true,
      platformAccess: true,
    });

    console.log('🚗 Registering and approving Vehicles...');
    // Vehicles
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

    const sujalVehicle = await Vehicle.create({
      ownerId: sujal._id,
      orgId: org._id,
      model: 'Honda City',
      registrationNumber: 'GJ01AB9999',
      seatingCapacity: 4,
      fuelType: 'petrol',
      fuelEfficiency: 16,
      status: 'active',
      approvedAt: new Date(),
      approvedBy: admin._id,
    });

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

    const amitVehicle = await Vehicle.create({
      ownerId: amit._id,
      orgId: org._id,
      model: 'Hyundai i20',
      registrationNumber: 'GJ01CD9876',
      seatingCapacity: 4,
      fuelType: 'diesel',
      fuelEfficiency: 20,
      status: 'active',
      approvedAt: new Date(),
      approvedBy: admin._id,
    });

    const rohanVehicle = await Vehicle.create({
      ownerId: rohan._id,
      orgId: org._id,
      model: 'Honda City',
      registrationNumber: 'GJ01EF4321',
      seatingCapacity: 5,
      fuelType: 'petrol',
      fuelEfficiency: 15,
      status: 'active',
      approvedAt: new Date(),
      approvedBy: admin._id,
    });

    const rahulVehicle = await Vehicle.create({
      ownerId: rahul._id,
      orgId: org._id,
      model: 'Tata Nexon',
      registrationNumber: 'GJ01GH5555',
      seatingCapacity: 5,
      fuelType: 'cng',
      fuelEfficiency: 16,
      status: 'active',
      approvedAt: new Date(),
      approvedBy: admin._id,
    });

    // Update org employee count
    await Organization.findByIdAndUpdate(org._id, { totalRegisteredEmployees: 9 });

    console.log('📅 Seeding Ride Pools and Trips...');

    // Future ride 1 (Raj)
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 2);
    futureDate1.setHours(9, 0, 0, 0);

    const ride1 = await Ride.create({
      driverId: raj._id,
      vehicleId: rajVehicle._id,
      orgId: org._id,
      startLocation: { address: 'Sargasan, Gandhinagar', lat: 23.1947, lng: 72.6105 },
      destination: { address: 'Infocity, Gandhinagar', lat: 23.1974, lng: 72.6326 },
      dateTime: futureDate1,
      totalSeats: 3,
      availableSeats: 2,
      farePerSeat: 80,
      status: 'published',
    });

    // Future ride 2 (Krishna)
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 1);
    futureDate2.setHours(18, 30, 0, 0);

    const ride2 = await Ride.create({
      driverId: krishna._id,
      vehicleId: krishnaVehicle._id,
      orgId: org._id,
      startLocation: { address: 'GIFT City, Gandhinagar', lat: 23.1594, lng: 72.6844 },
      destination: { address: 'Sargasan, Gandhinagar', lat: 23.1947, lng: 72.6105 },
      dateTime: futureDate2,
      totalSeats: 3,
      availableSeats: 2,
      farePerSeat: 120,
      status: 'published',
    });

    // Future ride 3 (Amit)
    const futureDate3 = new Date();
    futureDate3.setDate(futureDate3.getDate() + 3);
    futureDate3.setHours(8, 30, 0, 0);

    const ride3 = await Ride.create({
      driverId: amit._id,
      vehicleId: amitVehicle._id,
      orgId: org._id,
      startLocation: { address: 'Vastrapur, Ahmedabad', lat: 23.0379, lng: 72.5273 },
      destination: { address: 'Infocity, Gandhinagar', lat: 23.1974, lng: 72.6326 },
      dateTime: futureDate3,
      totalSeats: 3,
      availableSeats: 3,
      farePerSeat: 150,
      status: 'published',
    });

    // Future ride 4 (Rohan)
    const futureDate4 = new Date();
    futureDate4.setDate(futureDate4.getDate() + 4);
    futureDate4.setHours(17, 45, 0, 0);

    const ride4 = await Ride.create({
      driverId: rohan._id,
      vehicleId: rohanVehicle._id,
      orgId: org._id,
      startLocation: { address: 'Infocity, Gandhinagar', lat: 23.1974, lng: 72.6326 },
      destination: { address: 'Prahlad Nagar, Ahmedabad', lat: 22.9982, lng: 72.5034 },
      dateTime: futureDate4,
      totalSeats: 4,
      availableSeats: 4,
      farePerSeat: 180,
      status: 'published',
    });

    // Future ride 5 (Rahul)
    const futureDate5 = new Date();
    futureDate5.setDate(futureDate5.getDate() + 1);
    futureDate5.setHours(9, 15, 0, 0);

    const ride5 = await Ride.create({
      driverId: rahul._id,
      vehicleId: rahulVehicle._id,
      orgId: org._id,
      startLocation: { address: 'Chandkheda, Ahmedabad', lat: 23.1118, lng: 72.5855 },
      destination: { address: 'Infocity, Gandhinagar', lat: 23.1974, lng: 72.6326 },
      dateTime: futureDate5,
      totalSeats: 4,
      availableSeats: 3,
      farePerSeat: 90,
      status: 'published',
    });

    // July 31 rides (Ahmedabad to Gandhinagar)
    const jul31Date1 = new Date('2026-07-31T09:00:00.000Z');
    await Ride.create({
      driverId: raj._id,
      vehicleId: rajVehicle._id,
      orgId: org._id,
      startLocation: { address: 'Ahmedabad (ISKCON Circle)', lat: 23.0225, lng: 72.5714 },
      destination: { address: 'Gandhinagar (Infocity)', lat: 23.1974, lng: 72.6326 },
      dateTime: jul31Date1,
      totalSeats: 3,
      availableSeats: 3,
      farePerSeat: 120,
      status: 'published',
    });

    const jul31Date2 = new Date('2026-07-31T18:30:00.000Z');
    await Ride.create({
      driverId: krishna._id,
      vehicleId: krishnaVehicle._id,
      orgId: org._id,
      startLocation: { address: 'Ahmedabad (C G Road)', lat: 23.0258, lng: 72.5594 },
      destination: { address: 'Gandhinagar (Sector 21)', lat: 23.2244, lng: 72.6489 },
      dateTime: jul31Date2,
      totalSeats: 4,
      availableSeats: 4,
      farePerSeat: 100,
      status: 'published',
    });

    console.log('📌 Creating active trips (bookings)...');
    // Priya booked Raj's future ride
    const trip1 = await Trip.create({
      rideId: ride1._id,
      passengerId: priya._id,
      driverId: raj._id,
      orgId: org._id,
      seatsBooked: 1,
      fare: 80,
      status: 'booked',
    });
    ride1.passengers.push({ userId: priya._id, tripId: trip1._id, seatsBooked: 1 });
    await ride1.save();

    // Raj booked Krishna's future ride
    const trip2 = await Trip.create({
      rideId: ride2._id,
      passengerId: raj._id,
      driverId: krishna._id,
      orgId: org._id,
      seatsBooked: 1,
      fare: 120,
      status: 'booked',
    });
    ride2.passengers.push({ userId: raj._id, tripId: trip2._id, seatsBooked: 1 });
    await ride2.save();

    // Sneha booked Rahul's future ride
    const trip3 = await Trip.create({
      rideId: ride5._id,
      passengerId: sneha._id,
      driverId: rahul._id,
      orgId: org._id,
      seatsBooked: 1,
      fare: 90,
      status: 'booked',
    });
    ride5.passengers.push({ userId: sneha._id, tripId: trip3._id, seatsBooked: 1 });
    await ride5.save();

    console.log('📌 Seeding Completed (Past) Trips...');
    // Past Ride 1
    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 5);
    const pastRide1 = await Ride.create({
      driverId: raj._id,
      vehicleId: rajVehicle._id,
      orgId: org._id,
      startLocation: { address: 'Sargasan, Gandhinagar', lat: 23.1947, lng: 72.6105 },
      destination: { address: 'Infocity, Gandhinagar', lat: 23.1974, lng: 72.6326 },
      dateTime: pastDate1,
      totalSeats: 3,
      availableSeats: 2,
      farePerSeat: 80,
      status: 'completed',
      distanceKm: 8,
      durationMin: 15,
      passengers: [{ userId: priya._id, seatsBooked: 1 }],
    });

    const pastTrip1 = await Trip.create({
      rideId: pastRide1._id,
      passengerId: priya._id,
      driverId: raj._id,
      orgId: org._id,
      seatsBooked: 1,
      fare: 80,
      status: 'completed_paid',
      distanceKm: 8,
      co2SavedKg: 0.96,
      fuelSavedLitres: 0.53,
      bookedAt: pastDate1,
      startedAt: pastDate1,
      completedAt: pastDate1,
      paidAt: pastDate1,
    });

    // Past Ride 2
    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 3);
    const pastRide2 = await Ride.create({
      driverId: krishna._id,
      vehicleId: krishnaVehicle._id,
      orgId: org._id,
      startLocation: { address: 'Ahmedabad (ISKCON)', lat: 23.0225, lng: 72.5714 },
      destination: { address: 'Gandhinagar (Infocity)', lat: 23.1974, lng: 72.6326 },
      dateTime: pastDate2,
      totalSeats: 3,
      availableSeats: 2,
      farePerSeat: 120,
      status: 'completed',
      distanceKm: 25,
      durationMin: 35,
      passengers: [{ userId: raj._id, seatsBooked: 1 }],
    });

    const pastTrip2 = await Trip.create({
      rideId: pastRide2._id,
      passengerId: raj._id,
      driverId: krishna._id,
      orgId: org._id,
      seatsBooked: 1,
      fare: 120,
      status: 'completed_paid',
      distanceKm: 25,
      co2SavedKg: 3.0,
      fuelSavedLitres: 1.66,
      bookedAt: pastDate2,
      startedAt: pastDate2,
      completedAt: pastDate2,
      paidAt: pastDate2,
    });

    // Past Ride 3
    const pastDate3 = new Date();
    pastDate3.setDate(pastDate3.getDate() - 2);
    const pastRide3 = await Ride.create({
      driverId: amit._id,
      vehicleId: amitVehicle._id,
      orgId: org._id,
      startLocation: { address: 'Vastrapur, Ahmedabad', lat: 23.0379, lng: 72.5273 },
      destination: { address: 'Infocity, Gandhinagar', lat: 23.1974, lng: 72.6326 },
      dateTime: pastDate3,
      totalSeats: 3,
      availableSeats: 1,
      farePerSeat: 150,
      status: 'completed',
      distanceKm: 22,
      durationMin: 30,
      passengers: [{ userId: sneha._id, seatsBooked: 1 }, { userId: divya._id, seatsBooked: 1 }],
    });

    const pastTrip3 = await Trip.create({
      rideId: pastRide3._id,
      passengerId: sneha._id,
      driverId: amit._id,
      orgId: org._id,
      seatsBooked: 1,
      fare: 150,
      status: 'completed_paid',
      distanceKm: 22,
      co2SavedKg: 2.64,
      fuelSavedLitres: 1.46,
      bookedAt: pastDate3,
      startedAt: pastDate3,
      completedAt: pastDate3,
      paidAt: pastDate3,
    });

    const pastTrip4 = await Trip.create({
      rideId: pastRide3._id,
      passengerId: divya._id,
      driverId: amit._id,
      orgId: org._id,
      seatsBooked: 1,
      fare: 150,
      status: 'completed_paid',
      distanceKm: 22,
      co2SavedKg: 2.64,
      fuelSavedLitres: 1.46,
      bookedAt: pastDate3,
      startedAt: pastDate3,
      completedAt: pastDate3,
      paidAt: pastDate3,
    });

    console.log('📌 Seeding wallet transactions...');
    await WalletTransaction.create([
      // Trip 1
      {
        userId: priya._id,
        type: 'debit',
        amount: 80,
        balanceBefore: 1880,
        balanceAfter: 1800,
        description: `Fare payment for Trip #${pastTrip1._id.toString().slice(-6)}`,
        referenceId: pastTrip1._id,
        referenceModel: 'Trip',
      },
      {
        userId: raj._id,
        type: 'credit',
        amount: 80,
        balanceBefore: 2420,
        balanceAfter: 2500,
        description: `Fare received for Trip #${pastTrip1._id.toString().slice(-6)}`,
        referenceId: pastTrip1._id,
        referenceModel: 'Trip',
      },
      // Trip 2
      {
        userId: raj._id,
        type: 'debit',
        amount: 120,
        balanceBefore: 2500,
        balanceAfter: 2380,
        description: `Fare payment for Trip #${pastTrip2._id.toString().slice(-6)}`,
        referenceId: pastTrip2._id,
        referenceModel: 'Trip',
      },
      {
        userId: krishna._id,
        type: 'credit',
        amount: 120,
        balanceBefore: 1080,
        balanceAfter: 1200,
        description: `Fare received for Trip #${pastTrip2._id.toString().slice(-6)}`,
        referenceId: pastTrip2._id,
        referenceModel: 'Trip',
      },
      // Trip 3 (Sneha)
      {
        userId: sneha._id,
        type: 'debit',
        amount: 150,
        balanceBefore: 3250,
        balanceAfter: 3100,
        description: `Fare payment for Trip #${pastTrip3._id.toString().slice(-6)}`,
        referenceId: pastTrip3._id,
        referenceModel: 'Trip',
      },
      // Trip 4 (Divya)
      {
        userId: divya._id,
        type: 'debit',
        amount: 150,
        balanceBefore: 550,
        balanceAfter: 400,
        description: `Fare payment for Trip #${pastTrip4._id.toString().slice(-6)}`,
        referenceId: pastTrip4._id,
        referenceModel: 'Trip',
      },
      // Amit Credits
      {
        userId: amit._id,
        type: 'credit',
        amount: 150,
        balanceBefore: 550,
        balanceAfter: 700,
        description: `Fare received for Trip #${pastTrip3._id.toString().slice(-6)}`,
        referenceId: pastTrip3._id,
        referenceModel: 'Trip',
      },
      {
        userId: amit._id,
        type: 'credit',
        amount: 150,
        balanceBefore: 700,
        balanceAfter: 850,
        description: `Fare received for Trip #${pastTrip4._id.toString().slice(-6)}`,
        referenceId: pastTrip4._id,
        referenceModel: 'Trip',
      }
    ]);

    // Update user stats
    priya.totalRides = 1;
    priya.co2SavedKg = 0.96;
    await priya.save();

    raj.totalRides = 1;
    raj.totalRidesOffered = 1;
    raj.co2SavedKg = 3.0;
    await raj.save();

    sneha.totalRides = 1;
    sneha.co2SavedKg = 2.64;
    await sneha.save();

    divya.totalRides = 1;
    divya.co2SavedKg = 2.64;
    await divya.save();

    amit.totalRidesOffered = 2;
    await amit.save();

    console.log('🏁 Seeding finished successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
