import {
  TripData,
  TicketActivityItem,
  DelayReportPayload,
  DispatchAlertPayload,
  PassengerManifestItem,
  ScanValidationResponse,
} from '@/types/trip';

export interface InternalTicketRecord {
  ticketId: string;
  type: string;
  routeId: string;
  tripId: string;
  fareAmount: number;
  status: 'VALID' | 'USED' | 'EXPIRED' | 'INVALID_ROUTE';
  passengerName: string;
  expiresAt: number;
  usedAt?: number;
  bookingReference?: string;
  originStop?: string;
  destinationStop?: string;
  originZone?: string;
  destinationZone?: string;
  paymentStatus?: 'PAID' | 'UNPAID' | 'REFUNDED';
  paymentMethod?: string;
  transactionId?: string;
  passengerCount?: number;
}

const SEED_TICKETS: InternalTicketRecord[] = [
  {
    ticketId: 'TK-9021',
    type: 'Standard Single',
    routeId: '42',
    tripId: 'TRIP-4028-0941',
    fareAmount: 65,
    status: 'VALID',
    passengerName: 'Dilshan Silva',
    expiresAt: Date.now() + 3600000,
    bookingReference: 'MTA-BK-90214',
    originStop: 'Market St & 4th',
    destinationStop: 'University Malabe Campus',
    originZone: 'Zone 1',
    destinationZone: 'Zone 2',
    paymentStatus: 'PAID',
    paymentMethod: 'Digital Wallet Pay',
    transactionId: 'TXN-884028-091',
    passengerCount: 1,
  },
  {
    ticketId: 'TK-9018',
    type: 'Concession Pass',
    routeId: '42',
    tripId: 'TRIP-4028-0941',
    fareAmount: 35,
    status: 'VALID',
    passengerName: 'Kamal Perera',
    expiresAt: Date.now() + 7200000,
    bookingReference: 'MTA-BK-90180',
    originStop: '3rd & Pine',
    destinationStop: 'Malabe Center',
    originZone: 'Zone 1',
    destinationZone: 'Zone 2',
    paymentStatus: 'PAID',
    paymentMethod: 'Concession Transit Card',
    transactionId: 'TXN-884028-084',
    passengerCount: 1,
  },
  {
    ticketId: 'TK-9044',
    type: 'Standard Single',
    routeId: '42',
    tripId: 'TRIP-4028-0941',
    fareAmount: 65,
    status: 'VALID',
    passengerName: 'Anura Fernando',
    expiresAt: Date.now() + 3600000,
    bookingReference: 'MTA-BK-90442',
    originStop: 'Market St & 4th',
    destinationStop: 'Univ. City Terminal',
    originZone: 'Zone 1',
    destinationZone: 'Zone 3',
    paymentStatus: 'PAID',
    paymentMethod: 'Visa NFC Pass',
    transactionId: 'TXN-884028-072',
    passengerCount: 1,
  },
  {
    ticketId: 'TK-9055',
    type: 'Day Pass',
    routeId: '42',
    tripId: 'TRIP-4028-0941',
    fareAmount: 150,
    status: 'VALID',
    passengerName: 'Nimal Jayawardena',
    expiresAt: Date.now() + 18000000,
    bookingReference: 'MTA-BK-90559',
    originStop: 'Downtown Terminal',
    destinationStop: 'Metro Outer Ring',
    originZone: 'Zone 1',
    destinationZone: 'All Zones',
    paymentStatus: 'PAID',
    paymentMethod: 'TransitPulse App',
    transactionId: 'TXN-884028-055',
    passengerCount: 1,
  },
  {
    ticketId: 'TK-8832',
    type: 'Expired QR',
    routeId: '42',
    tripId: 'TRIP-4028-0941',
    fareAmount: 65,
    status: 'EXPIRED',
    passengerName: 'Suresh Kumar',
    expiresAt: Date.now() - 1200000, // Expired 20m ago
    bookingReference: 'MTA-BK-88321',
    originStop: 'South Transit Line',
    destinationStop: 'Market St & 4th',
    originZone: 'Zone 2',
    destinationZone: 'Zone 1',
    paymentStatus: 'UNPAID',
    paymentMethod: 'Unverified Token',
    transactionId: 'TXN-EXPIRED-883',
    passengerCount: 1,
  },
  {
    ticketId: 'TK-7740',
    type: 'Duplicate Token',
    routeId: '42',
    tripId: 'TRIP-4028-0941',
    fareAmount: 65,
    status: 'USED',
    passengerName: 'Mahesh Bandara',
    expiresAt: Date.now() + 3600000,
    usedAt: Date.now() - 600000,
    bookingReference: 'MTA-BK-77409',
    originStop: '3rd & Pine',
    destinationStop: 'University Junction',
    originZone: 'Zone 1',
    destinationZone: 'Zone 2',
    paymentStatus: 'PAID',
    paymentMethod: 'Digital Apple Wallet',
    transactionId: 'TXN-774011-DUP',
    passengerCount: 1,
  },
  {
    ticketId: 'TK-9824',
    type: 'Adult Single',
    routeId: '42',
    tripId: 'TRIP-4028-0941',
    fareAmount: 65,
    status: 'VALID',
    passengerName: 'Dilshan Silva',
    expiresAt: Date.now() + 3600000,
    bookingReference: 'MTA-BK-98240',
    originStop: 'Market St',
    destinationStop: 'Terminal 6',
    originZone: 'Zone 1',
    destinationZone: 'Zone 2',
    paymentStatus: 'PAID',
    paymentMethod: 'Verified Digital NFC',
    transactionId: 'TXN-982400-NFC',
    passengerCount: 1,
  },
  {
    ticketId: 'CSH-4011',
    type: 'Cash Fare',
    routeId: '42',
    tripId: 'TRIP-4028-0941',
    fareAmount: 2.5,
    status: 'VALID',
    passengerName: 'Walk-in Passenger',
    expiresAt: Date.now() + 3600000,
    bookingReference: 'MTA-CSH-4011',
    originStop: '5th & Mission',
    destinationStop: 'Terminal 6',
    originZone: 'Zone 1',
    destinationZone: 'Zone 2',
    paymentStatus: 'PAID',
    paymentMethod: 'Cash Farebox #1',
    transactionId: 'TXN-CSH-4011',
    passengerCount: 1,
  },
  {
    ticketId: 'TK-4411',
    type: 'Wrong Route (Line 138)',
    routeId: '138',
    tripId: 'TRIP-1382-0800',
    fareAmount: 70,
    status: 'INVALID_ROUTE',
    passengerName: 'Ruwan Wijesinghe',
    expiresAt: Date.now() + 3600000,
    bookingReference: 'MTA-BK-44110',
    originStop: 'Pettah Main Station',
    destinationStop: 'Homagama Town',
    originZone: 'Zone 1',
    destinationZone: 'Zone 4',
    paymentStatus: 'PAID',
    paymentMethod: 'Online QR Fare',
    transactionId: 'TXN-441109-138',
    passengerCount: 1,
  },
];

class TripDatabase {
  private tickets: Map<string, InternalTicketRecord> = new Map();
  private activeTrip: TripData;
  private passengerManifest: PassengerManifestItem[] = [];
  private tripIssues: Array<{ id: string; type: string; description: string; timestamp: number; status: string }> = [];
  private listeners: Set<(trip: TripData) => void> = new Set();

  constructor() {
    // Seed tickets
    for (const t of SEED_TICKETS) {
      this.tickets.set(t.ticketId.toUpperCase(), { ...t });
    }

    const now = Date.now();
    this.activeTrip = {
      id: 'TRIP-4028-0941',
      busNumber: '#4028',
      driverName: 'Mr. Kavith / Driver #42',
      conductorName: 'Elena Rostova',
      routeNumber: 'LINE 42',
      routeName: 'Route 42',
      origin: 'Market Square',
      destination: 'Terminal 6',
      zone: 'Zone A',
      tripStatus: 'ACTIVE',
      scheduleStatus: 'ON_TIME',
      currentStop: 'Market St & 4th',
      doorStatus: 'OPEN',
      nextStop: 'Terminal 6',
      etaMinutes: 6,
      occupiedSeats: 42,
      totalSeats: 55,
      digitalQrCount: 36,
      cashFareCount: 4,
      pendingFailCount: 2,
      shiftDigitalFareTotal: 2215.0,
      startedAt: new Date(now - 104 * 60000).toISOString(), // 1h 44m ago
      stops: [
        { id: 'st-1', name: 'Civic Center', distanceMeters: 0, etaMinutes: 0, scheduledTime: '08:30', isCompleted: true },
        { id: 'st-2', name: '5th & Mission', distanceMeters: 800, etaMinutes: 0, scheduledTime: '08:50', isCompleted: true },
        { id: 'st-3', name: 'Market St & 4th', distanceMeters: 1400, etaMinutes: 0, scheduledTime: '09:15', isCompleted: false },
        { id: 'st-4', name: 'Malabe Center', distanceMeters: 2200, etaMinutes: 3, scheduledTime: '09:45', isCompleted: false },
        { id: 'st-5', name: 'Terminal 6', distanceMeters: 3800, etaMinutes: 6, scheduledTime: '10:20', isCompleted: false },
      ],
      recentActivity: [
        {
          id: 'act-1',
          ticketId: 'TK-9824',
          ticketTypeLabel: 'Adult Single',
          eventText: 'Boarded just now',
          result: 'PASS',
          timestamp: now - 60000,
          fareAmount: 65,
          method: 'NFC',
          passengerName: 'Dilshan Silva',
        },
        {
          id: 'act-2',
          ticketId: 'CSH-4011',
          ticketTypeLabel: '$2.50 Paid',
          eventText: 'Boarded 6m ago',
          result: 'PASS',
          timestamp: now - 360000,
          fareAmount: 2.5,
          method: 'CASH',
          passengerName: 'Walk-in Passenger',
        },
        {
          id: 'act-3',
          ticketId: 'TK-8832',
          ticketTypeLabel: 'Expired QR',
          eventText: 'Rejected 16m ago',
          result: 'REJECT',
          timestamp: now - 960000,
          fareAmount: 0,
          method: 'QR',
          reason: 'Pass expired 20m ago',
        },
      ],
    };

    // Seed passengers matching screenshot
    this.passengerManifest = [
      {
        id: 'p-1',
        ticketId: 'TK-9824',
        passengerName: 'Dilshan Silva',
        type: 'Adult Single',
        fareLabel: 'Adult Single',
        badgeLabel: 'Verified Digital',
        badgeSubLabel: 'NFC Tap',
        category: 'DIGITAL',
        validationStatus: 'VALID',
        boardedAtStop: 'Market St',
        boardedAtTime: '10:14 AM',
        fare: 65,
        status: 'ONBOARD',
        method: 'NFC',
        destination: 'Terminal 6',
      },
      {
        id: 'p-2',
        ticketId: 'CSH-4011',
        passengerName: 'Walk-in Passenger',
        type: 'Cash Fare',
        fareLabel: '$2.50 Paid',
        badgeLabel: 'Cash',
        badgeSubLabel: 'Farebox #1',
        category: 'CASH',
        validationStatus: 'VALID',
        boardedAtStop: '5th & Mission',
        boardedAtTime: '10:08 AM',
        fare: 2.5,
        status: 'ONBOARD',
        method: 'CASH',
        destination: 'Terminal 6',
      },
      {
        id: 'p-3',
        ticketId: 'TK-8832',
        passengerName: 'Suresh Kumar',
        type: 'Expired QR',
        fareLabel: 'Expired QR',
        badgeLabel: 'Rejected',
        badgeSubLabel: 'Override Off',
        category: 'FAILED',
        validationStatus: 'EXPIRED',
        boardedAtStop: 'Civic Center',
        boardedAtTime: '09:58 AM',
        fare: 0,
        status: 'REJECTED',
        method: 'QR',
        rejectionReason: 'Pass expired 20 minutes ago',
        destination: 'Market St & 4th',
      },
      {
        id: 'p-4',
        ticketId: 'TK-9021',
        passengerName: 'Anura Fernando',
        type: 'Standard Single',
        fareLabel: 'Adult Single',
        badgeLabel: 'Verified Digital',
        badgeSubLabel: 'QR Scan',
        category: 'DIGITAL',
        validationStatus: 'VALID',
        boardedAtStop: 'Market St & 4th',
        boardedAtTime: '09:40 AM',
        fare: 65,
        status: 'ONBOARD',
        method: 'QR',
        destination: 'Terminal 6',
      },
      {
        id: 'p-5',
        ticketId: 'TK-9018',
        passengerName: 'Kamal Perera',
        type: 'Concession Pass',
        fareLabel: 'Concession Pass',
        badgeLabel: 'Verified Digital',
        badgeSubLabel: 'NFC Tap',
        category: 'DIGITAL',
        validationStatus: 'VALID',
        boardedAtStop: 'Civic Center',
        boardedAtTime: '09:30 AM',
        fare: 35,
        status: 'ONBOARD',
        method: 'NFC',
        destination: 'Terminal 6',
      },
    ];
  }

  public getActiveTrip(driverName?: string): TripData {
    if (driverName && driverName.trim()) {
      this.activeTrip.driverName = driverName;
    }
    this.refreshActivityTimeStrings();
    return { ...this.activeTrip, recentActivity: [...this.activeTrip.recentActivity] };
  }

  public getPassengerManifest(): PassengerManifestItem[] {
    return [...this.passengerManifest];
  }

  public validateTicket(ticketIdInput: string, method: 'QR' | 'NFC' = 'QR'): ScanValidationResponse {
    let cleanId = ticketIdInput.trim().toUpperCase();
    let record = this.tickets.get(cleanId);
    if (!record && cleanId.includes('-')) {
      const parts = cleanId.split('-');
      if (parts.length >= 2) {
        const baseId = `${parts[0]}-${parts[1]}`;
        record = this.tickets.get(baseId);
      }
    }
    const now = Date.now();

    if (!record) {
      // Unrecognized ticket
      this.activeTrip.pendingFailCount += 1;
      const activityItem: TicketActivityItem = {
        id: `act-${now}`,
        ticketId: cleanId,
        ticketTypeLabel: 'Invalid Code',
        eventText: 'Rejected just now',
        result: 'REJECT',
        timestamp: now,
        fareAmount: 0,
        method,
        reason: 'Ticket not found in MTA database',
      };
      this.activeTrip.recentActivity.unshift(activityItem);
      this.passengerManifest.unshift({
        id: `p-${now}`,
        ticketId: cleanId,
        passengerName: 'Unverified Passenger',
        type: 'Invalid Token',
        fareLabel: 'Invalid QR',
        badgeLabel: 'Rejected',
        badgeSubLabel: 'Override Off',
        category: 'FAILED',
        validationStatus: 'REJECTED',
        boardedAtStop: this.activeTrip.currentStop,
        boardedAtTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fare: 0,
        status: 'REJECTED',
        method,
        rejectionReason: 'Ticket not found in MTA database',
        destination: this.activeTrip.destination,
      });
      this.notifyListeners();
      return {
        valid: false,
        result: 'REJECT',
        reason: 'Ticket ID not recognized. Fare invalid.',
        ticketId: cleanId,
        ticketTypeLabel: 'Invalid QR',
        fareAmount: 0,
        activityItem,
        updatedTrip: this.getActiveTrip(),
        bookingReference: 'MTA-BK-UNRESOLVED',
        passengerCount: 1,
        originStop: 'Unknown Stop',
        destinationStop: 'Unknown Stop',
        originZone: 'Zone 1',
        destinationZone: 'Zone 1',
        paymentStatus: 'UNPAID',
        paymentMethod: 'Unverified Token',
        transactionId: 'TXN-UNKNOWN-000',
        paidAt: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        faultCode: '0x01',
        failureDiagnostics: 'UNRECOGNIZED_TOKEN_SCHEMA: Token not located in MTA master registry.',
        operationalMandate: 'Action: Collect standard cash on-board fare (Rs 65.00) or request passenger to present receipt.',
        deviceScannerId: 'TERM-4028-V4',
        verificationService: 'Active Spread',
      };
    }

    if (record.status === 'EXPIRED' || now > record.expiresAt) {
      this.activeTrip.pendingFailCount += 1;
      const activityItem: TicketActivityItem = {
        id: `act-${now}`,
        ticketId: record.ticketId,
        ticketTypeLabel: 'Expired QR',
        eventText: 'Rejected just now',
        result: 'REJECT',
        timestamp: now,
        fareAmount: 0,
        method,
        reason: 'Pass expired',
      };
      this.activeTrip.recentActivity.unshift(activityItem);
      this.passengerManifest.unshift({
        id: `p-${now}`,
        ticketId: record.ticketId,
        passengerName: record.passengerName,
        type: 'Expired QR',
        fareLabel: 'Expired QR',
        badgeLabel: 'Rejected',
        badgeSubLabel: 'Override Off',
        category: 'FAILED',
        validationStatus: 'EXPIRED',
        boardedAtStop: this.activeTrip.currentStop,
        boardedAtTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fare: 0,
        status: 'REJECTED',
        method,
        rejectionReason: 'Pass expired',
        destination: record.destinationStop || this.activeTrip.destination,
      });
      this.notifyListeners();
      return {
        valid: false,
        result: 'REJECT',
        reason: 'Ticket expired. Passenger must purchase new fare.',
        ticketId: record.ticketId,
        ticketTypeLabel: 'Expired QR',
        fareAmount: 0,
        activityItem,
        updatedTrip: this.getActiveTrip(),
        bookingReference: record.bookingReference || 'MTA-BK-88321',
        passengerCount: record.passengerCount || 1,
        originStop: record.originStop || 'Market St & 4th',
        destinationStop: record.destinationStop || 'University Malabe Campus',
        originZone: record.originZone || 'Zone 1',
        destinationZone: record.destinationZone || 'Zone 2',
        paymentStatus: 'UNPAID',
        paymentMethod: record.paymentMethod || 'Expired Token',
        transactionId: record.transactionId || 'TXN-EXPIRED-883',
        paidAt: new Date(record.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        faultCode: '0x44',
        failureDiagnostics: 'EXPIRED_PASS_SCHEMA: Pass expired 20 minutes ago (valid until 09:20 AM)',
        operationalMandate: 'Action: Collect standard cash on-board fare (Rs 65.00) or request passenger to renew digital token.',
        deviceScannerId: 'TERM-4028-V4',
        verificationService: 'Active Spread',
      };
    }

    if (record.status === 'USED') {
      this.activeTrip.pendingFailCount += 1;
      const activityItem: TicketActivityItem = {
        id: `act-${now}`,
        ticketId: record.ticketId,
        ticketTypeLabel: 'Already Redeemed',
        eventText: 'Rejected just now',
        result: 'REJECT',
        timestamp: now,
        fareAmount: 0,
        method,
        reason: 'Duplicate scan',
      };
      this.activeTrip.recentActivity.unshift(activityItem);
      this.passengerManifest.unshift({
        id: `p-${now}`,
        ticketId: record.ticketId,
        passengerName: record.passengerName,
        type: 'Duplicate Token',
        fareLabel: 'Already Used',
        badgeLabel: 'Rejected',
        badgeSubLabel: 'Override Off',
        category: 'FAILED',
        validationStatus: 'REJECTED',
        boardedAtStop: this.activeTrip.currentStop,
        boardedAtTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fare: 0,
        status: 'REJECTED',
        method,
        rejectionReason: 'Ticket already redeemed earlier on this trip',
        destination: record.destinationStop || this.activeTrip.destination,
      });
      this.notifyListeners();
      return {
        valid: false,
        result: 'REJECT',
        reason: 'Ticket already redeemed earlier on this trip.',
        ticketId: record.ticketId,
        ticketTypeLabel: 'Duplicate Token',
        fareAmount: 0,
        activityItem,
        updatedTrip: this.getActiveTrip(),
        bookingReference: record.bookingReference || 'MTA-BK-77409',
        passengerCount: record.passengerCount || 1,
        originStop: record.originStop || 'Market St & 4th',
        destinationStop: record.destinationStop || 'University Malabe Campus',
        originZone: record.originZone || 'Zone 1',
        destinationZone: record.destinationZone || 'Zone 2',
        paymentStatus: 'PAID',
        paymentMethod: record.paymentMethod || 'Apple Wallet Token',
        transactionId: record.transactionId || 'TXN-774011-DUP',
        paidAt: 'Today, 09:35 AM',
        faultCode: '0x19',
        failureDiagnostics: 'DUPLICATE_TOKEN_USE: Pass already scanned today at 09:35 AM on vehicle Bus #4028.',
        operationalMandate: 'Action: Collect standard cash on-board fare (Rs 65.00) or request passenger to renew digital token.',
        deviceScannerId: 'TERM-4028-V4',
        verificationService: 'Active Spread',
        previousScanTime: 'Today, 09:35 AM',
        previousScannerId: 'TERM-4028-V4 (Driver M. Kavi)',
      };
    }

    if (record.status === 'INVALID_ROUTE') {
      this.activeTrip.pendingFailCount += 1;
      const activityItem: TicketActivityItem = {
        id: `act-${now}`,
        ticketId: record.ticketId,
        ticketTypeLabel: 'Wrong Route',
        eventText: 'Rejected just now',
        result: 'REJECT',
        timestamp: now,
        fareAmount: 0,
        method,
        reason: 'Valid only on Line 138',
      };
      this.activeTrip.recentActivity.unshift(activityItem);
      this.passengerManifest.unshift({
        id: `p-${now}`,
        ticketId: record.ticketId,
        passengerName: record.passengerName,
        type: 'Wrong Route',
        fareLabel: 'Wrong Route',
        badgeLabel: 'Rejected',
        badgeSubLabel: 'Override Off',
        category: 'FAILED',
        validationStatus: 'REJECTED',
        boardedAtStop: this.activeTrip.currentStop,
        boardedAtTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fare: 0,
        status: 'REJECTED',
        method,
        rejectionReason: 'Ticket valid only for Route 138, not Line 42',
        destination: record.destinationStop || this.activeTrip.destination,
      });
      this.notifyListeners();
      return {
        valid: false,
        result: 'REJECT',
        reason: 'Ticket valid only for Route 138, not Line 42.',
        ticketId: record.ticketId,
        ticketTypeLabel: 'Wrong Route',
        fareAmount: 0,
        activityItem,
        updatedTrip: this.getActiveTrip(),
        bookingReference: record.bookingReference || 'MTA-BK-44110',
        passengerCount: record.passengerCount || 1,
        originStop: record.originStop || 'Pettah Main Station',
        destinationStop: record.destinationStop || 'Homagama Town',
        originZone: record.originZone || 'Zone 1',
        destinationZone: record.destinationZone || 'Zone 4',
        paymentStatus: 'PAID',
        paymentMethod: record.paymentMethod || 'Online QR Fare',
        transactionId: record.transactionId || 'TXN-441109-138',
        paidAt: new Date(now - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        faultCode: '0x32',
        failureDiagnostics: 'ROUTE_MISMATCH_SCHEMA: Pass valid strictly for Line 138, not Line 42.',
        operationalMandate: 'Action: Inform passenger of line transfer rules or collect Line 42 fare (Rs 65.00).',
        deviceScannerId: 'TERM-4028-V4',
        verificationService: 'Active Spread',
      };
    }

    // SUCCESSFUL VALIDATION
    record.status = 'USED';
    record.usedAt = now;

    this.activeTrip.digitalQrCount += 1;
    this.activeTrip.shiftDigitalFareTotal += record.fareAmount;
    this.activeTrip.occupiedSeats = Math.min(this.activeTrip.totalSeats, this.activeTrip.occupiedSeats + 1);

    const activityItem: TicketActivityItem = {
      id: `act-${now}`,
      ticketId: record.ticketId,
      ticketTypeLabel: record.type,
      eventText: 'Boarded just now',
      result: 'PASS',
      timestamp: now,
      fareAmount: record.fareAmount,
      method,
      passengerName: record.passengerName,
    };

    this.activeTrip.recentActivity.unshift(activityItem);

    this.passengerManifest.unshift({
      id: `p-${now}`,
      ticketId: record.ticketId,
      passengerName: record.passengerName,
      type: record.type,
      fareLabel: record.type,
      badgeLabel: 'Verified Digital',
      badgeSubLabel: method === 'NFC' ? 'NFC Tap' : 'QR Scan',
      category: 'DIGITAL',
      validationStatus: 'VALID',
      boardedAtStop: this.activeTrip.currentStop,
      boardedAtTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fare: record.fareAmount,
      status: 'ONBOARD',
      method,
      destination: record.destinationStop || 'Terminal 6',
    });

    this.notifyListeners();

    return {
      valid: true,
      result: 'PASS',
      ticketId: record.ticketId,
      ticketTypeLabel: record.type,
      fareAmount: record.fareAmount,
      passengerName: record.passengerName,
      activityItem,
      updatedTrip: this.getActiveTrip(),
      bookingReference: record.bookingReference || 'MTA-BK-90214',
      passengerCount: record.passengerCount || 1,
      originStop: record.originStop || 'Market St & 4th',
      destinationStop: record.destinationStop || 'University Malabe Campus',
      originZone: record.originZone || 'Zone 1',
      destinationZone: record.destinationZone || 'Zone 2',
      paymentStatus: record.paymentStatus || 'PAID',
      paymentMethod: record.paymentMethod || 'Digital Wallet Pay',
      transactionId: record.transactionId || 'TXN-884028-091',
      paidAt: new Date(now - 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      deviceScannerId: 'TERM-4028-V4',
      verificationService: 'Active Spread',
    };
  }

  public lookupTicketPreview(ticketIdInput: string): {
    found: boolean;
    ticketId: string;
    status: 'VALID' | 'USED' | 'EXPIRED' | 'INVALID_ROUTE' | 'NOT_FOUND';
    passengerName?: string;
    type?: string;
    fareAmount?: number;
    paymentMethod?: string;
    autoRenew?: boolean;
    route?: string;
  } {
    let cleanId = ticketIdInput.trim().toUpperCase();
    let record = this.tickets.get(cleanId);
    if (!record && cleanId.includes('-')) {
      const parts = cleanId.split('-');
      if (parts.length >= 2) {
        const baseId = `${parts[0]}-${parts[1]}`;
        record = this.tickets.get(baseId);
      }
    }

    if (!record) {
      return {
        found: false,
        ticketId: cleanId,
        status: 'NOT_FOUND',
      };
    }

    return {
      found: true,
      ticketId: record.ticketId,
      status: record.status,
      passengerName: record.passengerName,
      type: record.type,
      fareAmount: record.fareAmount,
      paymentMethod: record.paymentMethod || 'Parkway Wallet',
      autoRenew: true,
      route: `Line ${record.routeId} Eastbound`,
    };
  }

  public recordCashFare(amount: number = 50): TripData {
    const now = Date.now();
    this.activeTrip.cashFareCount += 1;
    this.activeTrip.occupiedSeats = Math.min(this.activeTrip.totalSeats, this.activeTrip.occupiedSeats + 1);

    const cashTicketId = `CSH-${Math.floor(4000 + Math.random() * 5000)}`;
    const activityItem: TicketActivityItem = {
      id: `act-cash-${now}`,
      ticketId: cashTicketId,
      ticketTypeLabel: 'Cash Fare Ticket',
      eventText: 'Boarded just now',
      result: 'PASS',
      timestamp: now,
      fareAmount: amount,
      method: 'CASH',
      passengerName: 'Walk-in Passenger',
    };

    this.activeTrip.recentActivity.unshift(activityItem);
    this.passengerManifest.unshift({
      id: `p-${now}`,
      ticketId: cashTicketId,
      passengerName: 'Walk-in Passenger',
      type: 'Cash Fare',
      fareLabel: `$${amount.toFixed(2)} Paid`,
      badgeLabel: 'Cash',
      badgeSubLabel: 'Farebox #1',
      category: 'CASH',
      validationStatus: 'VALID',
      boardedAtStop: this.activeTrip.currentStop,
      boardedAtTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fare: amount,
      status: 'ONBOARD',
      method: 'CASH',
      destination: this.activeTrip.destination,
    });
    this.notifyListeners();
    return this.getActiveTrip();
  }

  public reportDelay(payload: DelayReportPayload): TripData {
    this.activeTrip.tripStatus = 'DELAYED';
    this.activeTrip.scheduleStatus = 'DELAYED';
    this.activeTrip.delayMinutes = payload.estimatedDelayMinutes;
    this.activeTrip.delayReason = payload.reason;
    this.activeTrip.etaMinutes += payload.estimatedDelayMinutes;

    this.notifyListeners();
    return this.getActiveTrip();
  }

  public toggleDoors(): 'OPEN' | 'CLOSED' {
    this.activeTrip.doorStatus = this.activeTrip.doorStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    this.notifyListeners();
    return this.activeTrip.doorStatus;
  }

  public advanceStop(): TripData {
    const stops = this.activeTrip.stops;
    const currentIdx = stops.findIndex((s) => s.name === this.activeTrip.currentStop);

    if (currentIdx >= 0 && currentIdx < stops.length - 1) {
      stops[currentIdx].isCompleted = true;
      this.activeTrip.currentStop = stops[currentIdx + 1].name;
      this.activeTrip.doorStatus = 'OPEN';

      if (currentIdx + 2 < stops.length) {
        this.activeTrip.nextStop = stops[currentIdx + 2].name;
        this.activeTrip.etaMinutes = stops[currentIdx + 2].etaMinutes;
      } else {
        this.activeTrip.nextStop = 'Destination Terminal';
        this.activeTrip.etaMinutes = 2;
      }
    }

    this.notifyListeners();
    return this.getActiveTrip();
  }

  public updateOccupancy(delta: number): TripData {
    const next = Math.max(0, Math.min(this.activeTrip.totalSeats, this.activeTrip.occupiedSeats + delta));
    this.activeTrip.occupiedSeats = next;
    this.notifyListeners();
    return this.getActiveTrip();
  }

  public exportManifestReport(): {
    tripId: string;
    busNumber: string;
    route: string;
    driverName: string;
    occupancy: string;
    totalBoarded: number;
    digitalQrCount: number;
    cashFareCount: number;
    failedScanCount: number;
    shiftRevenue: number;
    duration: string;
    csv: string;
    timestamp: string;
  } {
    const trip = this.getActiveTrip();
    const headers = 'Ticket ID,Passenger Name,Type,Status,Method,Boarded Stop,Boarded Time,Fare\n';
    const rows = this.passengerManifest
      .map(
        (p) =>
          `"${p.ticketId}","${p.passengerName}","${p.type}","${p.status}","${p.method || 'QR'}","${p.boardedAtStop}","${p.boardedAtTime}",${p.fare}`
      )
      .join('\n');
    return {
      tripId: trip.id,
      busNumber: trip.busNumber,
      route: trip.routeNumber,
      driverName: trip.driverName,
      occupancy: `${trip.occupiedSeats} / ${trip.totalSeats} (${Math.round((trip.occupiedSeats / trip.totalSeats) * 100)}%)`,
      totalBoarded: trip.occupiedSeats,
      digitalQrCount: trip.digitalQrCount,
      cashFareCount: trip.cashFareCount,
      failedScanCount: trip.pendingFailCount,
      shiftRevenue: trip.shiftDigitalFareTotal,
      duration: '1h 44m',
      csv: headers + rows,
      timestamp: new Date().toISOString(),
    };
  }

  public reportTripIssue(payload: { type: string; description: string; reporterId?: string }): {
    success: boolean;
    issueId: string;
    timestamp: string;
  } {
    const issueId = `ISSUE-${Date.now()}`;
    this.tripIssues.push({
      id: issueId,
      type: payload.type,
      description: payload.description,
      timestamp: Date.now(),
      status: 'LOGGED_TO_DISPATCH',
    });
    return {
      success: true,
      issueId,
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  public endTrip(): TripData {
    this.activeTrip.tripStatus = 'COMPLETED';
    this.activeTrip.completedAt = new Date().toISOString();
    this.activeTrip.doorStatus = 'CLOSED';
    this.notifyListeners();
    return this.getActiveTrip();
  }

  public subscribe(listener: (trip: TripData) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.refreshActivityTimeStrings();
    const copy = { ...this.activeTrip, recentActivity: [...this.activeTrip.recentActivity] };
    for (const fn of this.listeners) {
      fn(copy);
    }
  }

  private refreshActivityTimeStrings() {
    const now = Date.now();
    for (const act of this.activeTrip.recentActivity) {
      const diffSec = Math.floor((now - act.timestamp) / 1000);
      if (diffSec < 30) {
        act.eventText = act.result === 'PASS' ? 'Boarded just now' : 'Rejected just now';
      } else if (diffSec < 120) {
        act.eventText = act.result === 'PASS' ? 'Boarded 1m ago' : 'Rejected 1m ago';
      } else {
        const mins = Math.floor(diffSec / 60);
        act.eventText = act.result === 'PASS' ? `Boarded ${mins}m ago` : `Rejected ${mins}m ago`;
      }
    }
  }
}

export const tripDatabase = new TripDatabase();
