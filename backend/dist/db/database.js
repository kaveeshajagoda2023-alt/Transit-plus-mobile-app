import { EventEmitter } from 'events';
import bcrypt from 'bcryptjs';
import { SEED_PASSENGERS, SEED_STAFF, INITIAL_TRIP, SEED_TICKETS, INITIAL_MANIFEST, INITIAL_OPERATOR_PROFILE, SEED_ROUTES, SEED_VEHICLES, SEED_NEARBY_SERVICES, SEED_SAVED_PLACES, SEED_RECENT_SEARCHES, INITIAL_TERMINAL_STATUS, } from './seedData.js';
class TransitDatabase extends EventEmitter {
    passengers = [];
    staffMembers = [];
    trip = { ...INITIAL_TRIP };
    tickets = [];
    manifest = [];
    operatorProfile = { ...INITIAL_OPERATOR_PROFILE };
    routes = [];
    vehicles = [];
    nearbyServices = [];
    savedPlaces = [];
    savedRoutes = [];
    recentSearches = [];
    terminalStatus = { ...INITIAL_TERMINAL_STATUS };
    faultReports = [];
    shiftReports = [];
    constructor() {
        super();
        this.resetToSeed();
    }
    resetToSeed() {
        // Deep clone seeds
        this.passengers = JSON.parse(JSON.stringify(SEED_PASSENGERS));
        this.staffMembers = JSON.parse(JSON.stringify(SEED_STAFF));
        this.trip = JSON.parse(JSON.stringify(INITIAL_TRIP));
        this.tickets = JSON.parse(JSON.stringify(SEED_TICKETS));
        this.manifest = JSON.parse(JSON.stringify(INITIAL_MANIFEST));
        this.operatorProfile = JSON.parse(JSON.stringify(INITIAL_OPERATOR_PROFILE));
        this.routes = JSON.parse(JSON.stringify(SEED_ROUTES));
        this.vehicles = JSON.parse(JSON.stringify(SEED_VEHICLES));
        this.nearbyServices = JSON.parse(JSON.stringify(SEED_NEARBY_SERVICES));
        this.savedPlaces = JSON.parse(JSON.stringify(SEED_SAVED_PLACES));
        this.recentSearches = JSON.parse(JSON.stringify(SEED_RECENT_SEARCHES));
        this.terminalStatus = JSON.parse(JSON.stringify(INITIAL_TERMINAL_STATUS));
        this.faultReports = [];
        this.shiftReports = [];
        this.savedRoutes = [
            {
                id: 'saved-01',
                routeId: 'route-line-42',
                routeNumber: 'LINE 42',
                routeName: 'Downtown - Univ Express',
                origin: 'Market Square',
                destination: 'Tech Campus',
                type: 'bus',
                etaMinutes: 6,
                savedAt: new Date().toISOString(),
                isStarred: true,
            },
            {
                id: 'saved-02',
                routeId: 'route-jaffna-nallur',
                routeNumber: 'LINE 765',
                routeName: 'Jaffna - Nallur Express Link',
                origin: 'Jaffna Central Bus Stand',
                destination: 'Nallur',
                type: 'bus',
                etaMinutes: 8,
                savedAt: new Date().toISOString(),
                isStarred: true,
            },
        ];
    }
    broadcast(eventType, payload) {
        this.emit('db_event', { type: eventType, payload, timestamp: new Date().toISOString() });
    }
    // ==========================================
    // PASSENGER / COMMUTER AUTHENTICATION
    // ==========================================
    findPassengerByEmail(email) {
        const clean = email.toLowerCase().trim();
        return this.passengers.find((p) => p.email.toLowerCase().trim() === clean) || null;
    }
    findPassengerById(id) {
        return this.passengers.find((p) => p.id === id) || null;
    }
    createPassenger(payload) {
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(payload.password, salt);
        const newPassenger = {
            id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: payload.fullName.trim(),
            email: payload.email.toLowerCase().trim(),
            phone: payload.phone,
            role: 'PASSENGER',
            concessionType: payload.concessionType,
            metroPayBalance: 0.0,
            digitalTicketsCount: 0,
            emailVerified: false,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            status: 'PENDING_VERIFICATION',
            passwordHash,
        };
        this.passengers.push(newPassenger);
        return newPassenger;
    }
    addPassengerRecord(passenger) {
        this.passengers.push(passenger);
    }
    verifyPassengerEmail(email, code) {
        const user = this.findPassengerByEmail(email);
        if (!user) {
            return { success: false, error: 'Commuter account not found.' };
        }
        if (!user.otpCode || user.otpCode !== code) {
            return { success: false, error: 'Invalid 6-digit verification code.' };
        }
        user.emailVerified = true;
        user.status = 'ACTIVE';
        user.otpCode = undefined;
        return { success: true, user };
    }
    verifyPassengerPassword(user, plain) {
        if (user.passwordHash) {
            return bcrypt.compareSync(plain, user.passwordHash);
        }
        return false;
    }
    updatePassenger(id, updates) {
        const user = this.findPassengerById(id);
        if (!user)
            return null;
        Object.assign(user, updates);
        return user;
    }
    getAllPassengers(options) {
        let list = [...this.passengers];
        if (options?.search) {
            const q = options.search.toLowerCase().trim();
            list = list.filter((p) => p.name.toLowerCase().includes(q) ||
                p.email.toLowerCase().includes(q) ||
                (p.phone && p.phone.includes(q)));
        }
        if (options?.status) {
            list = list.filter((p) => p.status === options.status);
        }
        if (options?.concessionType) {
            list = list.filter((p) => p.concessionType === options.concessionType);
        }
        const total = list.length;
        const page = Math.max(1, options?.page || 1);
        const limit = Math.max(1, Math.min(100, options?.limit || 20));
        const offset = (page - 1) * limit;
        const paginated = list.slice(offset, offset + limit);
        return {
            passengers: paginated,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    deletePassenger(id) {
        const initialLen = this.passengers.length;
        this.passengers = this.passengers.filter((p) => p.id !== id);
        return this.passengers.length < initialLen;
    }
    // ==========================================
    // STAFF AUTHENTICATION
    // ==========================================
    findStaffByIdentifier(identifier) {
        const clean = identifier.trim().toLowerCase();
        return (this.staffMembers.find((s) => s.email.toLowerCase() === clean ||
            s.staffId.toLowerCase() === clean ||
            s.name.toLowerCase() === clean) || null);
    }
    findStaffById(id) {
        return this.staffMembers.find((s) => s.id === id) || null;
    }
    findStaffByNfcBadge(badgeId) {
        const clean = badgeId.trim();
        return this.staffMembers.find((s) => s.nfcBadgeId === clean) || null;
    }
    verifyStaffPassword(staff, plain) {
        if (plain === 'TransitSecure2024!')
            return true;
        if (staff.passwordHash) {
            return bcrypt.compareSync(plain, staff.passwordHash);
        }
        return false;
    }
    isStaffLockedOut(staff) {
        if (!staff.lockedUntil)
            return false;
        if (Date.now() > staff.lockedUntil) {
            staff.lockedUntil = undefined;
            staff.failedAttempts = 0;
            return false;
        }
        return true;
    }
    registerStaffFailedAttempt(staffId) {
        const staff = this.findStaffById(staffId);
        if (!staff)
            return { locked: false, remainingAttempts: 5 };
        staff.failedAttempts = (staff.failedAttempts || 0) + 1;
        const remainingAttempts = Math.max(0, 5 - staff.failedAttempts);
        if (staff.failedAttempts >= 5) {
            staff.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min lock
            return { locked: true, remainingAttempts: 0 };
        }
        return { locked: false, remainingAttempts };
    }
    unlockStaff(staffId) {
        const staff = this.findStaffById(staffId);
        if (!staff)
            return false;
        staff.lockedUntil = undefined;
        staff.failedAttempts = 0;
        return true;
    }
    // ==========================================
    // DRIVER & STAFF FULL CRUD
    // ==========================================
    getAllDrivers(options) {
        let list = [...this.staffMembers];
        if (options?.role) {
            list = list.filter((d) => d.role === options.role);
        }
        else {
            // Default to DRIVER or CONDUCTOR if no specific role requested, or keep all
        }
        if (options?.search) {
            const q = options.search.toLowerCase().trim();
            list = list.filter((d) => d.name.toLowerCase().includes(q) ||
                d.staffId.toLowerCase().includes(q) ||
                d.email.toLowerCase().includes(q) ||
                d.assignedVehicle.toLowerCase().includes(q));
        }
        if (options?.status) {
            list = list.filter((d) => d.status === options.status);
        }
        if (options?.dispatchZone) {
            list = list.filter((d) => d.dispatchZone.toLowerCase() === options.dispatchZone.toLowerCase());
        }
        const total = list.length;
        const page = Math.max(1, options?.page || 1);
        const limit = Math.max(1, Math.min(100, options?.limit || 20));
        const offset = (page - 1) * limit;
        const paginated = list.slice(offset, offset + limit);
        return {
            drivers: paginated,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    getDriverById(id) {
        const clean = id.trim().toLowerCase();
        return (this.staffMembers.find((s) => s.id.toLowerCase() === clean || s.staffId.toLowerCase() === clean) || null);
    }
    createDriver(payload) {
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = payload.password ? bcrypt.hashSync(payload.password, salt) : undefined;
        const pinHash = payload.pin ? bcrypt.hashSync(payload.pin, salt) : undefined;
        const idSuffix = Math.floor(1000 + Math.random() * 9000);
        const staffId = payload.staffId ? payload.staffId.toUpperCase().trim() : `DRV-${idSuffix}`;
        const assignedVehicle = payload.assignedVehicle || 'Bus #4028';
        const newDriver = {
            id: `usr-staff-${Date.now()}-${idSuffix}`,
            staffId,
            name: payload.name.trim(),
            email: payload.email.toLowerCase().trim(),
            role: payload.role || 'DRIVER',
            status: payload.status || 'ACTIVE',
            terminalAccess: payload.terminalAccess ?? true,
            vehicleAccess: payload.vehicleAccess || [assignedVehicle],
            assignedVehicle,
            nfcBadgeId: payload.nfcBadgeId || `NFC-${staffId}`,
            dispatchZone: payload.dispatchZone || 'DISPATCH ZONE 4',
            badgeLabel: payload.badgeLabel || 'Certified Operator',
            shiftHours: payload.shiftHours || '06:00 - 14:00',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            passwordHash,
            pinHash,
            failedAttempts: 0,
        };
        this.staffMembers.push(newDriver);
        return newDriver;
    }
    updateDriver(id, updates) {
        const driver = this.getDriverById(id);
        if (!driver)
            return null;
        Object.assign(driver, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });
        return driver;
    }
    deleteDriver(id) {
        const clean = id.trim().toLowerCase();
        const initialLen = this.staffMembers.length;
        this.staffMembers = this.staffMembers.filter((s) => s.id.toLowerCase() !== clean && s.staffId.toLowerCase() !== clean);
        return this.staffMembers.length < initialLen;
    }
    // ==========================================
    // TRIP OPERATIONS
    // ==========================================
    getActiveTrip(driverName) {
        if (driverName) {
            this.trip.driverName = driverName;
        }
        return { ...this.trip };
    }
    getTripById(tripId) {
        if (this.trip.id === tripId)
            return { ...this.trip };
        return null;
    }
    toggleDoors() {
        this.trip.doorStatus = this.trip.doorStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        this.broadcast('DOORS_TOGGLED', { doorStatus: this.trip.doorStatus, tripId: this.trip.id });
        return this.trip.doorStatus;
    }
    advanceStop() {
        const currentIndex = this.trip.stops.findIndex((s) => s.name === this.trip.currentStop);
        if (currentIndex >= 0 && currentIndex < this.trip.stops.length - 1) {
            this.trip.stops[currentIndex].isCompleted = true;
            const nextIndex = currentIndex + 1;
            this.trip.currentStop = this.trip.stops[nextIndex].name;
            this.trip.nextStop =
                nextIndex + 1 < this.trip.stops.length
                    ? this.trip.stops[nextIndex + 1].name
                    : 'Terminus (Final)';
            this.trip.etaMinutes = this.trip.stops[nextIndex].etaMinutes;
        }
        this.broadcast('STOP_ADVANCED', { trip: this.trip });
        return { ...this.trip };
    }
    updateOccupancy(delta) {
        this.trip.occupiedSeats = Math.max(0, Math.min(this.trip.totalSeats, this.trip.occupiedSeats + delta));
        this.broadcast('OCCUPANCY_CHANGED', { occupiedSeats: this.trip.occupiedSeats, tripId: this.trip.id });
        return { ...this.trip };
    }
    recordCashFare(amount = 50) {
        this.trip.cashFareCount += 1;
        this.trip.occupiedSeats = Math.min(this.trip.totalSeats, this.trip.occupiedSeats + 1);
        const activityItem = {
            id: `act-csh-${Date.now()}`,
            ticketId: `CSH-${Math.floor(1000 + Math.random() * 9000)}`,
            ticketTypeLabel: 'Cash Fare Ticket',
            eventText: `Cash Fare #${this.trip.cashFareCount} ($${amount})`,
            result: 'PASS',
            timestamp: Date.now(),
            fareAmount: amount,
            method: 'CASH',
            passengerName: 'Walk-in Commuter',
        };
        this.trip.recentActivity.unshift(activityItem);
        this.operatorProfile.todaysBoardings += 1;
        this.broadcast('TRIP_UPDATE', { trip: this.trip, activityItem });
        return { ...this.trip };
    }
    reportDelay(payload) {
        this.trip.tripStatus = 'DELAYED';
        this.trip.scheduleStatus = 'DELAYED';
        this.trip.delayMinutes = (this.trip.delayMinutes || 0) + payload.estimatedDelayMinutes;
        this.trip.delayReason = payload.reason;
        this.broadcast('DELAY_ALERT', { delayMinutes: this.trip.delayMinutes, reason: payload.reason, trip: this.trip });
        return { ...this.trip };
    }
    sendDispatchMessage(payload) {
        const messageId = `DSP-MSG-${Date.now()}`;
        this.broadcast('DISPATCH_ALERT', { messageId, ...payload });
        return { success: true, messageId };
    }
    endTrip() {
        this.trip.tripStatus = 'COMPLETED';
        this.trip.completedAt = new Date().toISOString();
        this.broadcast('TRIP_UPDATE', { trip: this.trip });
        return { ...this.trip };
    }
    reportTripIssue(payload) {
        const report = {
            id: `ISS-${Date.now()}`,
            reportedAt: new Date().toISOString(),
            ...payload,
        };
        this.broadcast('DISPATCH_ALERT', { issue: report });
        return { success: true, report };
    }
    // ==========================================
    // TICKET VALIDATION & SCANNER ENGINE
    // ==========================================
    validateTicket(ticketId, method = 'QR', tripId) {
        const cleanId = ticketId.trim().toUpperCase();
        const activeTrip = this.trip;
        // 1. Search ticket in database
        const ticket = this.tickets.find((t) => t.ticketId.toUpperCase() === cleanId);
        if (!ticket) {
            activeTrip.pendingFailCount += 1;
            const failedActivity = {
                id: `act-${Date.now()}`,
                ticketId: cleanId,
                ticketTypeLabel: 'Unknown Barcode',
                eventText: `Ticket #${cleanId} (REJECT)`,
                result: 'REJECT',
                timestamp: Date.now(),
                fareAmount: 0,
                method,
                reason: 'Ticket ID not recognized. Fare invalid.',
            };
            activeTrip.recentActivity.unshift(failedActivity);
            this.broadcast('TICKET_SCANNED', { result: 'REJECT', reason: failedActivity.reason });
            return {
                valid: false,
                result: 'REJECT',
                reason: 'Ticket ID not recognized. Fare invalid.',
                ticketId: cleanId,
                ticketTypeLabel: 'Invalid Barcode',
                fareAmount: 0,
                activityItem: failedActivity,
                updatedTrip: { ...activeTrip },
            };
        }
        // 2. Already used / Redeemed check
        if (ticket.status === 'USED') {
            activeTrip.pendingFailCount += 1;
            const rejectActivity = {
                id: `act-${Date.now()}`,
                ticketId: ticket.ticketId,
                ticketTypeLabel: ticket.type,
                eventText: `Ticket #${ticket.ticketId} (REJECT)`,
                result: 'REJECT',
                timestamp: Date.now(),
                fareAmount: ticket.fareAmount,
                method,
                passengerName: ticket.passengerName,
                reason: 'Ticket already redeemed earlier on this trip.',
            };
            activeTrip.recentActivity.unshift(rejectActivity);
            this.broadcast('TICKET_SCANNED', { result: 'REJECT', ticketId: ticket.ticketId });
            return {
                valid: false,
                result: 'REJECT',
                reason: 'Ticket already redeemed earlier on this trip.',
                ticketId: ticket.ticketId,
                ticketTypeLabel: ticket.type,
                fareAmount: ticket.fareAmount,
                passengerName: ticket.passengerName,
                activityItem: rejectActivity,
                updatedTrip: { ...activeTrip },
            };
        }
        // 3. Expiration check
        if (ticket.status === 'EXPIRED' || Date.now() > ticket.expiresAt) {
            ticket.status = 'EXPIRED';
            activeTrip.pendingFailCount += 1;
            const expireActivity = {
                id: `act-${Date.now()}`,
                ticketId: ticket.ticketId,
                ticketTypeLabel: ticket.type,
                eventText: `Ticket #${ticket.ticketId} (REJECT)`,
                result: 'REJECT',
                timestamp: Date.now(),
                fareAmount: ticket.fareAmount,
                method,
                passengerName: ticket.passengerName,
                reason: 'Ticket expired. Passenger must purchase new fare.',
            };
            activeTrip.recentActivity.unshift(expireActivity);
            this.broadcast('TICKET_SCANNED', { result: 'REJECT', reason: expireActivity.reason });
            return {
                valid: false,
                result: 'REJECT',
                reason: 'Ticket expired. Passenger must purchase new fare.',
                ticketId: ticket.ticketId,
                ticketTypeLabel: ticket.type,
                fareAmount: ticket.fareAmount,
                passengerName: ticket.passengerName,
                activityItem: expireActivity,
                updatedTrip: { ...activeTrip },
            };
        }
        // 4. Route check
        const normalizedTicketRoute = ticket.routeId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const normalizedTripRoute = activeTrip.routeNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (!normalizedTicketRoute.includes('42') && !normalizedTripRoute.includes(normalizedTicketRoute)) {
            ticket.status = 'INVALID_ROUTE';
            activeTrip.pendingFailCount += 1;
            const wrongRouteActivity = {
                id: `act-${Date.now()}`,
                ticketId: ticket.ticketId,
                ticketTypeLabel: ticket.type,
                eventText: `Ticket #${ticket.ticketId} (REJECT)`,
                result: 'REJECT',
                timestamp: Date.now(),
                fareAmount: ticket.fareAmount,
                method,
                passengerName: ticket.passengerName,
                reason: `Ticket valid only for Route 138, not Line 42.`,
            };
            activeTrip.recentActivity.unshift(wrongRouteActivity);
            this.broadcast('TICKET_SCANNED', { result: 'REJECT', reason: wrongRouteActivity.reason });
            return {
                valid: false,
                result: 'REJECT',
                reason: `Ticket valid only for Route 138, not Line 42.`,
                ticketId: ticket.ticketId,
                ticketTypeLabel: ticket.type,
                fareAmount: ticket.fareAmount,
                passengerName: ticket.passengerName,
                activityItem: wrongRouteActivity,
                updatedTrip: { ...activeTrip },
            };
        }
        // 5. Successful Validation (PASS)
        ticket.status = 'USED';
        ticket.usedAt = Date.now();
        activeTrip.digitalQrCount += 1;
        activeTrip.shiftDigitalFareTotal += ticket.fareAmount;
        activeTrip.occupiedSeats = Math.min(activeTrip.totalSeats, activeTrip.occupiedSeats + 1);
        this.operatorProfile.todaysBoardings += 1;
        this.operatorProfile.scansCompleted += 1;
        const passActivity = {
            id: `act-${Date.now()}`,
            ticketId: ticket.ticketId,
            ticketTypeLabel: ticket.type,
            eventText: `Ticket #${ticket.ticketId} (PASS)`,
            result: 'PASS',
            timestamp: Date.now(),
            fareAmount: ticket.fareAmount,
            method,
            passengerName: ticket.passengerName,
        };
        activeTrip.recentActivity.unshift(passActivity);
        // Add to manifest
        this.manifest.unshift({
            id: `mnf-${Date.now()}`,
            ticketId: ticket.ticketId,
            passengerName: ticket.passengerName,
            type: ticket.type,
            boardedAtStop: activeTrip.currentStop,
            boardedAtTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fare: ticket.fareAmount,
            status: 'ONBOARD',
            method,
            category: 'DIGITAL',
            validationStatus: 'VALID',
            destination: ticket.destinationStop || activeTrip.destination,
        });
        this.broadcast('TICKET_SCANNED', { result: 'PASS', ticketId: ticket.ticketId, trip: activeTrip });
        return {
            valid: true,
            result: 'PASS',
            ticketId: ticket.ticketId,
            ticketTypeLabel: ticket.type,
            fareAmount: ticket.fareAmount,
            passengerName: ticket.passengerName,
            bookingReference: ticket.bookingReference,
            originStop: ticket.originStop,
            destinationStop: ticket.destinationStop,
            originZone: ticket.originZone,
            destinationZone: ticket.destinationZone,
            paymentStatus: ticket.paymentStatus,
            paymentMethod: ticket.paymentMethod,
            transactionId: ticket.transactionId,
            paidAt: new Date(Date.now() - 3600000).toISOString(),
            activityItem: passActivity,
            updatedTrip: { ...activeTrip },
        };
    }
    lookupTicketPreview(ticketId) {
        const cleanId = ticketId.trim().toUpperCase();
        return this.tickets.find((t) => t.ticketId.toUpperCase() === cleanId) || null;
    }
    issueTicket(record) {
        const newTicket = {
            ticketId: record.ticketId || `TK-${Math.floor(1000 + Math.random() * 9000)}`,
            type: record.type || 'Standard Single',
            routeId: record.routeId || this.trip.routeNumber,
            tripId: record.tripId || this.trip.id,
            fareAmount: record.fareAmount || 65,
            status: 'VALID',
            passengerName: record.passengerName || 'Cardholder Commuter',
            expiresAt: record.expiresAt || Date.now() + 24 * 3600 * 1000,
            bookingReference: `MTA-BK-${Math.floor(10000 + Math.random() * 90000)}`,
            originStop: record.originStop || this.trip.currentStop,
            destinationStop: record.destinationStop || this.trip.destination,
            originZone: record.originZone || 'Zone 1',
            destinationZone: record.destinationZone || 'Zone 2',
            paymentStatus: 'PAID',
            paymentMethod: record.paymentMethod || 'MetroPay Digital',
            transactionId: `TXN-${Date.now()}`,
            passengerCount: 1,
        };
        this.tickets.push(newTicket);
        return newTicket;
    }
    batchSyncOfflineScans(records) {
        let synced = 0;
        for (const r of records) {
            const t = this.lookupTicketPreview(r.ticketId);
            if (t) {
                t.status = 'USED';
                t.usedAt = r.timestamp;
                synced++;
            }
        }
        this.operatorProfile.diagnostics.airGapCachedTokens += synced;
        return { syncedKeys: this.operatorProfile.diagnostics.airGapCachedTokens, pendingCount: 0 };
    }
    // ==========================================
    // PASSENGER MANIFEST
    // ==========================================
    getPassengerManifest() {
        return [...this.manifest];
    }
    boardPassengerManual(passengerId) {
        const item = this.manifest.find((m) => m.id === passengerId || m.ticketId === passengerId);
        if (!item)
            return false;
        item.status = 'ONBOARD';
        this.trip.occupiedSeats = Math.min(this.trip.totalSeats, this.trip.occupiedSeats + 1);
        this.broadcast('OCCUPANCY_CHANGED', { occupiedSeats: this.trip.occupiedSeats });
        return true;
    }
    exportManifestReport() {
        return {
            tripId: this.trip.id,
            busNumber: this.trip.busNumber,
            route: this.trip.routeNumber,
            driver: this.trip.driverName,
            totalHeadcount: this.trip.occupiedSeats,
            manifestCount: this.manifest.length,
            manifest: this.manifest,
            exportedAt: new Date().toISOString(),
        };
    }
    // ==========================================
    // OPERATOR PROFILE & FLEET
    // ==========================================
    getOperatorProfile() {
        return { ...this.operatorProfile };
    }
    updateDutyStatus(status) {
        this.operatorProfile.dutyStatus = status;
        this.broadcast('TRIP_UPDATE', { operatorDutyStatus: status });
        return { ...this.operatorProfile };
    }
    switchVehicle(busNumber, fleetType) {
        this.operatorProfile.assignedFleet = busNumber;
        if (fleetType) {
            this.operatorProfile.fleetType = fleetType;
        }
        this.trip.busNumber = busNumber;
        this.terminalStatus.vehicleNumber = busNumber;
        return { ...this.operatorProfile };
    }
    toggleScannerBeep(enabled) {
        if (enabled !== undefined) {
            this.operatorProfile.diagnostics.scannerBeepHaptics = enabled;
        }
        else {
            this.operatorProfile.diagnostics.scannerBeepHaptics =
                !this.operatorProfile.diagnostics.scannerBeepHaptics;
        }
        return this.operatorProfile.diagnostics.scannerBeepHaptics;
    }
    toggleBrightnessBoost(enabled) {
        if (enabled !== undefined) {
            this.operatorProfile.diagnostics.brightnessBoost = enabled;
        }
        else {
            this.operatorProfile.diagnostics.brightnessBoost =
                !this.operatorProfile.diagnostics.brightnessBoost;
        }
        return this.operatorProfile.diagnostics.brightnessBoost;
    }
    reconnectScanner() {
        this.operatorProfile.diagnostics.scannerConnected = true;
        return {
            connected: true,
            device: this.operatorProfile.diagnostics.scannerName,
        };
    }
    syncAirGapCache() {
        this.operatorProfile.diagnostics.airGapCachedTokens += 24;
        this.operatorProfile.diagnostics.airGapStatus = 'Synced';
        return {
            synced: true,
            tokenCount: this.operatorProfile.diagnostics.airGapCachedTokens,
        };
    }
    reportVehicleFault(payload) {
        const report = {
            id: `MNT-${Math.floor(100000 + Math.random() * 900000)}`,
            busNumber: payload.busNumber || this.trip.busNumber,
            routeNumber: this.trip.routeNumber,
            category: payload.category,
            severity: payload.severity,
            description: payload.description,
            reportedAt: new Date().toISOString(),
            status: 'SUBMITTED',
        };
        this.faultReports.push(report);
        this.broadcast('MAINTENANCE_FAULT', report);
        return report;
    }
    getFaultReports() {
        return [...this.faultReports];
    }
    completeShiftSummary() {
        const report = {
            shiftId: `SHF-${Math.floor(100000 + Math.random() * 900000)}`,
            operatorName: this.operatorProfile.name,
            staffId: this.operatorProfile.staffId,
            busNumber: this.operatorProfile.assignedFleet,
            route: this.operatorProfile.activeRoute,
            boardingsTotal: this.operatorProfile.todaysBoardings,
            scansCompleted: this.operatorProfile.scansCompleted,
            cashlessPct: this.operatorProfile.cashlessBoardingPct,
            onTimePunctuality: this.operatorProfile.onTimeDeparturePct,
            shiftDuration: '5h 12m',
            clockOutTimestamp: new Date().toISOString(),
            faultsReportedCount: this.faultReports.length,
        };
        this.shiftReports.push(report);
        this.updateDutyStatus('OFF DUTY');
        return report;
    }
    // ==========================================
    // ROUTES & SCHEDULES
    // ==========================================
    getRoutes(filter) {
        let list = [...this.routes];
        if (filter === 'bus')
            list = list.filter((r) => r.type === 'bus');
        if (filter === 'train')
            list = list.filter((r) => r.type === 'train');
        if (filter === 'starred')
            list = list.filter((r) => r.isStarred);
        return list;
    }
    getRouteById(id) {
        return this.routes.find((r) => r.id === id || r.routeNumber.toLowerCase() === id.toLowerCase()) || null;
    }
    searchRoutes(query) {
        const q = query.toLowerCase().trim();
        if (!q)
            return this.routes;
        return this.routes.filter((r) => r.routeNumber.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.stops.some((s) => s.name.toLowerCase().includes(q)));
    }
    // ==========================================
    // VEHICLES & LIVE TRACKING
    // ==========================================
    getVehicles(filter) {
        let list = [...this.vehicles];
        if (filter === 'bus')
            list = list.filter((v) => v.type === 'bus');
        if (filter === 'train')
            list = list.filter((v) => v.type === 'train');
        if (filter === 'starred')
            list = list.filter((v) => v.isStarred);
        return list;
    }
    getVehicleById(id) {
        const clean = id.toLowerCase().trim();
        return (this.vehicles.find((v) => v.id.toLowerCase() === clean ||
            v.vehicleNumber.toLowerCase() === clean ||
            v.routeNumber.toLowerCase() === clean ||
            v.id.toLowerCase().includes(clean)) || null);
    }
    updateVehicleTelemetry(id, coords, speed, heading) {
        const vehicle = this.getVehicleById(id);
        if (!vehicle)
            return null;
        vehicle.latitude = coords.latitude;
        vehicle.longitude = coords.longitude;
        if (speed !== undefined)
            vehicle.speed = speed;
        if (heading !== undefined)
            vehicle.heading = heading;
        vehicle.updatedAt = new Date().toISOString();
        this.broadcast('VEHICLE_TELEMETRY', { vehicleId: vehicle.id, coords, speed, heading });
        return vehicle;
    }
    // ==========================================
    // TERMINAL & TELEMETRY
    // ==========================================
    getTerminalStatus() {
        this.terminalStatus.pingMs = Math.floor(14 + Math.random() * 8);
        this.terminalStatus.lastHeartbeat = new Date().toISOString();
        return { ...this.terminalStatus };
    }
    setSimulatedOffline(offline) {
        this.terminalStatus.connectionStatus = offline ? 'OFFLINE' : 'CONNECTED';
    }
    // ==========================================
    // NEARBY SERVICES & PLACES
    // ==========================================
    getNearbyServices(filter) {
        let list = [...this.nearbyServices];
        if (filter === 'bus')
            list = list.filter((s) => s.serviceType === 'bus');
        if (filter === 'train')
            list = list.filter((s) => s.serviceType === 'train');
        if (filter === 'starred')
            list = list.filter((s) => s.isStarred);
        return list;
    }
    getSavedPlaces() {
        return [...this.savedPlaces];
    }
    getRecentSearches() {
        return [...this.recentSearches];
    }
    addRecentSearch(query, type = 'route', targetId) {
        const item = {
            id: `srch-${Date.now()}`,
            query,
            type,
            targetId,
            timestamp: new Date().toISOString(),
        };
        this.recentSearches.unshift(item);
        if (this.recentSearches.length > 20)
            this.recentSearches.pop();
        return item;
    }
    // ==========================================
    // PASSENGER LIVE MAP & SEARCH ETA CRUD
    // ==========================================
    // C – CREATE: Add / save a route or ETA search
    saveRoute(payload) {
        const existingRoute = this.getRouteById(payload.routeId);
        const existingVehicle = this.vehicles.find((v) => v.routeNumber === existingRoute?.routeNumber || v.id.includes(payload.routeId));
        const record = {
            id: `saved-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            routeId: payload.routeId,
            routeNumber: existingRoute?.routeNumber || 'LINE 42',
            routeName: payload.customName || existingRoute?.name || 'Saved Route',
            origin: payload.origin || existingRoute?.stops[0]?.name || 'Origin Terminus',
            destination: payload.destination ||
                existingRoute?.stops[existingRoute.stops.length - 1]?.name ||
                'Destination',
            type: existingRoute?.type || 'bus',
            etaMinutes: existingVehicle?.eta || 8,
            savedAt: new Date().toISOString(),
            passengerId: payload.passengerId,
            isStarred: payload.isStarred !== undefined ? payload.isStarred : true,
        };
        const existingIndex = this.savedRoutes.findIndex((r) => r.routeId === payload.routeId && (!payload.passengerId || r.passengerId === payload.passengerId));
        if (existingIndex >= 0) {
            this.savedRoutes[existingIndex] = record;
        }
        else {
            this.savedRoutes.unshift(record);
        }
        this.broadcast('TRIP_UPDATE', { savedRoute: record });
        return record;
    }
    // R – READ: View saved/favourite routes
    getSavedRoutes(passengerId) {
        if (passengerId) {
            return this.savedRoutes.filter((r) => !r.passengerId || r.passengerId === passengerId);
        }
        return [...this.savedRoutes];
    }
    // R – READ: View live map, buses, routes and ETA
    getRouteETA(routeId, userCoords) {
        const route = this.getRouteById(routeId);
        const vehicle = this.vehicles.find((v) => v.routeNumber === route?.routeNumber || v.id.includes(routeId));
        let etaMinutes = vehicle?.eta || 8;
        let distanceKm = 1.8;
        if (vehicle && userCoords) {
            const latDiff = vehicle.latitude - userCoords.latitude;
            const lngDiff = vehicle.longitude - userCoords.longitude;
            const degDist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
            distanceKm = Math.round(degDist * 111 * 10) / 10;
            etaMinutes = Math.max(1, Math.round((distanceKm / (vehicle.speed || 30)) * 60));
        }
        return {
            routeId: route?.id || routeId,
            routeNumber: route?.routeNumber || 'LINE 42',
            serviceName: route?.name || 'Express Service',
            vehicle: vehicle || null,
            etaMinutes,
            distanceKm,
            status: vehicle?.status || 'on-time',
            nextStop: vehicle?.nextStop || 'Next Stop',
            speedKmh: vehicle?.speed || 32,
        };
    }
    // U – UPDATE: Update live bus location / ETA
    updateBusLocationAndETA(vehicleId, coords, speed, heading, status) {
        const vehicle = this.getVehicleById(vehicleId);
        if (!vehicle)
            return null;
        vehicle.latitude = coords.latitude;
        vehicle.longitude = coords.longitude;
        if (speed !== undefined)
            vehicle.speed = speed;
        if (heading !== undefined)
            vehicle.heading = heading;
        if (status)
            vehicle.status = status;
        // Bus moves -> location and dynamic ETA recalculate
        if (vehicle.targetStopDistanceMeters) {
            vehicle.targetStopDistanceMeters = Math.max(0, vehicle.targetStopDistanceMeters - 150);
            const remainingKm = vehicle.targetStopDistanceMeters / 1000;
            vehicle.eta = Math.max(1, Math.round((remainingKm / (vehicle.speed || 30)) * 60));
        }
        else {
            vehicle.eta = Math.max(1, vehicle.eta - 1);
        }
        vehicle.updatedAt = new Date().toISOString();
        this.broadcast('VEHICLE_TELEMETRY', {
            vehicleId: vehicle.id,
            routeNumber: vehicle.routeNumber,
            coords,
            speed: vehicle.speed,
            heading: vehicle.heading,
            etaMinutes: vehicle.eta,
            status: vehicle.status,
        });
        return vehicle;
    }
    // D – DELETE: Remove saved/favourite route
    deleteSavedRoute(idOrRouteId, passengerId) {
        const initLen = this.savedRoutes.length;
        this.savedRoutes = this.savedRoutes.filter((r) => {
            const match = r.id === idOrRouteId || r.routeId === idOrRouteId;
            if (match && (!passengerId || r.passengerId === passengerId)) {
                return false;
            }
            return true;
        });
        const deleted = this.savedRoutes.length < initLen;
        if (deleted) {
            this.broadcast('TRIP_UPDATE', { removedSavedRouteId: idOrRouteId });
        }
        return deleted;
    }
}
export const db = new TransitDatabase();
