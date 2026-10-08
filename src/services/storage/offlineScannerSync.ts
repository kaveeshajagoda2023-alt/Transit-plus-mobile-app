import { TicketActivityItem } from '@/types/trip';

export interface QueuedOfflineScan {
  id: string;
  ticketId: string;
  method: 'QR' | 'NFC' | 'MANUAL';
  scannedAt: number;
  offlineStatus: 'PENDING' | 'SYNCED' | 'CONFLICT';
  operatorId: string;
  deviceId: string;
}

export interface OfflineSyncStatus {
  isOnline: boolean;
  keysSyncedCount: number;
  pendingQueueCount: number;
  syncState: 'SYNCED' | 'SYNCING' | 'OFFLINE_QUEUED';
  lastSyncTime: string;
}

class OfflineScannerSyncService {
  private queuedScans: QueuedOfflineScan[] = [];
  private keysSyncedCount: number = 1240;
  private isOnline: boolean = true;
  private syncListeners: Set<(status: OfflineSyncStatus) => void> = new Set();

  public getStatus(): OfflineSyncStatus {
    return {
      isOnline: this.isOnline,
      keysSyncedCount: this.keysSyncedCount,
      pendingQueueCount: this.queuedScans.filter((s) => s.offlineStatus === 'PENDING').length,
      syncState: !this.isOnline
        ? 'OFFLINE_QUEUED'
        : this.queuedScans.some((s) => s.offlineStatus === 'PENDING')
        ? 'SYNCING'
        : 'SYNCED',
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  public setOnlineState(online: boolean) {
    this.isOnline = online;
    if (online && this.queuedScans.some((s) => s.offlineStatus === 'PENDING')) {
      this.syncQueuedScans();
    } else {
      this.notify();
    }
  }

  public queueScan(
    ticketId: string,
    method: 'QR' | 'NFC' | 'MANUAL' = 'QR',
    operatorId: string = 'DRV-84920'
  ): QueuedOfflineScan {
    const item: QueuedOfflineScan = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ticketId,
      method,
      scannedAt: Date.now(),
      offlineStatus: 'PENDING',
      operatorId,
      deviceId: 'TERM-4028-V4',
    };
    this.queuedScans.unshift(item);
    this.notify();
    return item;
  }

  public async syncQueuedScans(): Promise<{ syncedCount: number }> {
    let synced = 0;
    for (const scan of this.queuedScans) {
      if (scan.offlineStatus === 'PENDING') {
        scan.offlineStatus = 'SYNCED';
        synced++;
      }
    }
    this.keysSyncedCount += synced;
    this.notify();
    return { syncedCount: synced };
  }

  public subscribe(listener: (status: OfflineSyncStatus) => void): () => void {
    this.syncListeners.add(listener);
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  private notify() {
    const st = this.getStatus();
    for (const fn of this.syncListeners) {
      fn(st);
    }
  }
}

export const offlineScannerSync = new OfflineScannerSyncService();
