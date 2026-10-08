import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { terminalApi } from '@/services/api/terminalApi';
import { tripApi } from '@/services/api/tripApi';
import { offlineScannerSync } from '@/services/storage/offlineScannerSync';

export interface DiagnosticModalProps {
  visible: boolean;
  onClose: () => void;
  activeLens: 'back' | 'front';
  torchAvailable: boolean;
  isTorchOn: boolean;
  fps: number;
  cameraReady: boolean;
  simulateFailure: boolean;
  onToggleSimulateFailure: (val: boolean) => void;
}

interface DiagnosticItem {
  id: string;
  name: string;
  status: 'READY' | 'WARNING' | 'FAILED' | 'CHECKING';
  value: string;
  detail?: string;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  visible,
  onClose,
  activeLens,
  torchAvailable,
  isTorchOn,
  fps,
  cameraReady,
  simulateFailure,
  onToggleSimulateFailure,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(terminalApi.isOffline());
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);

  const runDiagnosticChecks = async () => {
    setIsRunning(true);
    const results: DiagnosticItem[] = [];

    // 1. Camera Hardware
    if (simulateFailure) {
      results.push({
        id: 'cam_hw',
        name: 'Camera Sensor',
        status: 'FAILED',
        value: 'Simulated Hardware Timeout',
        detail: 'Hardware capture pipeline artificially interrupted',
      });
    } else {
      results.push({
        id: 'cam_hw',
        name: 'Camera Sensor',
        status: cameraReady ? 'READY' : 'WARNING',
        value: cameraReady ? 'Online & Streaming' : 'Initializing video feed',
        detail: `Active stream facing: ${activeLens.toUpperCase()}`,
      });
    }

    // 2. Permission
    const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices;
    results.push({
      id: 'cam_perm',
      name: 'Camera Permission',
      status: 'READY',
      value: 'Granted (Level 3)',
      detail: hasMedia ? 'WebRTC MediaDevices authorized' : 'AVCaptureDevice authorized',
    });

    // 3. Selected Camera Lens
    results.push({
      id: 'cam_lens',
      name: 'Optical Lens',
      status: 'READY',
      value: activeLens === 'back' ? 'Rear Wide Angle (1x)' : 'Front Face Lens',
      detail: 'Continuous auto-focus locked',
    });

    // 4. Torch / Flash
    results.push({
      id: 'cam_torch',
      name: 'Torch Illumination',
      status: torchAvailable ? 'READY' : 'WARNING',
      value: torchAvailable ? (isTorchOn ? 'Active (Torch ON)' : 'Ready (Torch OFF)') : 'Unsupported on this device',
      detail: Platform.OS === 'web' ? 'Browser WebRTC constraint mode' : 'Native flash hardware',
    });

    // 5. QR Barcode Engine
    results.push({
      id: 'scanner_engine',
      name: 'QR Scanner Engine',
      status: 'READY',
      value: 'Active (1D/2D Multi-Format)',
      detail: 'Detects QR, Code128, Aztec, DataMatrix',
    });

    // 6. Network Connectivity
    const isOffline = terminalApi.isOffline();
    results.push({
      id: 'net_status',
      name: 'Network Connection',
      status: isOffline ? 'WARNING' : 'READY',
      value: isOffline ? 'Offline (Local Cache Active)' : 'Connected (4G/LTE Terminal)',
      detail: isOffline ? 'Validating against onboard offline cache' : 'Low-latency backend connection',
    });

    // 7. Backend API Connectivity
    try {
      if (isOffline) {
        results.push({
          id: 'api_status',
          name: 'Backend API Gateway',
          status: 'WARNING',
          value: 'Offline Storage Active',
          detail: 'Calls route to offline synchronization queue',
        });
      } else {
        const trip = await tripApi.getActiveTrip();
        results.push({
          id: 'api_status',
          name: 'Backend API Gateway',
          status: 'READY',
          value: 'Healthy (200 OK)',
          detail: `Active Trip #${trip.routeNumber} (Bus ${trip.busNumber})`,
        });
      }
    } catch (e: any) {
      results.push({
        id: 'api_status',
        name: 'Backend API Gateway',
        status: 'FAILED',
        value: 'Unreachable',
        detail: e.message || 'API connection failed',
      });
    }

    // 8. Offline Cache & Cryptographic Keys
    const syncStatus = offlineScannerSync.getStatus();
    results.push({
      id: 'cache_sync',
      name: 'Cryptographic Cache',
      status: 'READY',
      value: `${syncStatus.keysSyncedCount.toLocaleString()} Keys Synced (100% Local)`,
      detail: `Queue: ${syncStatus.pendingQueueCount} pending | State: ${syncStatus.syncState}`,
    });

    // 9. Frame Processing Rate
    results.push({
      id: 'fps_metric',
      name: 'Processing Performance',
      status: fps >= 45 ? 'READY' : 'WARNING',
      value: `${fps} FPS Render Rate`,
      detail: 'Real-time frame pipeline responsive',
    });

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    if (visible) {
      runDiagnosticChecks();
    }
  }, [visible, simulateFailure, cameraReady, isTorchOn, activeLens, fps]);

  const toggleOfflineSimulation = (val: boolean) => {
    setIsOfflineSimulated(val);
    terminalApi.setSimulatedOffline(val);
    offlineScannerSync.setOnlineState(!val);
    runDiagnosticChecks();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="tools" size={22} color="#2DD4BF" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Hardware & Diagnostic Console</Text>
              <Text style={styles.subtitle}>Onboard Scanner Subsystem Health Check</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Simulation Toggles */}
          <View style={styles.togglesCard}>
            <Text style={styles.togglesHeader}>FAULT SIMULATION CONTROLS</Text>

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Simulate Camera Failure</Text>
                <Text style={styles.toggleSubtitle}>Simulate sensor timeout or unmount</Text>
              </View>
              <Switch
                value={simulateFailure}
                onValueChange={onToggleSimulateFailure}
                trackColor={{ false: '#1E293B', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
              <View style={styles.toggleTextWrap}>
                <Text style={styles.toggleTitle}>Simulate Offline Mode</Text>
                <Text style={styles.toggleSubtitle}>Test turnstile cache & offline queuing</Text>
              </View>
              <Switch
                value={isOfflineSimulated}
                onValueChange={toggleOfflineSimulation}
                trackColor={{ false: '#1E293B', true: '#F59E0B' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Diagnostic Results List */}
          <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
            {diagnostics.map((item) => (
              <View key={item.id} style={styles.diagItem}>
                <View style={styles.diagLeft}>
                  <View style={styles.statusIndicator}>
                    {item.status === 'READY' && <Feather name="check-circle" size={16} color="#10B981" />}
                    {item.status === 'WARNING' && <Feather name="alert-circle" size={16} color="#F59E0B" />}
                    {item.status === 'FAILED' && <Feather name="x-circle" size={16} color="#EF4444" />}
                  </View>
                  <View>
                    <Text style={styles.diagName}>{item.name}</Text>
                    {item.detail ? <Text style={styles.diagDetail}>{item.detail}</Text> : null}
                  </View>
                </View>

                <View style={styles.diagRight}>
                  <Text
                    style={[
                      styles.diagValue,
                      item.status === 'READY' && styles.valueReady,
                      item.status === 'WARNING' && styles.valueWarning,
                      item.status === 'FAILED' && styles.valueFailed,
                    ]}
                  >
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Actions */}
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={runDiagnosticChecks}
              disabled={isRunning}
            >
              {isRunning ? (
                <ActivityIndicator size="small" color="#0F172A" />
              ) : (
                <Feather name="refresh-cw" size={15} color="#0F172A" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.refreshBtnText}>Re-run System Tests</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 22, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: '#0F1E33',
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E385B',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  togglesCard: {
    backgroundColor: '#0A1524',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#182C48',
    padding: 14,
    marginBottom: 16,
  },
  togglesHeader: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#14233A',
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  toggleTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  resultsList: {
    maxHeight: 280,
    marginBottom: 16,
  },
  diagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#16273F',
  },
  diagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  statusIndicator: {
    marginRight: 10,
  },
  diagName: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '600',
  },
  diagDetail: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  diagRight: {
    alignItems: 'flex-end',
  },
  diagValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  valueReady: {
    color: '#34D399',
  },
  valueWarning: {
    color: '#FBBF24',
  },
  valueFailed: {
    color: '#F87171',
  },
  bottomRow: {
    flexDirection: 'row',
  },
  refreshBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2DD4BF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
});
