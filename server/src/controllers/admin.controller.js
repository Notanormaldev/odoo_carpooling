import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as adminService from '../services/admin.service.js';

export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getAdminStats(req.user.orgId);
  return res.status(200).json(new ApiResponse(200, stats, 'Admin dashboard stats fetched'));
});

export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await adminService.listEmployees(req.user.orgId);
  return res.status(200).json(new ApiResponse(200, employees, 'Employees list fetched'));
});

export const addEmployee = asyncHandler(async (req, res) => {
  const employee = await adminService.addEmployee(req.user._id, req.user.orgId, req.body);
  return res.status(201).json(new ApiResponse(201, employee, 'Employee added successfully'));
});

export const toggleAccess = asyncHandler(async (req, res) => {
  const employee = await adminService.toggleEmployeeAccess(req.user.orgId, req.params.id, req.body);
  return res.status(200).json(new ApiResponse(200, employee, `Employee platform access updated`));
});

export const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await adminService.listVehicles(req.user.orgId);
  return res.status(200).json(new ApiResponse(200, vehicles, 'Vehicles list fetched'));
});

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await adminService.getOrgSettings(req.user.orgId);
  return res.status(200).json(new ApiResponse(200, settings, 'Organization settings fetched'));
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await adminService.updateOrgSettings(req.user.orgId, req.body);
  return res.status(200).json(new ApiResponse(200, settings, 'Organization settings updated successfully'));
});

export default { getStats, getEmployees, addEmployee, toggleAccess, getVehicles, getSettings, updateSettings };
