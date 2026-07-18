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

const mkDate = (daysFromNow, hour, min = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, min, 0, 0);
  return d;
};

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
      registeredAddress: 'Odoo House, Gandhinagar, Gujarat 382007',
      industry: 'Software Services',
      adminContact: 'rajpatel@gmail.com',
      allowedEmailDomain: 'co.com',
      logo: '/logo.png',
      fuelCostPerLitre: 96.5,
      costPerKm: 8.0,
      travelCostOperational: 2.5,
    });

    console.log('👥 Creating Users across Gujarat cities...');

    // Admin — Ahmedabad
    const raj = await User.create({
      name: 'Raj Patel',
      email: 'rajpatel@gmail.com',
      password: 'Password123!',
      mobile: '9876543210',
      orgId: org._id,
      role: 'admin',
      department: 'Engineering',
      manager: 'Siddharth Shah',
      officeLocation: 'Gandhinagar HQ',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      drivingLicense: 'DL-GJ-AHM-001',
      drivingLicenseStatus: 'approved',
      walletBalance: 2500,
      trustScore: 4.8,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Sujal — test account
    const sujal = await User.create({
      name: 'Sujal Panchal',
      email: 'sujalpanchal25072005@gmaiil.com',
      password: 'Password123!',
      mobile: '9898989000',
      orgId: org._id,
      role: 'employee',
      department: 'Engineering',
      manager: 'Raj Patel',
      officeLocation: 'Gandhinagar HQ',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      drivingLicense: 'DL-GJ-AHM-002',
      drivingLicenseStatus: 'approved',
      walletBalance: 2500,
      trustScore: 4.8,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Surat employee
    const nirav = await User.create({
      name: 'Nirav Shah',
      email: 'nirav.shah@co.com',
      password: 'Password123!',
      mobile: '9765432100',
      orgId: org._id,
      role: 'employee',
      department: 'Sales',
      manager: 'Nisha Vyas',
      officeLocation: 'Surat Branch',
      profilePhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      drivingLicense: 'DL-GJ-SUR-001',
      drivingLicenseStatus: 'approved',
      walletBalance: 1800,
      trustScore: 4.7,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Vadodara employee
    const meera = await User.create({
      name: 'Meera Desai',
      email: 'meera.desai@co.com',
      password: 'Password123!',
      mobile: '8765401234',
      orgId: org._id,
      role: 'employee',
      department: 'HR',
      manager: 'Anjali Sharma',
      officeLocation: 'Vadodara Office',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      walletBalance: 1500,
      trustScore: 5.0,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Rajkot employee — driver (with pending license for verification testing)
    const arjun = await User.create({
      name: 'Arjun Mehta',
      email: 'arjun.mehta@co.com',
      password: 'Password123!',
      mobile: '9654321776',
      orgId: org._id,
      role: 'employee',
      department: 'Marketing',
      manager: 'Nisha Vyas',
      officeLocation: 'Rajkot Office',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      drivingLicense: 'DL-03201800999',
      drivingLicenseStatus: 'pending',
      drivingLicensePhoto: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800',
      drivingLicenseAiStatus: 'verified',
      drivingLicenseAiDetails: {
        name: 'ARJUN MEHTA',
        licenseNumber: 'DL-03201800999',
        dob: '14/11/1993',
        validity: '09/07/2030'
      },
      walletBalance: 1200,
      trustScore: 4.6,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Bhavnagar employee — driver
    const kavita = await User.create({
      name: 'Kavita Trivedi',
      email: 'kavita.trivedi@co.com',
      password: 'Password123!',
      mobile: '8543210977',
      orgId: org._id,
      role: 'employee',
      department: 'Product',
      manager: 'Siddharth Shah',
      officeLocation: 'Bhavnagar Branch',
      profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      drivingLicense: 'DL-GJ-BHN-001',
      drivingLicenseStatus: 'approved',
      walletBalance: 2200,
      trustScore: 4.9,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Anand employee — driver
    const rohan = await User.create({
      name: 'Rohan Patel',
      email: 'rohan.patel@co.com',
      password: 'Password123!',
      mobile: '7432109866',
      orgId: org._id,
      role: 'employee',
      department: 'Finance',
      manager: 'Ketan Patel',
      officeLocation: 'Anand Office',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      drivingLicense: 'DL-GJ-AND-001',
      drivingLicenseStatus: 'approved',
      walletBalance: 900,
      trustScore: 4.5,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Gandhinagar employee (no vehicle)
    const priya = await User.create({
      name: 'Priya Nair',
      email: 'priya.nair@co.com',
      password: 'Password123!',
      mobile: '7654321098',
      orgId: org._id,
      role: 'employee',
      department: 'Design',
      manager: 'Anjali Sharma',
      officeLocation: 'Gandhinagar HQ',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      walletBalance: 1800,
      trustScore: 4.8,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Mehsana employee — driver
    const rahul = await User.create({
      name: 'Rahul Joshi',
      email: 'rahul.joshi@co.com',
      password: 'Password123!',
      mobile: '9210987644',
      orgId: org._id,
      role: 'employee',
      department: 'Engineering',
      manager: 'Raj Patel',
      officeLocation: 'Mehsana Branch',
      profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      drivingLicense: 'DL-GJ-MSN-001',
      drivingLicenseStatus: 'approved',
      walletBalance: 1500,
      trustScore: 4.4,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Jamnagar employee (no vehicle)
    const divya = await User.create({
      name: 'Divya Gohil',
      email: 'divya.gohil@co.com',
      password: 'Password123!',
      mobile: '6321098755',
      orgId: org._id,
      role: 'employee',
      department: 'Support',
      manager: 'Anjali Sharma',
      officeLocation: 'Jamnagar Office',
      profilePhoto: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150',
      walletBalance: 400,
      trustScore: 4.7,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Vapi employee — driver
    const amit = await User.create({
      name: 'Amit Bhanushali',
      email: 'amit.bhanushali@co.com',
      password: 'Password123!',
      mobile: '9081234567',
      orgId: org._id,
      role: 'employee',
      department: 'Operations',
      manager: 'Ketan Patel',
      officeLocation: 'Vapi Office',
      profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      drivingLicense: 'DL-GJ-VAP-001',
      drivingLicenseStatus: 'approved',
      walletBalance: 1100,
      trustScore: 4.6,
      isEmailVerified: true,
      platformAccess: true,
    });

    // Delhi/Gandhinagar employee — Lipika Saikia Rao (with pending Delhi DL)
    const lipika = await User.create({
      name: 'Lipika Saikia Rao',
      email: 'lipika.rao@co.com',
      password: 'Password123!',
      mobile: '9123456789',
      orgId: org._id,
      role: 'employee',
      department: 'HR',
      manager: 'Anjali Sharma',
      officeLocation: 'Gandhinagar HQ',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      drivingLicense: 'DL-11201603560',
      drivingLicenseStatus: 'pending',
      drivingLicensePhoto: '/seeds/delhi-dl.png',
      drivingLicenseAiStatus: 'verified',
      drivingLicenseAiDetails: {
        name: 'LIPIKA SAIKIA RAO',
        licenseNumber: 'DL-11201603560',
        dob: '25/06/1981',
        validity: '09/07/2028'
      },
      walletBalance: 1500,
      trustScore: 5.0,
      isEmailVerified: true,
      platformAccess: true,
    });

    console.log('🚗 Registering Vehicles...');

    const rajVehicle = await Vehicle.create({
      ownerId: raj._id, orgId: org._id,
      model: 'Maruti Swift Dzire', registrationNumber: 'GJ01AB1001',
      seatingCapacity: 4, fuelType: 'petrol', fuelEfficiency: 18,
      status: 'active', approvedAt: new Date(), approvedBy: raj._id,
    });

    const sujalVehicle = await Vehicle.create({
      ownerId: sujal._id, orgId: org._id,
      model: 'Honda City', registrationNumber: 'GJ01AB1002',
      seatingCapacity: 4, fuelType: 'petrol', fuelEfficiency: 16,
      status: 'active', approvedAt: new Date(), approvedBy: raj._id,
    });

    const niravVehicle = await Vehicle.create({
      ownerId: nirav._id, orgId: org._id,
      model: 'Hyundai Creta', registrationNumber: 'GJ06AB2001',
      seatingCapacity: 5, fuelType: 'diesel', fuelEfficiency: 17,
      status: 'active', approvedAt: new Date(), approvedBy: raj._id,
    });

    const arjunVehicle = await Vehicle.create({
      ownerId: arjun._id, orgId: org._id,
      model: 'Tata Nexon', registrationNumber: 'GJ03AB3001',
      seatingCapacity: 5, fuelType: 'cng', fuelEfficiency: 22,
      status: 'active', approvedAt: new Date(), approvedBy: raj._id,
    });

    const kavitaVehicle = await Vehicle.create({
      ownerId: kavita._id, orgId: org._id,
      model: 'Alto K10', registrationNumber: 'GJ08AB4001',
      seatingCapacity: 4, fuelType: 'cng', fuelEfficiency: 24,
      status: 'active', approvedAt: new Date(), approvedBy: raj._id,
    });

    const rohanVehicle = await Vehicle.create({
      ownerId: rohan._id, orgId: org._id,
      model: 'Honda Amaze', registrationNumber: 'GJ23AB5001',
      seatingCapacity: 4, fuelType: 'petrol', fuelEfficiency: 19,
      status: 'active', approvedAt: new Date(), approvedBy: raj._id,
    });

    const rahulVehicle = await Vehicle.create({
      ownerId: rahul._id, orgId: org._id,
      model: 'WagonR CNG', registrationNumber: 'GJ09AB6001',
      seatingCapacity: 4, fuelType: 'cng', fuelEfficiency: 26,
      status: 'active', approvedAt: new Date(), approvedBy: raj._id,
    });

    const amitVehicle = await Vehicle.create({
      ownerId: amit._id, orgId: org._id,
      model: 'Hyundai i20', registrationNumber: 'GJ17AB7001',
      seatingCapacity: 4, fuelType: 'petrol', fuelEfficiency: 18,
      status: 'active', approvedAt: new Date(), approvedBy: raj._id,
    });

    await Organization.findByIdAndUpdate(org._id, { totalRegisteredEmployees: 12 });

    console.log('📅 Seeding Rides across Gujarat...');

    // ===== FUTURE RIDES =====

    // Ahmedabad → Gandhinagar (Raj)
    const ride1 = await Ride.create({
      driverId: raj._id, vehicleId: rajVehicle._id, orgId: org._id,
      startLocation: { address: 'Ahmedabad (Naroda)', lat: 23.0689, lng: 72.6531 },
      destination: { address: 'Gandhinagar (Sector 11)', lat: 23.2156, lng: 72.6369 },
      dateTime: mkDate(1, 8, 30), totalSeats: 3, availableSeats: 2, farePerSeat: 110, status: 'published',
    });

    // Surat → Vadodara (Nirav)
    const ride2 = await Ride.create({
      driverId: nirav._id, vehicleId: niravVehicle._id, orgId: org._id,
      startLocation: { address: 'Surat (Athwa Gate)', lat: 21.1939, lng: 72.8319 },
      destination: { address: 'Vadodara (Alkapuri)', lat: 22.3178, lng: 73.1780 },
      dateTime: mkDate(1, 7, 0), totalSeats: 4, availableSeats: 3, farePerSeat: 250, status: 'published',
    });

    // Rajkot → Ahmedabad (Arjun)
    const ride3 = await Ride.create({
      driverId: arjun._id, vehicleId: arjunVehicle._id, orgId: org._id,
      startLocation: { address: 'Rajkot (Kalawad Road)', lat: 22.3070, lng: 70.7769 },
      destination: { address: 'Ahmedabad (Sarkhej)', lat: 23.0060, lng: 72.5100 },
      dateTime: mkDate(2, 6, 30), totalSeats: 4, availableSeats: 4, farePerSeat: 350, status: 'published',
    });

    // Bhavnagar → Ahmedabad (Kavita)
    const ride4 = await Ride.create({
      driverId: kavita._id, vehicleId: kavitaVehicle._id, orgId: org._id,
      startLocation: { address: 'Bhavnagar (Crescent Circle)', lat: 21.7671, lng: 72.1516 },
      destination: { address: 'Ahmedabad (Paldi)', lat: 23.0156, lng: 72.5698 },
      dateTime: mkDate(2, 7, 0), totalSeats: 3, availableSeats: 3, farePerSeat: 300, status: 'published',
    });

    // Anand → Ahmedabad (Rohan)
    const ride5 = await Ride.create({
      driverId: rohan._id, vehicleId: rohanVehicle._id, orgId: org._id,
      startLocation: { address: 'Anand (Vallabh Vidyanagar)', lat: 22.5409, lng: 72.9222 },
      destination: { address: 'Ahmedabad (Navrangpura)', lat: 23.0341, lng: 72.5630 },
      dateTime: mkDate(2, 8, 0), totalSeats: 3, availableSeats: 2, farePerSeat: 140, status: 'published',
    });

    // Mehsana → Gandhinagar (Rahul)
    const ride6 = await Ride.create({
      driverId: rahul._id, vehicleId: rahulVehicle._id, orgId: org._id,
      startLocation: { address: 'Mehsana (Bus Stand)', lat: 23.5880, lng: 72.3693 },
      destination: { address: 'Gandhinagar (Sector 7)', lat: 23.2156, lng: 72.6369 },
      dateTime: mkDate(3, 7, 30), totalSeats: 4, availableSeats: 4, farePerSeat: 160, status: 'published',
    });

    // Vapi → Surat (Amit)
    const ride7 = await Ride.create({
      driverId: amit._id, vehicleId: amitVehicle._id, orgId: org._id,
      startLocation: { address: 'Vapi (Industrial Area)', lat: 20.3718, lng: 72.9090 },
      destination: { address: 'Surat (Adajan)', lat: 21.2080, lng: 72.7900 },
      dateTime: mkDate(3, 8, 0), totalSeats: 4, availableSeats: 4, farePerSeat: 180, status: 'published',
    });

    // Ahmedabad → Surat (Raj)
    await Ride.create({
      driverId: raj._id, vehicleId: rajVehicle._id, orgId: org._id,
      startLocation: { address: 'Ahmedabad (Maninagar)', lat: 22.9973, lng: 72.6000 },
      destination: { address: 'Surat (Vesu)', lat: 21.1530, lng: 72.7800 },
      dateTime: mkDate(4, 17, 30), totalSeats: 3, availableSeats: 3, farePerSeat: 280, status: 'published',
    });

    // Vadodara → Surat (Nirav)
    await Ride.create({
      driverId: nirav._id, vehicleId: niravVehicle._id, orgId: org._id,
      startLocation: { address: 'Vadodara (Fatehgunj)', lat: 22.3245, lng: 73.2000 },
      destination: { address: 'Surat (Ring Road)', lat: 21.2095, lng: 72.8311 },
      dateTime: mkDate(4, 6, 0), totalSeats: 4, availableSeats: 4, farePerSeat: 230, status: 'published',
    });

    // Ahmedabad → Vadodara (Arjun)
    await Ride.create({
      driverId: arjun._id, vehicleId: arjunVehicle._id, orgId: org._id,
      startLocation: { address: 'Ahmedabad (Bopal)', lat: 23.0269, lng: 72.4690 },
      destination: { address: 'Vadodara (Sayajibaug)', lat: 22.3119, lng: 73.1850 },
      dateTime: mkDate(5, 6, 30), totalSeats: 4, availableSeats: 3, farePerSeat: 220, status: 'published',
    });

    // Rajkot → Surat (Kavita)
    await Ride.create({
      driverId: kavita._id, vehicleId: kavitaVehicle._id, orgId: org._id,
      startLocation: { address: 'Rajkot (University Road)', lat: 22.2943, lng: 70.8041 },
      destination: { address: 'Surat (Udhna)', lat: 21.1866, lng: 72.8484 },
      dateTime: mkDate(5, 5, 30), totalSeats: 3, availableSeats: 3, farePerSeat: 420, status: 'published',
    });

    // Gandhinagar → Ahmedabad (Rohan)
    await Ride.create({
      driverId: rohan._id, vehicleId: rohanVehicle._id, orgId: org._id,
      startLocation: { address: 'Gandhinagar (Sector 21)', lat: 23.2244, lng: 72.6489 },
      destination: { address: 'Ahmedabad (Vastrapur)', lat: 23.0379, lng: 72.5273 },
      dateTime: mkDate(6, 19, 0), totalSeats: 3, availableSeats: 2, farePerSeat: 110, status: 'published',
    });

    // Surat → Navsari (Rahul)
    await Ride.create({
      driverId: rahul._id, vehicleId: rahulVehicle._id, orgId: org._id,
      startLocation: { address: 'Surat (Katargam)', lat: 21.2326, lng: 72.8367 },
      destination: { address: 'Navsari (Town Centre)', lat: 20.9467, lng: 72.9520 },
      dateTime: mkDate(6, 9, 0), totalSeats: 4, availableSeats: 4, farePerSeat: 100, status: 'published',
    });

    // Bhavnagar → Vadodara (Amit)
    await Ride.create({
      driverId: amit._id, vehicleId: amitVehicle._id, orgId: org._id,
      startLocation: { address: 'Bhavnagar (S T Stand)', lat: 21.7645, lng: 72.1519 },
      destination: { address: 'Vadodara (Railway Station)', lat: 22.3012, lng: 73.1804 },
      dateTime: mkDate(7, 7, 0), totalSeats: 4, availableSeats: 3, farePerSeat: 320, status: 'published',
    });

    // Jamnagar → Rajkot (Nirav)
    await Ride.create({
      driverId: nirav._id, vehicleId: niravVehicle._id, orgId: org._id,
      startLocation: { address: 'Jamnagar (Bedi Gate)', lat: 22.4707, lng: 70.0577 },
      destination: { address: 'Rajkot (Gondal Road)', lat: 22.2782, lng: 70.7909 },
      dateTime: mkDate(7, 8, 30), totalSeats: 4, availableSeats: 4, farePerSeat: 140, status: 'published',
    });

    // ===== SPECIAL TEST DATES: JULY 30, JULY 31, AUGUST 1 RIDES =====
    
    // Ahmedabad ➔ Gandhinagar on July 31 (Sujal)
    await Ride.create({
      driverId: sujal._id, vehicleId: sujalVehicle._id, orgId: org._id,
      startLocation: { address: 'Ahmedabad (Naroda)', lat: 23.0689, lng: 72.6531 },
      destination: { address: 'Gandhinagar (Sector 11)', lat: 23.2156, lng: 72.6369 },
      dateTime: new Date('2026-07-31T03:30:00.000Z'),
      totalSeats: 4, availableSeats: 4, farePerSeat: 120, status: 'published',
    });

    // Ahmedabad ➔ Gandhinagar on July 30 (Raj)
    await Ride.create({
      driverId: raj._id, vehicleId: rajVehicle._id, orgId: org._id,
      startLocation: { address: 'Ahmedabad (Naroda)', lat: 23.0689, lng: 72.6531 },
      destination: { address: 'Gandhinagar (Sector 11)', lat: 23.2156, lng: 72.6369 },
      dateTime: new Date('2026-07-30T09:00:00.000Z'),
      totalSeats: 4, availableSeats: 4, farePerSeat: 130, status: 'published',
    });

    // Ahmedabad ➔ Gandhinagar on August 1 (Rahul)
    await Ride.create({
      driverId: rahul._id, vehicleId: rahulVehicle._id, orgId: org._id,
      startLocation: { address: 'Ahmedabad (Naroda)', lat: 23.0689, lng: 72.6531 },
      destination: { address: 'Gandhinagar (Sector 11)', lat: 23.2156, lng: 72.6369 },
      dateTime: new Date('2026-08-01T08:30:00.000Z'),
      totalSeats: 4, availableSeats: 4, farePerSeat: 110, status: 'published',
    });

    // Surat ➔ Vadodara on July 30 (Nirav)
    await Ride.create({
      driverId: nirav._id, vehicleId: niravVehicle._id, orgId: org._id,
      startLocation: { address: 'Surat (Athwa Gate)', lat: 21.1939, lng: 72.8319 },
      destination: { address: 'Vadodara (Alkapuri)', lat: 22.3178, lng: 73.1780 },
      dateTime: new Date('2026-07-30T07:00:00.000Z'),
      totalSeats: 4, availableSeats: 4, farePerSeat: 240, status: 'published',
    });

    // Surat ➔ Vadodara on July 31 (Amit)
    await Ride.create({
      driverId: amit._id, vehicleId: amitVehicle._id, orgId: org._id,
      startLocation: { address: 'Surat (Athwa Gate)', lat: 21.1939, lng: 72.8319 },
      destination: { address: 'Vadodara (Alkapuri)', lat: 22.3178, lng: 73.1780 },
      dateTime: new Date('2026-07-31T08:00:00.000Z'),
      totalSeats: 4, availableSeats: 4, farePerSeat: 260, status: 'published',
    });

    // Rajkot ➔ Ahmedabad on July 30 (Arjun)
    await Ride.create({
      driverId: arjun._id, vehicleId: arjunVehicle._id, orgId: org._id,
      startLocation: { address: 'Rajkot (Kalawad Road)', lat: 22.3070, lng: 70.7769 },
      destination: { address: 'Ahmedabad (Sarkhej)', lat: 23.0060, lng: 72.5100 },
      dateTime: new Date('2026-07-30T06:30:00.000Z'),
      totalSeats: 4, availableSeats: 4, farePerSeat: 340, status: 'published',
    });

    // Rajkot ➔ Ahmedabad on July 31 (Arjun)
    await Ride.create({
      driverId: arjun._id, vehicleId: arjunVehicle._id, orgId: org._id,
      startLocation: { address: 'Rajkot (Kalawad Road)', lat: 22.3070, lng: 70.7769 },
      destination: { address: 'Ahmedabad (Sarkhej)', lat: 23.0060, lng: 72.5100 },
      dateTime: new Date('2026-07-31T07:30:00.000Z'),
      totalSeats: 4, availableSeats: 4, farePerSeat: 360, status: 'published',
    });

    // Bhavnagar ➔ Ahmedabad on July 30 (Kavita)
    await Ride.create({
      driverId: kavita._id, vehicleId: kavitaVehicle._id, orgId: org._id,
      startLocation: { address: 'Bhavnagar (Crescent Circle)', lat: 21.7671, lng: 72.1516 },
      destination: { address: 'Ahmedabad (Paldi)', lat: 23.0156, lng: 72.5698 },
      dateTime: new Date('2026-07-30T07:00:00.000Z'),
      totalSeats: 3, availableSeats: 3, farePerSeat: 290, status: 'published',
    });

    // Bhavnagar ➔ Ahmedabad on July 31 (Kavita)
    await Ride.create({
      driverId: kavita._id, vehicleId: kavitaVehicle._id, orgId: org._id,
      startLocation: { address: 'Bhavnagar (Crescent Circle)', lat: 21.7671, lng: 72.1516 },
      destination: { address: 'Ahmedabad (Paldi)', lat: 23.0156, lng: 72.5698 },
      dateTime: new Date('2026-07-31T09:00:00.000Z'),
      totalSeats: 3, availableSeats: 3, farePerSeat: 310, status: 'published',
    });

    // Anand ➔ Ahmedabad on July 30 (Rohan)
    await Ride.create({
      driverId: rohan._id, vehicleId: rohanVehicle._id, orgId: org._id,
      startLocation: { address: 'Anand (Vallabh Vidyanagar)', lat: 22.5409, lng: 72.9222 },
      destination: { address: 'Ahmedabad (Navrangpura)', lat: 23.0341, lng: 72.5630 },
      dateTime: new Date('2026-07-30T08:00:00.000Z'),
      totalSeats: 3, availableSeats: 3, farePerSeat: 130, status: 'published',
    });

    // Anand ➔ Ahmedabad on July 31 (Rohan)
    await Ride.create({
      driverId: rohan._id, vehicleId: rohanVehicle._id, orgId: org._id,
      startLocation: { address: 'Anand (Vallabh Vidyanagar)', lat: 22.5409, lng: 72.9222 },
      destination: { address: 'Ahmedabad (Navrangpura)', lat: 23.0341, lng: 72.5630 },
      dateTime: new Date('2026-07-31T17:30:00.000Z'),
      totalSeats: 3, availableSeats: 3, farePerSeat: 150, status: 'published',
    });

    // Mehsana ➔ Gandhinagar on July 30 (Rahul)
    await Ride.create({
      driverId: rahul._id, vehicleId: rahulVehicle._id, orgId: org._id,
      startLocation: { address: 'Mehsana (Bus Stand)', lat: 23.5880, lng: 72.3693 },
      destination: { address: 'Gandhinagar (Sector 7)', lat: 23.2156, lng: 72.6369 },
      dateTime: new Date('2026-07-30T07:30:00.000Z'),
      totalSeats: 4, availableSeats: 4, farePerSeat: 150, status: 'published',
    });

    // Mehsana ➔ Gandhinagar on July 31 (Rahul)
    await Ride.create({
      driverId: rahul._id, vehicleId: rahulVehicle._id, orgId: org._id,
      startLocation: { address: 'Mehsana (Bus Stand)', lat: 23.5880, lng: 72.3693 },
      destination: { address: 'Gandhinagar (Sector 7)', lat: 23.2156, lng: 72.6369 },
      dateTime: new Date('2026-07-31T08:30:00.000Z'),
      totalSeats: 4, availableSeats: 4, farePerSeat: 170, status: 'published',
    });

    // Rajkot → Jamnagar (Arjun)
    await Ride.create({
      driverId: arjun._id, vehicleId: arjunVehicle._id, orgId: org._id,
      startLocation: { address: 'Rajkot (Race Course Road)', lat: 22.3039, lng: 70.8022 },
      destination: { address: 'Jamnagar (Indira Marg)', lat: 22.4579, lng: 70.0601 },
      dateTime: mkDate(8, 8, 0), totalSeats: 4, availableSeats: 4, farePerSeat: 150, status: 'published',
    });

    // Mehsana → Ahmedabad (Kavita)
    await Ride.create({
      driverId: kavita._id, vehicleId: kavitaVehicle._id, orgId: org._id,
      startLocation: { address: 'Mehsana (City Centre)', lat: 23.5973, lng: 72.3785 },
      destination: { address: 'Ahmedabad (Chandkheda)', lat: 23.1118, lng: 72.5855 },
      dateTime: mkDate(8, 7, 30), totalSeats: 3, availableSeats: 3, farePerSeat: 160, status: 'published',
    });

    // Vapi → Navsari (Rohan)
    await Ride.create({
      driverId: rohan._id, vehicleId: rohanVehicle._id, orgId: org._id,
      startLocation: { address: 'Vapi (City Centre)', lat: 20.3780, lng: 72.9080 },
      destination: { address: 'Navsari (Jalalpore)', lat: 20.9600, lng: 72.9600 },
      dateTime: mkDate(9, 9, 0), totalSeats: 4, availableSeats: 4, farePerSeat: 120, status: 'published',
    });

    console.log('📌 Creating bookings (active trips)...');

    // Priya books Raj's Ahmedabad→Gandhinagar ride
    const trip1 = await Trip.create({
      rideId: ride1._id, passengerId: priya._id, driverId: raj._id, orgId: org._id,
      seatsBooked: 1, fare: 110, status: 'booked',
    });
    ride1.passengers.push({ userId: priya._id, tripId: trip1._id, seatsBooked: 1 });
    await ride1.save();

    // Divya books Nirav's Surat→Vadodara ride
    const trip2 = await Trip.create({
      rideId: ride2._id, passengerId: divya._id, driverId: nirav._id, orgId: org._id,
      seatsBooked: 1, fare: 250, status: 'booked',
    });
    ride2.passengers.push({ userId: divya._id, tripId: trip2._id, seatsBooked: 1 });
    await ride2.save();

    // Meera books Arjun's Rajkot→Ahmedabad ride
    const trip3 = await Trip.create({
      rideId: ride3._id, passengerId: meera._id, driverId: arjun._id, orgId: org._id,
      seatsBooked: 1, fare: 350, status: 'booked',
    });
    ride3.passengers.push({ userId: meera._id, tripId: trip3._id, seatsBooked: 1 });
    await ride3.save();

    console.log('📌 Seeding past (completed) rides...');

    const pastDate1 = mkDate(-5, 9, 0);
    const pastRide1 = await Ride.create({
      driverId: raj._id, vehicleId: rajVehicle._id, orgId: org._id,
      startLocation: { address: 'Ahmedabad (Naroda)', lat: 23.0689, lng: 72.6531 },
      destination: { address: 'Gandhinagar (Sector 11)', lat: 23.2156, lng: 72.6369 },
      dateTime: pastDate1, totalSeats: 3, availableSeats: 2, farePerSeat: 110,
      status: 'completed', distanceKm: 24, durationMin: 35,
      passengers: [{ userId: priya._id, seatsBooked: 1 }],
    });

    const pastTrip1 = await Trip.create({
      rideId: pastRide1._id, passengerId: priya._id, driverId: raj._id, orgId: org._id,
      seatsBooked: 1, fare: 110, status: 'completed_paid',
      distanceKm: 24, fuelSavedLitres: 1.2, bookedAt: pastDate1,
      startedAt: pastDate1, completedAt: pastDate1, paidAt: pastDate1,
    });

    const pastDate2 = mkDate(-3, 7, 0);
    const pastRide2 = await Ride.create({
      driverId: nirav._id, vehicleId: niravVehicle._id, orgId: org._id,
      startLocation: { address: 'Surat (Athwa Gate)', lat: 21.1939, lng: 72.8319 },
      destination: { address: 'Vadodara (Alkapuri)', lat: 22.3178, lng: 73.1780 },
      dateTime: pastDate2, totalSeats: 4, availableSeats: 3, farePerSeat: 250,
      status: 'completed', distanceKm: 130, durationMin: 120,
      passengers: [{ userId: divya._id, seatsBooked: 1 }],
    });

    const pastTrip2 = await Trip.create({
      rideId: pastRide2._id, passengerId: divya._id, driverId: nirav._id, orgId: org._id,
      seatsBooked: 1, fare: 250, status: 'completed_paid',
      distanceKm: 130, fuelSavedLitres: 4.5, bookedAt: pastDate2,
      startedAt: pastDate2, completedAt: pastDate2, paidAt: pastDate2,
    });

    const pastDate3 = mkDate(-2, 8, 0);
    const pastRide3 = await Ride.create({
      driverId: arjun._id, vehicleId: arjunVehicle._id, orgId: org._id,
      startLocation: { address: 'Rajkot (Kalawad Road)', lat: 22.3070, lng: 70.7769 },
      destination: { address: 'Ahmedabad (Sarkhej)', lat: 23.0060, lng: 72.5100 },
      dateTime: pastDate3, totalSeats: 4, availableSeats: 2, farePerSeat: 350,
      status: 'completed', distanceKm: 215, durationMin: 180,
      passengers: [{ userId: meera._id, seatsBooked: 1 }, { userId: priya._id, seatsBooked: 1 }],
    });

    const pastTrip3 = await Trip.create({
      rideId: pastRide3._id, passengerId: meera._id, driverId: arjun._id, orgId: org._id,
      seatsBooked: 1, fare: 350, status: 'completed_paid',
      distanceKm: 215, fuelSavedLitres: 7.2, bookedAt: pastDate3,
      startedAt: pastDate3, completedAt: pastDate3, paidAt: pastDate3,
    });

    const pastTrip4 = await Trip.create({
      rideId: pastRide3._id, passengerId: priya._id, driverId: arjun._id, orgId: org._id,
      seatsBooked: 1, fare: 350, status: 'completed_paid',
      distanceKm: 215, fuelSavedLitres: 7.2, bookedAt: pastDate3,
      startedAt: pastDate3, completedAt: pastDate3, paidAt: pastDate3,
    });

    console.log('📌 Seeding wallet transactions...');
    await WalletTransaction.create([
      // Trip 1 (Priya pays Raj)
      { userId: priya._id, type: 'debit', amount: 110, balanceBefore: 1910, balanceAfter: 1800, description: `Fare for Trip #${pastTrip1._id.toString().slice(-6)}`, referenceId: pastTrip1._id, referenceModel: 'Trip' },
      { userId: raj._id, type: 'credit', amount: 110, balanceBefore: 2390, balanceAfter: 2500, description: `Fare received for Trip #${pastTrip1._id.toString().slice(-6)}`, referenceId: pastTrip1._id, referenceModel: 'Trip' },
      // Trip 2 (Divya pays Nirav)
      { userId: divya._id, type: 'debit', amount: 250, balanceBefore: 650, balanceAfter: 400, description: `Fare for Trip #${pastTrip2._id.toString().slice(-6)}`, referenceId: pastTrip2._id, referenceModel: 'Trip' },
      { userId: nirav._id, type: 'credit', amount: 250, balanceBefore: 1550, balanceAfter: 1800, description: `Fare received for Trip #${pastTrip2._id.toString().slice(-6)}`, referenceId: pastTrip2._id, referenceModel: 'Trip' },
      // Trip 3 & 4 (Meera & Priya pay Arjun)
      { userId: meera._id, type: 'debit', amount: 350, balanceBefore: 1850, balanceAfter: 1500, description: `Fare for Trip #${pastTrip3._id.toString().slice(-6)}`, referenceId: pastTrip3._id, referenceModel: 'Trip' },
      { userId: priya._id, type: 'debit', amount: 350, balanceBefore: 2150, balanceAfter: 1800, description: `Fare for Trip #${pastTrip4._id.toString().slice(-6)}`, referenceId: pastTrip4._id, referenceModel: 'Trip' },
      { userId: arjun._id, type: 'credit', amount: 700, balanceBefore: 500, balanceAfter: 1200, description: `Fares received for Trips #${pastTrip3._id.toString().slice(-6)} & #${pastTrip4._id.toString().slice(-6)}`, referenceId: pastTrip3._id, referenceModel: 'Trip' },
    ]);

    // Update stats
    priya.totalRides = 3; await priya.save();
    raj.totalRides = 1; raj.totalRidesOffered = 2; await raj.save();
    nirav.totalRidesOffered = 2; await nirav.save();
    arjun.totalRidesOffered = 2; await arjun.save();
    divya.totalRides = 1; await divya.save();
    meera.totalRides = 1; await meera.save();

    console.log('🏁 Seeding finished successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
