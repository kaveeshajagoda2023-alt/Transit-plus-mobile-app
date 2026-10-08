import {
  TripData,
  ScanValidationResponse,
  DelayReportPayload,
  DispatchAlertPayload,
  PassengerManifestItem,
} from '@/types/trip';
import { tripDatabase } from '../mock/tripDatabase';
import { terminalApi } from './terminalApi';

class TripApiService {
  /**
   * GET /api/trips/active
   */
  public async getActiveTrip(driverName?: string): Promise<TripData> {
    await new Promise((resolve) => setTimeout(resolve, 60));

    if (terminalApi.isOffline()) {
      throw new Error('Terminal offline. Unable to synchronize active trip data.');
    }

    return tripDatabase.getActiveTrip(driverName);
  }

  /**
   * POST /api/trips/:id/scan-ticket
   * Validates passenger QR or NFC ticket with backend database rules:
   * exists, not expired, not duplicated, matches route and trip.
   */
  public async validateTicket(
    ticketId: string,
    method: 'QR' | 'NFC' = 'QR'
  ): Promise<ScanValidationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 180));

    if (terminalApi.isOffline()) {
      throw new Error('Terminal offline. Real-time ticket cryptographic verification requires network.');
    }

    return tripDatabase.validateTicket(ticketId, method);
  }

  /**
   * GET /api/tickets/lookup-preview?code=:ticketId
   */
  public lookupTicketPreview(ticketId: string) {
    return tripDatabase.lookupTicketPreview(ticketId);
  }

  /**
   * POST /api/trips/:id/cash-fare
   */
  public async recordCashFare(amount: number = 50): Promise<TripData> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return tripDatabase.recordCashFare(amount);
  }

  /**
   * POST /api/trips/:id/report-delay
   */
  public async reportDelay(payload: DelayReportPayload): Promise<TripData> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return tripDatabase.reportDelay(payload);
  }

  /**
   * POST /api/trips/:id/dispatch
   */
  public async sendDispatchMessage(
    payload: DispatchAlertPayload
  ): Promise<{ success: boolean; messageId: string }> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      messageId: `DSP-MSG-${Date.now()}`,
    };
  }

  /**
   * POST /api/trips/:id/toggle-doors
   */
  public async toggleDoors(): Promise<{ doorStatus: 'OPEN' | 'CLOSED' }> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    const doorStatus = tripDatabase.toggleDoors();
    return { doorStatus };
  }

  /**
   * POST /api/trips/:id/advance-stop
   */
  public async advanceStop(): Promise<TripData> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return tripDatabase.advanceStop();
  }

  /**
   * POST /api/trips/:id/occupancy
   */
  public async updateOccupancy(delta: number): Promise<TripData> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    return tripDatabase.updateOccupancy(delta);
  }

  /**
   * POST /api/trips/:id/end
   */
  public async endTrip(): Promise<TripData> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return tripDatabase.endTrip();
  }

  /**
   * GET /api/trips/:id/passengers
   */
  public async getPassengerManifest(): Promise<PassengerManifestItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return tripDatabase.getPassengerManifest();
  }

  /**
   * GET /api/trips/:id/report
   */
  public async exportManifestReport() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return tripDatabase.exportManifestReport();
  }

  /**
   * POST /api/trips/:id/issues
   */
  public async reportTripIssue(payload: { type: string; description: string; reporterId?: string }) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return tripDatabase.reportTripIssue(payload);
  }

  /**
   * WebSocket / real-time trip event subscription
   */
  public subscribeTripUpdates(callback: (trip: TripData) => void): () => void {
    return tripDatabase.subscribe(callback);
  }
}

export const tripApi = new TripApiService();
