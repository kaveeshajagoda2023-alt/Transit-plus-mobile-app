// Fare rules shared by the fare endpoint and ticket creation, so the price
// shown to the passenger is always the price that gets charged.
const AppError = require('./AppError');

const PASSENGER_TYPE_MULTIPLIER = {
  adult: 1,
  student: 0.5,
  senior: 0.75,
  child: 0.5,
};

const findStopIndex = (route, stopName) =>
  route.stops.findIndex((s) => s.toLowerCase() === String(stopName).trim().toLowerCase());

const calculateFare = (route, from, to, passengerType = 'adult', passengers = 1) => {
  const fromIndex = findStopIndex(route, from);
  const toIndex = findStopIndex(route, to);
  if (fromIndex === -1 || toIndex === -1) {
    throw new AppError('Selected stops are not on this route', 400);
  }
  if (fromIndex === toIndex) {
    throw new AppError('Boarding and destination stops must be different', 400);
  }

  const stopsTravelled = Math.abs(toIndex - fromIndex);
  // fareTable[n] = adult fare for travelling n stops; fall back to the last entry or baseFare
  const table = route.fareTable || [];
  const adultFare = table[stopsTravelled] ?? table[table.length - 1] ?? route.baseFare;
  const multiplier = PASSENGER_TYPE_MULTIPLIER[passengerType] ?? 1;
  const unitFare = Math.ceil(adultFare * multiplier);

  return {
    from: route.stops[fromIndex],
    to: route.stops[toIndex],
    stopsTravelled,
    passengerType,
    passengers,
    multiplier,
    adultFare,
    unitFare,
    totalFare: unitFare * passengers,
    currency: 'LKR',
  };
};

module.exports = { calculateFare, PASSENGER_TYPE_MULTIPLIER };
