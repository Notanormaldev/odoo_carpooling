import mongoose from 'mongoose';
import Trip from '../models/Trip.model.js';
import Vehicle from '../models/Vehicle.model.js';
import Organization from '../models/Organization.model.js';

export const getOrgReport = async (orgId, startDate, endDate) => {
  const matchQuery = {
    orgId: new mongoose.Types.ObjectId(orgId),
    status: 'completed_paid',
  };

  if (startDate || endDate) {
    matchQuery.completedAt = {};
    if (startDate) matchQuery.completedAt.$gte = new Date(startDate);
    if (endDate) matchQuery.completedAt.$lte = new Date(endDate);
  }

  // 1. Key Metrics Card Aggregation
  const stats = await Trip.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$fare' },
        totalFuelSaved: { $sum: '$fuelSavedLitres' },
        totalDistance: { $sum: '$distanceKm' },
        totalTrips: { $sum: 1 },
      },
    },
  ]);

  const org = await Organization.findById(orgId);
  const fuelPrice = org?.fuelCostPerLitre || 96.5;

  const totalRevenue = stats[0]?.totalRevenue || 0;
  const totalFuelSaved = stats[0]?.totalFuelSaved || 0;
  const totalDistance = stats[0]?.totalDistance || 0;
  const totalTrips = stats[0]?.totalTrips || 0;

  const totalFuelCostSavedAmount = parseFloat((totalFuelSaved * fuelPrice).toFixed(2));

  // Fleet Utilization Rate (Rides with passengers vs total published rides)
  const totalVehiclesCount = await Vehicle.countDocuments({ orgId, status: 'active' });

  // 2. Fuel Efficiency Trend Line Chart (km/L over months)
  const fuelTrend = await Trip.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' },
        },
        avgDistance: { $avg: '$distanceKm' },
        totalFuelSaved: { $sum: '$fuelSavedLitres' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] },
          ],
        },
        avgDistance: { $round: ['$avgDistance', 2] },
        fuelSaved: { $round: ['$totalFuelSaved', 2] },
      },
    },
  ]);

  // 3. Top 5 Costliest Vehicles (by distance/fuel consumption)
  const topCostlyVehicles = await Trip.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: 'rides',
        localField: 'rideId',
        foreignField: '_id',
        as: 'ride',
      },
    },
    { $unwind: '$ride' },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'ride.vehicleId',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: '$vehicle' },
    {
      $group: {
        _id: '$vehicle._id',
        model: { $first: '$vehicle.model' },
        registrationNumber: { $first: '$vehicle.registrationNumber' },
        distance: { $sum: '$distanceKm' },
        fuelEfficiency: { $first: '$vehicle.fuelEfficiency' },
      },
    },
    {
      $project: {
        model: 1,
        registrationNumber: 1,
        distance: 1,
        estimatedCost: {
          $round: [
            { $multiply: [{ $divide: ['$distance', { $ifNull: ['$fuelEfficiency', 15] }] }, fuelPrice] },
            2,
          ],
        },
      },
    },
    { $sort: { estimatedCost: -1 } },
    { $limit: 5 },
  ]);

  // 4. Financial Summary of Month (Revenue, Fuel Cost, Net Profit)
  const financialSummary = await Trip.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' },
        },
        revenue: { $sum: '$fare' },
        fuelSaved: { $sum: '$fuelSavedLitres' },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] },
          ],
        },
        revenue: { $round: ['$revenue', 2] },
        fuelCostSaved: { $round: [{ $multiply: ['$fuelSaved', fuelPrice] }, 2] },
        netProfit: { $round: [{ $subtract: ['$revenue', { $multiply: ['$fuelSaved', fuelPrice * 0.4] }] }, 2] }, // net business profit estimation
      },
    },
  ]);

  return {
    metrics: {
      totalRevenue,
      totalFuelSaved,
      totalDistance,
      totalTrips,
      totalFuelCostSavedAmount,
      totalVehiclesCount,
    },
    fuelTrend,
    topCostlyVehicles,
    financialSummary,
  };
};

export default { getOrgReport };
