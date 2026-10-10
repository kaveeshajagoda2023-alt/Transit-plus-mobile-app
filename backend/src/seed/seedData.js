// Demo data. Fares are in LKR and are illustrative, not official NTC fares.
// fareTable[n] = baseFare + (n - 1) * stageFare for travelling n stops.
const buildFareTable = (stopCount, baseFare, stageFare) =>
  Array.from({ length: stopCount }, (_, n) => (n === 0 ? 0 : baseFare + (n - 1) * stageFare));

const route = (code, name, stops, baseFare, stageFare) => ({
  code,
  name,
  stops,
  baseFare,
  fareTable: buildFareTable(stops.length, baseFare, stageFare),
});

const ROUTES = [
  route('138', 'Colombo Fort - Homagama', [
    'Colombo Fort', 'Pettah', 'Town Hall', 'Thunmulla', 'Kirulapone', 'Nugegoda', 'Maharagama', 'Kottawa', 'Homagama',
  ], 30, 12),
  route('100', 'Pettah - Panadura', [
    'Pettah', 'Kollupitiya', 'Bambalapitiya', 'Wellawatte', 'Dehiwala', 'Mount Lavinia', 'Ratmalana', 'Moratuwa', 'Panadura',
  ], 30, 12),
  route('177', 'Kollupitiya - Kaduwela', [
    'Kollupitiya', 'Town Hall', 'Borella', 'Rajagiriya', 'Battaramulla', 'Malabe', 'Kaduwela',
  ], 30, 14),
  route('187', 'Colombo Fort - Katunayake Airport', [
    'Colombo Fort', 'Peliyagoda', 'Wattala', 'Ja-Ela', 'Seeduwa', 'Katunayake Airport',
  ], 40, 25),
  route('154', 'Kiribathgoda - Angulana', [
    'Kiribathgoda', 'Kelaniya', 'Dematagoda', 'Borella', 'Thimbirigasyaya', 'Bambalapitiya', 'Wellawatte', 'Dehiwala', 'Angulana',
  ], 30, 12),
  route('01', 'Colombo - Kandy', [
    'Colombo Fort', 'Kadawatha', 'Nittambuwa', 'Warakapola', 'Kegalle', 'Mawanella', 'Kadugannawa', 'Peradeniya', 'Kandy',
  ], 60, 70),
  route('02', 'Colombo - Matara', [
    'Colombo Fort', 'Panadura', 'Kalutara', 'Beruwala', 'Aluthgama', 'Ambalangoda', 'Hikkaduwa', 'Galle', 'Weligama', 'Matara',
  ], 60, 75),
  route('EX01', 'Makumbura - Galle (Southern Expressway)', [
    'Makumbura', 'Kahathuduwa', 'Gelanigama', 'Dodangoda', 'Welipenna', 'Kurundugahahetekma', 'Baddegama', 'Galle',
  ], 150, 90),
];

// Demo accounts (passwords are for local demos only)
const USERS = [
  { name: 'Kavindi Perera', email: 'passenger@transitpulse.lk', password: 'Passenger@123', phone: '+94 77 123 4567', passengerType: 'adult' },
  { name: 'Nimal Silva', email: 'student@transitpulse.lk', password: 'Student@123', phone: '+94 71 555 0101', passengerType: 'student' },
  { name: 'Sunil Fernando', email: 'conductor@transitpulse.lk', password: 'Conductor@123', phone: '+94 76 222 3344', passengerType: 'adult', role: 'conductor' },
];

module.exports = { ROUTES, USERS, buildFareTable };
