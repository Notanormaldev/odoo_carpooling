/**
 * CO2 Savings Calculator
 *
 * Average car emits ~120g CO2 per km (India average for petrol cars).
 * If 3 people share a ride instead of driving separately,
 * the net CO2 saved = (riders - 1) × distance × emission_factor.
 */

const EMISSION_FACTOR_GRAMS_PER_KM = 120; // grams CO2 per km (avg Indian car)

/**
 * Calculate CO2 saved for a shared ride
 * @param {number} distanceKm - Total trip distance in km
 * @param {number} totalRiders - Number of people sharing (driver + passengers)
 * @returns {{ savedGrams: number, savedKg: number, treesEquivalent: number }}
 */
export const calculateCO2Saved = (distanceKm, totalRiders) => {
  if (totalRiders <= 1 || distanceKm <= 0) {
    return { savedGrams: 0, savedKg: 0, treesEquivalent: 0 };
  }

  // CO2 that would have been emitted if each person drove alone
  const totalIfAlone = totalRiders * distanceKm * EMISSION_FACTOR_GRAMS_PER_KM;

  // CO2 from the single shared ride
  const sharedEmission = distanceKm * EMISSION_FACTOR_GRAMS_PER_KM;

  const savedGrams = totalIfAlone - sharedEmission;
  const savedKg = parseFloat((savedGrams / 1000).toFixed(2));

  // 1 tree absorbs ~22kg CO2 per year
  const treesEquivalent = parseFloat((savedKg / 22).toFixed(3));

  return { savedGrams, savedKg, treesEquivalent };
};

/**
 * Calculate fuel saved for a shared ride
 * @param {number} distanceKm - Total trip distance in km
 * @param {number} fuelEfficiency - Vehicle fuel efficiency in km/L
 * @param {number} totalRiders - Number of people sharing
 * @returns {{ savedLitres: number, savedCost: number }}
 */
export const calculateFuelSaved = (distanceKm, fuelEfficiency, totalRiders, fuelCostPerLitre = 96.5) => {
  if (totalRiders <= 1 || distanceKm <= 0 || fuelEfficiency <= 0) {
    return { savedLitres: 0, savedCost: 0 };
  }

  const fuelForOneTrip = distanceKm / fuelEfficiency;
  const fuelIfAlone = totalRiders * fuelForOneTrip;
  const savedLitres = parseFloat((fuelIfAlone - fuelForOneTrip).toFixed(2));
  const savedCost = parseFloat((savedLitres * fuelCostPerLitre).toFixed(2));

  return { savedLitres, savedCost };
};

export default { calculateCO2Saved, calculateFuelSaved };
