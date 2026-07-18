/**
 * Fare Calculator
 *
 * Calculates ride fare based on distance, org-configured cost per km,
 * and number of available seats.
 */

/**
 * Calculate fare per seat for a ride
 * @param {number} distanceKm - Trip distance in km
 * @param {number} costPerKm - Organization configured cost per km (from OrgConfig)
 * @param {number} totalSeats - Total available seats offered
 * @returns {{ totalFare: number, farePerSeat: number }}
 */
export const calculateFare = (distanceKm, costPerKm = 8.0, totalSeats = 1) => {
  if (distanceKm <= 0 || costPerKm <= 0 || totalSeats <= 0) {
    return { totalFare: 0, farePerSeat: 0 };
  }

  const totalFare = parseFloat((distanceKm * costPerKm).toFixed(2));
  const farePerSeat = parseFloat((totalFare / totalSeats).toFixed(2));

  return { totalFare, farePerSeat };
};

/**
 * Calculate estimated fuel cost for a trip
 * @param {number} distanceKm - Trip distance in km
 * @param {number} fuelCostPerLitre - Fuel price per litre
 * @param {number} fuelEfficiency - Vehicle fuel efficiency in km/L
 * @returns {number} Estimated fuel cost
 */
export const calculateFuelCost = (distanceKm, fuelCostPerLitre = 96.5, fuelEfficiency = 15) => {
  if (distanceKm <= 0 || fuelCostPerLitre <= 0 || fuelEfficiency <= 0) {
    return 0;
  }

  const litresNeeded = distanceKm / fuelEfficiency;
  return parseFloat((litresNeeded * fuelCostPerLitre).toFixed(2));
};

export default { calculateFare, calculateFuelCost };
