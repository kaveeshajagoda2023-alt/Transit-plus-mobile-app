import {
  OperatorProfileData,
  MaintenanceFaultReport,
  ShiftSummaryReport,
} from '@/types/staff';
import { operatorDatabase } from '../mock/operatorDatabase';
import { terminalApi } from './terminalApi';

export const operatorApi = {
  /**
   * Fetches the current operator profile & active duty telemetry
   */
  async getProfile(): Promise<OperatorProfileData> {
    if (terminalApi.isOffline()) {
      // Return cached profile
      return operatorDatabase.getProfile();
    }
    return operatorDatabase.getProfile();
  },

  /**
   * Updates the operator duty status (ON DUTY / OFF DUTY / ON BREAK)
   */
  async updateDutyStatus(status: 'ON DUTY' | 'OFF DUTY' | 'ON BREAK'): Promise<OperatorProfileData> {
    return operatorDatabase.updateDutyStatus(status);
  },

  /**
   * Switches the assigned vehicle/bus
   */
  async switchVehicle(busNumber: string, fleetType?: string): Promise<OperatorProfileData> {
    return operatorDatabase.switchVehicle(busNumber, fleetType);
  },

  /**
   * Toggles the audible/haptic confirmation on fare validation
   */
  async toggleScannerBeep(enabled?: boolean): Promise<boolean> {
    return operatorDatabase.toggleScannerBeep(enabled);
  },

  /**
   * Toggles the turnstile auto-brightness boost
   */
  async toggleBrightnessBoost(enabled?: boolean): Promise<boolean> {
    return operatorDatabase.toggleBrightnessBoost(enabled);
  },

  /**
   * Triggers hardware scanner re-pairing
   */
  async reconnectScanner(): Promise<{ connected: boolean; device: string }> {
    return operatorDatabase.reconnectScanner();
  },

  /**
   * Synchronizes the air-gap verification token cache
   */
  async syncAirGapCache(): Promise<{ synced: boolean; tokenCount: number }> {
    return operatorDatabase.syncAirGapCache();
  },

  /**
   * Submits a vehicle maintenance/fault report to transit dispatch
   */
  async reportVehicleFault(payload: {
    category: MaintenanceFaultReport['category'];
    severity: MaintenanceFaultReport['severity'];
    description: string;
    busNumber?: string;
    routeNumber?: string;
  }): Promise<MaintenanceFaultReport> {
    return operatorDatabase.reportVehicleFault(payload);
  },

  /**
   * Retrieves logged vehicle fault reports
   */
  async getFaultReports(): Promise<MaintenanceFaultReport[]> {
    return operatorDatabase.getFaultReports();
  },

  /**
   * Clocks out the operator shift and compiles the finalized summary
   */
  async clockOutShift(): Promise<ShiftSummaryReport> {
    return operatorDatabase.clockOutShift();
  },

  /**
   * Gets the last shift summary report
   */
  async getLastShiftSummary(): Promise<ShiftSummaryReport | null> {
    return operatorDatabase.getLastShiftSummary();
  },

  /**
   * Subscribes to live operator and active duty updates
   */
  subscribeOperatorUpdates(listener: (profile: OperatorProfileData) => void): () => void {
    return operatorDatabase.subscribe(listener);
  },
};
