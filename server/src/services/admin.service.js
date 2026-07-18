import User from '../models/User.model.js';
import Vehicle from '../models/Vehicle.model.js';
import Ride from '../models/Ride.model.js';
import Organization from '../models/Organization.model.js';
import ApiError from '../utils/ApiError.js';
import { sendEmail } from '../config/brevo.js';

export const getAdminStats = async (orgId) => {
  const totalEmployees = await User.countDocuments({ orgId, role: 'employee' });
  const registeredVehicles = await Vehicle.countDocuments({ orgId });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const ridesThisMonth = await Ride.countDocuments({
    orgId,
    dateTime: { $gte: startOfMonth },
    status: { $ne: 'cancelled' },
  });

  return { totalEmployees, registeredVehicles, ridesThisMonth };
};

export const listEmployees = async (orgId) => {
  return User.find({ orgId }).select('-password -refreshToken').sort({ name: 1 });
};

export const addEmployee = async (adminId, orgId, employeeData) => {
  const { name, email, department, manager, officeLocation } = employeeData;

  // Check if domain matches org whitelist
  const domain = email.split('@')[1];
  const org = await Organization.findById(orgId);
  if (!org) throw ApiError.notFound('Organization not found');

  if (org.allowedEmailDomain !== domain) {
    throw ApiError.forbidden(`Email domain @${domain} does not match allowed domain @${org.allowedEmailDomain}`);
  }

  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict('User with this email already exists in system');

  // Generate a random temporary password
  const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

  const user = await User.create({
    name,
    email,
    password: tempPassword,
    orgId,
    role: 'employee',
    department,
    manager,
    officeLocation,
  });

  await Organization.findByIdAndUpdate(orgId, { $inc: { totalRegisteredEmployees: 1 } });

  // Send credentials via Brevo
  sendEmail({
    to: email,
    subject: `Welcome to ${org.name} Carpooling Platform - Credentials`,
    htmlContent: `
      <h2>Hi ${name}!</h2>
      <p>An account has been created for you by your admin.</p>
      <p><b>Temporary Password:</b> ${tempPassword}</p>
      <p>Please change your password after logging in.</p>
    `,
  }).catch(console.error);

  return user;
};

export const toggleEmployeeAccess = async (orgId, targetUserId, { platformAccess }) => {
  const user = await User.findOne({ _id: targetUserId, orgId });
  if (!user) throw ApiError.notFound('Employee not found');

  user.platformAccess = platformAccess;
  await user.save();

  return user;
};

export const listVehicles = async (orgId) => {
  return Vehicle.find({ orgId }).populate('ownerId', 'name email').sort({ createdAt: -1 });
};

export const getOrgSettings = async (orgId) => {
  const org = await Organization.findById(orgId);
  if (!org) throw ApiError.notFound('Organization not found');
  return org;
};

export const updateOrgSettings = async (orgId, updateData) => {
  const org = await Organization.findByIdAndUpdate(orgId, updateData, { new: true });
  if (!org) throw ApiError.notFound('Organization not found');
  return org;
};

export default {
  getAdminStats,
  listEmployees,
  addEmployee,
  toggleEmployeeAccess,
  listVehicles,
  getOrgSettings,
  updateOrgSettings,
};
