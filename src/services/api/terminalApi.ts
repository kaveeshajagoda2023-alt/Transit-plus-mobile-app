import { TerminalStatus, TerminalConnectionStatus } from '@/types/staff';

class TerminalApiService {
  private isSimulatedOffline: boolean = false;
  private currentPingMs: number = 18;
  private currentStatus: TerminalStatus = {
    terminalId: 'TERM-4028-V4',
    vehicleId: 'veh-bus-4028',
    vehicleNumber: 'Bus #4028',
    transitAuthority: 'Metro Transit Authority (MTA)',
    dispatchZone: 'DISPATCH ZONE 4',
    terminalState: 'READY',
    version: 'v4.8.2-ops',
    connectionStatus: 'CONNECTED',
    gpsLock: true,
    pingMs: 18,
    lastHeartbeat: new Date().toISOString(),
  };

  public setSimulatedOffline(offline: boolean) {
    this.isSimulatedOffline = offline;
    this.currentStatus.connectionStatus = offline ? 'OFFLINE' : 'CONNECTED';
  }

  public setOfflineMode(offline: boolean) {
    this.setSimulatedOffline(offline);
  }

  public isOffline(): boolean {
    return this.isSimulatedOffline;
  }

  /**
   * GET /api/terminal/status
   */
  public async getTerminalStatus(): Promise<TerminalStatus> {
    // Realistic micro latency
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (this.isSimulatedOffline) {
      throw new Error('Unable to connect to the TransitPulse server. Check your connection and try again.');
    }

    // Fluctuate ping slightly for realism
    this.currentPingMs = Math.floor(14 + Math.random() * 8);

    this.currentStatus = {
      ...this.currentStatus,
      connectionStatus: 'CONNECTED',
      pingMs: this.currentPingMs,
      lastHeartbeat: new Date().toISOString(),
    };

    return { ...this.currentStatus };
  }

  /**
   * Real-time subscription to terminal heartbeat updates (Websocket simulator)
   */
  public subscribeTerminalStatus(callback: (status: TerminalStatus) => void): () => void {
    const interval = setInterval(async () => {
      try {
        if (!this.isSimulatedOffline) {
          const status = await this.getTerminalStatus();
          callback(status);
        } else {
          callback({
            ...this.currentStatus,
            connectionStatus: 'OFFLINE',
            pingMs: 0,
          });
        }
      } catch {
        callback({
          ...this.currentStatus,
          connectionStatus: 'OFFLINE',
          pingMs: 0,
        });
      }
    }, 12000);

    return () => clearInterval(interval);
  }
}

export const terminalApi = new TerminalApiService();
