import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { UniversalCameraFeed } from '@/components/scanner/UniversalCameraFeed';
import { ManualTicketModal } from '@/components/scanner/ManualTicketModal';
import { ValidationResultCard } from '@/components/scanner/ValidationResultCard';
import { DiagnosticModal } from '@/components/scanner/DiagnosticModal';

import { tripApi } from '@/services/api/tripApi';
import { terminalApi } from '@/services/api/terminalApi';
import { offlineScannerSync, OfflineSyncStatus } from '@/services/storage/offlineScannerSync';
import { scannerAudio } from '@/services/utils/scannerAudio';
import { ScanValidationResponse } from '@/types/trip';

interface TicketScannerScreenProps {
  onClose?: () => void;
  activeTripNumber?: string;
}

export function TicketScannerScreen({
  onClose,
  activeTripNumber = '42',
}: TicketScannerScreenProps) {
  // Camera & Device Controls
  const [activeLens, setActiveLens] = useState<'back' | 'front'>('back');
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [torchSupported, setTorchSupported] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(scannerAudio.isMuted());
  const [fps, setFps] = useState<number>(60);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);

  // Scanning & Validation State
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ScanValidationResponse | null>(null);
  const [isOfflineScan, setIsOfflineScan] = useState<boolean>(false);

  // Modals
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(false);

  // Offline Sync State
  const [syncStatus, setSyncStatus] = useState<OfflineSyncStatus>(offlineScannerSync.getStatus());

  // Laser Scan Animation
  const laserAnim = useRef(new Animated.Value(0)).current;
  const recentScannedMapRef = useRef<Map<string, number>>(new Map());

  // Start animated scanning laser
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [laserAnim]);

  // Subscribe to offline sync updates
  useEffect(() => {
    const unsub = offlineScannerSync.subscribe((st) => {
      setSyncStatus(st);
    });
    return unsub;
  }, []);

  // Handle Close / Exit
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/staff/dashboard' as any);
    }
  };

  // Toggle Sound Chime
  const handleToggleSound = () => {
    const newMuted = scannerAudio.toggleMute();
    setIsMuted(newMuted);
  };

  // Toggle Torch
  const handleToggleTorch = () => {
    setIsTorchOn((prev) => !prev);
  };

  // Toggle Lens
  const handleToggleLens = () => {
    setActiveLens((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  // Core Ticket Validation (QR or Manual Entry)
  const processTicketCode = useCallback(
    async (rawCode: string, method: 'QR' | 'NFC' | 'MANUAL' = 'QR') => {
      const code = rawCode.trim().toUpperCase();
      if (!code || isValidating) return;

      // Duplicate scan debounce guard (within 2 seconds for exact same code)
      const lastScannedTime = recentScannedMapRef.current.get(code) || 0;
      const now = Date.now();
      if (now - lastScannedTime < 2500 && validationResult?.ticketId === code) {
        return;
      }
      recentScannedMapRef.current.set(code, now);

      setIsValidating(true);
      setLastScannedCode(code);

      try {
        if (terminalApi.isOffline()) {
          // Offline Validation Mode: validate against cached local database
          offlineScannerSync.queueScan(code, method === 'MANUAL' ? 'MANUAL' : 'QR');
          setIsOfflineScan(true);

          // Simulated onboard cryptographic validation check
          const isKnownValid = ['TK-9021', 'TK-9044', 'TK-9018', 'TK-9055'].includes(code);
          const isKnownUsed = code === 'TK-7740';
          const isKnownExpired = code === 'TK-8832';

          if (isKnownValid) {
            scannerAudio.playSuccessTone();
            setValidationResult({
              valid: true,
              result: 'PASS',
              ticketId: code,
              ticketTypeLabel: code === 'TK-9018' ? 'Concession Pass' : 'Standard Single',
              fareAmount: code === 'TK-9018' ? 35 : 65,
              passengerName: 'Offline Cardholder',
              activityItem: {
                id: `act-off-${now}`,
                ticketId: code,
                ticketTypeLabel: 'Offline Validated Pass',
                eventText: 'Boarded via Turnstile Cache',
                result: 'PASS',
                timestamp: now,
                fareAmount: 65,
                method: method === 'MANUAL' ? 'CASH' : 'QR',
              },
              updatedTrip: tripApi.getActiveTrip() as any,
            });
          } else if (isKnownUsed) {
            scannerAudio.playRejectTone();
            setValidationResult({
              valid: false,
              result: 'REJECT',
              reason: 'Ticket already redeemed earlier on this vehicle.',
              ticketId: code,
              ticketTypeLabel: 'Duplicate Token',
              fareAmount: 0,
              activityItem: {
                id: `act-off-${now}`,
                ticketId: code,
                ticketTypeLabel: 'Already Redeemed',
                eventText: 'Rejected offline',
                result: 'REJECT',
                timestamp: now,
                fareAmount: 0,
                method: 'QR',
              },
              updatedTrip: tripApi.getActiveTrip() as any,
            });
          } else {
            scannerAudio.playRejectTone();
            setValidationResult({
              valid: false,
              result: 'REJECT',
              reason: isKnownExpired
                ? 'Ticket expired. Passenger must purchase new fare.'
                : 'Ticket code not found in offline cryptographic store.',
              ticketId: code,
              ticketTypeLabel: isKnownExpired ? 'Expired Pass' : 'Invalid Code',
              fareAmount: 0,
              activityItem: {
                id: `act-off-${now}`,
                ticketId: code,
                ticketTypeLabel: 'Invalid Code',
                eventText: 'Rejected offline',
                result: 'REJECT',
                timestamp: now,
                fareAmount: 0,
                method: 'QR',
              },
              updatedTrip: tripApi.getActiveTrip() as any,
            });
          }
        } else {
          // Online Validation: Live call to backend API
          setIsOfflineScan(false);
          const response = await tripApi.validateTicket(code, method === 'MANUAL' ? 'QR' : method);

          if (response.valid && response.result === 'PASS') {
            scannerAudio.playSuccessTone();
            setValidationResult(response);
            setTimeout(() => {
              router.push({
                pathname: '/staff/ticket-success' as any,
                params: {
                  ticketId: response.ticketId,
                  ticketType: response.ticketTypeLabel,
                  passenger: response.passengerName || 'Dilshan Silva',
                  fare: String(response.fareAmount),
                  bookingRef: response.bookingReference || 'MTA-BK-90214',
                  origin: response.originStop || 'Market St & 4th',
                  destination: response.destinationStop || 'University Malabe Campus',
                },
              });
            }, 400);
          } else {
            scannerAudio.playRejectTone();
            setValidationResult(response);
            setTimeout(() => {
              router.push({
                pathname: '/staff/ticket-error' as any,
                params: {
                  ticketId: response.ticketId,
                  reason: response.reason || 'Ticket not valid',
                  faultCode: response.faultCode || '0x01',
                },
              });
            }, 500);
          }
        }
      } catch (err: any) {
        scannerAudio.playRejectTone();
        setValidationResult({
          valid: false,
          result: 'REJECT',
          reason: err.message || 'Unable to connect to validation server',
          ticketId: code,
          ticketTypeLabel: 'Network Error',
          fareAmount: 0,
          activityItem: {
            id: `err-${now}`,
            ticketId: code,
            ticketTypeLabel: 'Network Error',
            eventText: 'Validation failed',
            result: 'REJECT',
            timestamp: now,
            fareAmount: 0,
            method: 'QR',
          },
          updatedTrip: tripApi.getActiveTrip() as any,
        });
      } finally {
        setIsValidating(false);
      }
    },
    [isValidating, validationResult]
  );

  // Resume continuous scanning
  const handleDismissResult = () => {
    setValidationResult(null);
  };

  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 240],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* 1. TOP HEADER BAR */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={handleClose}
          accessibilityLabel="Close ticket scanner"
        >
          <Feather name="x" size={20} color="#CBD5E1" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Ticket Scanner • Active Trip #{activeTripNumber}
          </Text>
          <View style={styles.headerSubRow}>
            <View style={styles.tealDot} />
            <Text style={styles.headerSubtitle}>Rapid Turnstile Validation</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={handleToggleSound}
          accessibilityLabel={isMuted ? 'Unmute scanner chime' : 'Mute scanner chime'}
        >
          <Ionicons
            name={isMuted ? 'volume-mute-outline' : 'volume-high-outline'}
            size={20}
            color={isMuted ? '#64748B' : '#2DD4BF'}
          />
        </TouchableOpacity>
      </View>

      {/* 2. OFFLINE CACHE BANNER */}
      <TouchableOpacity
        style={styles.cacheBanner}
        activeOpacity={0.8}
        onPress={() => setShowDiagnosticModal(true)}
      >
        <View style={styles.cacheBannerLeft}>
          <MaterialCommunityIcons name="database-sync-outline" size={18} color="#2DD4BF" />
          <Text style={styles.cacheBannerText}>
            Offline Cache Active • {syncStatus.keysSyncedCount.toLocaleString()} Keys Synced
          </Text>
        </View>
        <View style={styles.cacheBadge}>
          <Text style={styles.cacheBadgePercent}>100%</Text>
          <Text style={styles.cacheBadgeLabel}>Local</Text>
        </View>
      </TouchableOpacity>

      {/* 3. MAIN SCANNER VIEWFINDER SECTION */}
      <View style={styles.viewfinderContainer}>
        {/* The Viewfinder Box */}
        <View style={styles.viewfinderFrame}>
          {/* Universal Live Camera Stream */}
          <UniversalCameraFeed
            facing={activeLens}
            torch={isTorchOn}
            paused={isValidating || !!validationResult}
            simulateFailure={simulateFailure}
            onBarcodeScanned={(code) => processTicketCode(code, 'QR')}
            onFpsUpdate={(newFps) => setFps(newFps)}
            onReady={() => setCameraReady(true)}
            onError={(msg) => {
              setCameraReady(false);
            }}
            onRequestManualInput={() => setShowManualModal(true)}
          />

          {/* Viewfinder Grid Overlay */}
          <View style={styles.gridOverlay}>
            <View style={styles.gridLineH} />
            <View style={styles.gridLineH2} />
            <View style={styles.gridLineV} />
            <View style={styles.gridLineV2} />
          </View>

          {/* 4 Neon Cyan Glowing Corner Brackets */}
          <View style={[styles.cornerBracket, styles.cornerTL]} />
          <View style={[styles.cornerBracket, styles.cornerTR]} />
          <View style={[styles.cornerBracket, styles.cornerBL]} />
          <View style={[styles.cornerBracket, styles.cornerBR]} />

          {/* Central Targeting Reticle */}
          <View style={styles.centerReticle}>
            <View style={styles.reticleCrosshairs}>
              <View style={styles.reticleBracketLeft} />
              <View style={styles.reticleBracketRight} />
            </View>
          </View>

          {/* Animated Horizontal Laser Scan Line */}
          {!validationResult && !simulateFailure && (
            <Animated.View
              style={[
                styles.laserLine,
                { transform: [{ translateY: laserTranslateY }] },
              ]}
            >
              <View style={styles.laserBeam} />
            </Animated.View>
          )}

          {/* Validating Spinner Overlay */}
          {isValidating && (
            <View style={styles.validatingOverlay}>
              <View style={styles.validatingPill}>
                <MaterialCommunityIcons name="radar" size={20} color="#2DD4BF" />
                <Text style={styles.validatingText}>Verifying Ticket Cryptography...</Text>
              </View>
            </View>
          )}
        </View>

        {/* Viewfinder Instruction Tooltip */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>
            Place passenger's digital QR or{'\n'}Apple/Google Wallet pass inside frame
          </Text>
        </View>

        {/* Auto-focus & Continuous Read Status */}
        <View style={styles.autofocusRow}>
          <MaterialCommunityIcons name="target" size={15} color="#2DD4BF" style={{ marginRight: 6 }} />
          <Text style={styles.autofocusText}>Auto-focus locked • Continuous read</Text>
        </View>
      </View>

      {/* 4. VALIDATION RESULT FLOATING CARD */}
      {validationResult && (
        <View style={styles.resultCardWrapper}>
          <ValidationResultCard
            response={validationResult}
            onDismiss={handleDismissResult}
            onEnterManual={() => {
              setValidationResult(null);
              router.push('/staff/manual-entry' as any);
            }}
            isOfflineQueued={isOfflineScan}
          />
        </View>
      )}

      {/* 5. PRIMARY BUTTON: ENTER TICKET CODE MANUALLY */}
      <View style={styles.controlsSection}>
        <TouchableOpacity
          style={styles.manualEntryButton}
          activeOpacity={0.85}
          onPress={() => router.push('/staff/manual-entry' as any)}
          accessibilityRole="button"
          accessibilityLabel="Enter Ticket Code Manually"
        >
          <MaterialCommunityIcons
            name="credit-card-scan-outline"
            size={20}
            color="#0F172A"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.manualEntryButtonText}>Enter Ticket Code Manually</Text>
        </TouchableOpacity>

        {/* 6. CAMERA SECONDARY CONTROLS (FLASH & LENS) */}
        <View style={styles.cameraControlsRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, isTorchOn && styles.secondaryButtonActive]}
            onPress={handleToggleTorch}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isTorchOn ? 'Flash On' : 'Flash Off'}
          >
            <MaterialCommunityIcons
              name={isTorchOn ? 'flashlight' : 'flashlight-off'}
              size={18}
              color={isTorchOn ? '#2DD4BF' : '#CBD5E1'}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.secondaryButtonText, isTorchOn && styles.secondaryButtonTextActive]}>
              {isTorchOn ? 'Flash On' : 'Flash Off'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleToggleLens}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={activeLens === 'back' ? 'Back Lens' : 'Front Lens'}
          >
            <MaterialCommunityIcons
              name="camera-flip-outline"
              size={18}
              color="#CBD5E1"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.secondaryButtonText}>
              {activeLens === 'back' ? 'Back Lens' : 'Front Lens'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7. DIAGNOSTIC STATUS & HARDWARE INFO CARD */}
        <View style={styles.diagnosticCard}>
          <View style={styles.diagCardTop}>
            <View style={styles.diagPermissionRow}>
              <Feather name="check-circle" size={14} color="#2DD4BF" style={{ marginRight: 6 }} />
              <Text style={styles.diagPermissionText}>
                Permission active • Auto-detecting 1D/2D
              </Text>
            </View>
            <View style={styles.fpsBadge}>
              <View style={styles.fpsDot} />
              <Text style={styles.fpsText}>{fps} FPS</Text>
            </View>
          </View>

          <View style={styles.diagCardBottom}>
            <Text style={styles.diagLabel}>Diagnostic Test Mode:</Text>
            <TouchableOpacity
              onPress={() => setSimulateFailure((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Text style={styles.diagLink}>
                {simulateFailure ? 'Restore Camera Stream' : 'Simulate Camera Failure'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* MODALS */}
      <ManualTicketModal
        visible={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSubmit={async (code) => {
          setShowManualModal(false);
          await processTicketCode(code, 'MANUAL');
        }}
        isValidating={isValidating}
      />

      <DiagnosticModal
        visible={showDiagnosticModal}
        onClose={() => setShowDiagnosticModal(false)}
        activeLens={activeLens}
        torchAvailable={torchSupported}
        isTorchOn={isTorchOn}
        fps={fps}
        cameraReady={cameraReady}
        simulateFailure={simulateFailure}
        onToggleSimulateFailure={(val) => setSimulateFailure(val)}
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const VIEWFINDER_SIZE = Math.min(width - 56, 300);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#071220',
  },
  // Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#122238',
    borderWidth: 1,
    borderColor: '#1C3554',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  tealDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2DD4BF',
    marginRight: 6,
  },
  headerSubtitle: {
    color: '#2DD4BF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Cache Banner
  cacheBanner: {
    marginHorizontal: 18,
    marginTop: 6,
    marginBottom: 10,
    backgroundColor: '#0D233C',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#17365C',
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cacheBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cacheBannerText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  cacheBadge: {
    backgroundColor: '#072F4F',
    borderWidth: 1,
    borderColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  cacheBadgePercent: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  cacheBadgeLabel: {
    color: '#7DD3FC',
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 11,
  },

  // Viewfinder
  viewfinderContainer: {
    alignItems: 'center',
    marginTop: 8,
    flex: 1,
    justifyContent: 'center',
  },
  viewfinderFrame: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    backgroundColor: '#0B1A2C',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  gridLineH: {
    position: 'absolute',
    top: '33.3%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
  },
  gridLineH2: {
    position: 'absolute',
    top: '66.6%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
  },
  gridLineV: {
    position: 'absolute',
    left: '33.3%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
  },
  gridLineV2: {
    position: 'absolute',
    left: '66.6%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
  },

  // 4 Glowing Neon Brackets
  cornerBracket: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderColor: '#2DD4BF',
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 10,
  },

  // Center Reticle
  centerReticle: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  reticleCrosshairs: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  reticleBracketLeft: {
    width: 8,
    height: 16,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: '#2DD4BF',
    marginRight: 6,
  },
  reticleBracketRight: {
    width: 8,
    height: 16,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#2DD4BF',
    marginLeft: 6,
  },

  // Animated Laser Line
  laserLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  laserBeam: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#2DD4BF',
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    borderRadius: 2,
  },

  // Validating Overlay
  validatingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 18, 32, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  validatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2642',
    borderWidth: 1,
    borderColor: '#2DD4BF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  validatingText: {
    color: '#2DD4BF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Instruction Card
  instructionCard: {
    marginTop: 14,
    backgroundColor: '#0F253E',
    borderWidth: 1,
    borderColor: '#193C63',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  instructionText: {
    color: '#E2E8F0',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 17,
  },
  autofocusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  autofocusText: {
    color: '#2DD4BF',
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Result Card Wrapper
  resultCardWrapper: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    zIndex: 50,
  },

  // Bottom Controls
  controlsSection: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  manualEntryButton: {
    backgroundColor: '#6EE7B7',
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#6EE7B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  manualEntryButtonText: {
    color: '#0F172A',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cameraControlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 46,
    backgroundColor: '#122238',
    borderWidth: 1,
    borderColor: '#1B3556',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonActive: {
    borderColor: '#2DD4BF',
    backgroundColor: '#0C2D3A',
  },
  secondaryButtonText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryButtonTextActive: {
    color: '#2DD4BF',
  },

  // Diagnostic Card
  diagnosticCard: {
    backgroundColor: '#0A1A2C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#162C46',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  diagCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  diagPermissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diagPermissionText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '500',
  },
  fpsBadge: {
    backgroundColor: '#083344',
    borderWidth: 1,
    borderColor: '#0E7490',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  fpsDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#22D3EE',
  },
  fpsText: {
    color: '#22D3EE',
    fontSize: 10.5,
    fontWeight: '800',
  },
  diagCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#12243A',
  },
  diagLabel: {
    color: '#64748B',
    fontSize: 11.5,
  },
  diagLink: {
    color: '#2DD4BF',
    fontSize: 11.5,
    fontWeight: '600',
  },
});
