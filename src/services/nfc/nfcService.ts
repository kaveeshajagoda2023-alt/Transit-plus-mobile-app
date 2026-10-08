import { getRuntimePlatform } from '../utils/platform';

export interface NfcScanResult {
  success: boolean;
  badgeId?: string;
  hardwareDetected: boolean;
  error?: string;
}

class NfcService {
  /**
   * Check if the device / runtime has physical NFC hardware access.
   */
  public hasHardwareSupport(): boolean {
    const platform = getRuntimePlatform();
    if (platform === 'web') {
      // In web browsers, Web NFC is available in Chromium on Android over HTTPS
      if (typeof window !== 'undefined' && 'NDEFReader' in window) {
        return true;
      }
      return false;
    }
    // On native iOS/Android, physical hardware check can be verified
    return false; // Fallback mode active unless dedicated hardware plugin registered
  }

  /**
   * Initiates a physical or simulated NFC badge scan
   */
  public async scanBadge(mockBadgeId?: string): Promise<NfcScanResult> {
    const hasHardware = this.hasHardwareSupport();
    const platform = getRuntimePlatform();

    if (hasHardware && platform === 'web' && typeof window !== 'undefined' && 'NDEFReader' in window) {
      try {
        // @ts-ignore
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        return new Promise((resolve) => {
          ndef.onreading = (event: any) => {
            const serialNumber = event.serialNumber || 'NFC-TAG-MTA';
            resolve({
              success: true,
              badgeId: serialNumber,
              hardwareDetected: true,
            });
          };
          ndef.onreadingerror = () => {
            resolve({
              success: false,
              hardwareDetected: true,
              error: 'Failed to read badge signal. Please hold card closer.',
            });
          };
        });
      } catch (err: any) {
        return {
          success: false,
          hardwareDetected: true,
          error: err?.message || 'NFC permission denied or hardware unavailable.',
        };
      }
    }

    // Platform does not support native NFC: development fallback
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (mockBadgeId) {
      return {
        success: true,
        badgeId: mockBadgeId,
        hardwareDetected: false,
      };
    }

    // Default simulated MTA conductor badge
    return {
      success: true,
      badgeId: 'NFC-COND-55219',
      hardwareDetected: false,
    };
  }
}

export const nfcService = new NfcService();
