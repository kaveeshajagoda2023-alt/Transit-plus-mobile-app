import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { DashboardBottomNav, DashboardTab } from '@/components/dashboard/DashboardBottomNav';
import { operatorApi } from '@/services/api/operatorApi';
import { terminalApi } from '@/services/api/terminalApi';
import { useStaffAuth } from '@/context/StaffAuthContext';
import {
  OperatorProfileData,
  OperatorCertification,
  MaintenanceFaultReport,
  ShiftSummaryReport,
} from '@/types/staff';

interface OperatorProfileScreenProps {
  onBack?: () => void;
  embedded?: boolean;
}

export function OperatorProfileScreen({
  onBack,
  embedded = false,
}: OperatorProfileScreenProps) {
  const { user, logout } = useStaffAuth();

  const [profile, setProfile] = useState<OperatorProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [syncingCache, setSyncingCache] = useState<boolean>(false);
  const [repairingScanner, setRepairingScanner] = useState<boolean>(false);

  // Real-time dynamic shift duration (ticks every minute)
  const [currentTimeEpoch, setCurrentTimeEpoch] = useState<number>(Date.now());

  // Modals
  const [showFaultModal, setShowFaultModal] = useState<boolean>(false);
  const [showClockOutModal, setShowClockOutModal] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showSwitchVehicleModal, setShowSwitchVehicleModal] = useState<boolean>(false);
  const [showRosterModal, setShowRosterModal] = useState<boolean>(false);
  const [selectedCert, setSelectedCert] = useState<OperatorCertification | null>(null);
  const [shiftSummaryResult, setShiftSummaryResult] = useState<ShiftSummaryReport | null>(null);

  // Fault Reporting Form State
  const [faultCategory, setFaultCategory] = useState<MaintenanceFaultReport['category']>('Doors & Ramp');
  const [faultSeverity, setFaultSeverity] = useState<MaintenanceFaultReport['severity']>('MEDIUM');
  const [faultDescription, setFaultDescription] = useState<string>('');
  const [submittingFault, setSubmittingFault] = useState<boolean>(false);

  // Pulse animation for Live US07 Feed beacon
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Load profile & subscribe to real-time updates
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const initialProfile = await operatorApi.getProfile();
        if (mounted) {
          setProfile(initialProfile);
          setIsOffline(terminalApi.isOffline());
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    // Subscribe to live profile changes
    const unsub = operatorApi.subscribeOperatorUpdates((updated) => {
      if (mounted) {
        setProfile(updated);
      }
    });

    // 60-second operational clock timer for shift math
    const clockInterval = setInterval(() => {
      setCurrentTimeEpoch(Date.now());
    }, 60000);

    return () => {
      mounted = false;
      unsub();
      clearInterval(clockInterval);
    };
  }, []);

  // Dynamic Shift Timing Calculations
  const shiftMetrics = useMemo(() => {
    if (!profile) {
      return { elapsedStr: '5h 12m elapsed', remainingStr: '4h 18m', progressPct: 55 };
    }

    const start = profile.shiftStartEpoch;
    const end = profile.shiftEndEpoch;
    const totalDurationMins = Math.max(1, Math.floor((end - start) / 60000));
    const elapsedMins = Math.max(0, Math.floor((currentTimeEpoch - start) / 60000));
    const remainingMins = Math.max(0, Math.floor((end - currentTimeEpoch) / 60000));

    const elapsedHours = Math.floor(elapsedMins / 60);
    const elapsedRemainder = elapsedMins % 60;
    const elapsedStr = `${elapsedHours}h ${elapsedRemainder < 10 ? '0' : ''}${elapsedRemainder}m elapsed`;

    const remainingHours = Math.floor(remainingMins / 60);
    const remainingRemainder = remainingMins % 60;
    const remainingStr = `${remainingHours}h ${remainingRemainder < 10 ? '0' : ''}${remainingRemainder}m`;

    const progressPct = Math.min(100, Math.max(0, Math.round((elapsedMins / totalDurationMins) * 100)));

    return { elapsedStr, remainingStr, progressPct };
  }, [profile, currentTimeEpoch]);

  // Bottom Nav switcher
  const handleSelectTab = (tab: DashboardTab) => {
    if (tab === 'dashboard') {
      router.replace('/staff/dashboard' as any);
    } else if (tab === 'scanner') {
      router.replace('/staff/scanner' as any);
    } else if (tab === 'passengers') {
      router.replace('/staff/passengers' as any);
    } else if (tab === 'activity') {
      router.replace('/staff/dashboard' as any);
    } else if (tab === 'profile') {
      // Already on profile
    }
  };

  // Sync Air-Gap Cache
  const handleSyncCache = async () => {
    if (syncingCache) return;
    setSyncingCache(true);
    try {
      const res = await operatorApi.syncAirGapCache();
      Alert.alert('Cache Synchronized', `Cryptographic tokens validated. Total tokens cached: ${res.tokenCount}`);
    } catch {
      Alert.alert('Sync Glitch', 'Unable to reach sync bridge.');
    } finally {
      setSyncingCache(false);
    }
  };

  // Hardware Optical Scanner Re-pair
  const handleRepairScanner = async () => {
    if (repairingScanner) return;
    setRepairingScanner(true);
    try {
      const res = await operatorApi.reconnectScanner();
      Alert.alert('Scanner Linked', `Hardware optical sensor ${res.device} re-synchronized.`);
    } catch {
      Alert.alert('Pairing Error', 'Unable to establish USB/Bluetooth interface.');
    } finally {
      setRepairingScanner(false);
    }
  };

  // Toggle Beep
  const handleToggleBeep = async (val: boolean) => {
    await operatorApi.toggleScannerBeep(val);
  };

  // Toggle Brightness
  const handleToggleBrightness = async (val: boolean) => {
    await operatorApi.toggleBrightnessBoost(val);
  };

  // Vehicle Switch Confirmation
  const handleConfirmSwitchVehicle = async (busNumber: string, fleetType: string) => {
    await operatorApi.switchVehicle(busNumber, fleetType);
    setShowSwitchVehicleModal(false);
    Alert.alert('Vehicle Assignment Updated', `Now assigned to ${busNumber} (${fleetType}). Telemetry updated.`);
  };

  // Fault Submission
  const handleSubmitFault = async () => {
    if (!faultDescription.trim()) {
      Alert.alert('Missing Detail', 'Please provide a brief description of the vehicle issue.');
      return;
    }
    setSubmittingFault(true);
    try {
      const res = await operatorApi.reportVehicleFault({
        category: faultCategory,
        severity: faultSeverity,
        description: faultDescription.trim(),
        busNumber: profile?.assignedFleet,
        routeNumber: profile?.activeRoute,
      });
      setSubmittingFault(false);
      setShowFaultModal(false);
      setFaultDescription('');
      Alert.alert(
        'Fault Logged to Dispatch',
        `Maintenance Ticket #${res.id} recorded for ${res.busNumber}. Category: ${res.category} (${res.severity} Priority).`
      );
    } catch {
      setSubmittingFault(false);
      Alert.alert('Error', 'Unable to transmit maintenance report.');
    }
  };

  // Clock Out & Complete Shift
  const handleClockOutShift = async () => {
    try {
      const summary = await operatorApi.clockOutShift();
      setShiftSummaryResult(summary);
      setShowClockOutModal(false);
      Alert.alert(
        'Shift Concluded',
        `Duty finalized for ${summary.operatorName}. Shift Duration: ${summary.shiftDuration}. Total Boardings: ${summary.boardingsTotal}.`,
        [{ text: 'OK' }]
      );
    } catch {
      Alert.alert('Error', 'Unable to clock out active shift.');
    }
  };

  // Log Out / Exit Terminal
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const executeSignOut = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
    } catch (err) {
      console.warn('Staff logout warning:', err);
    }
    router.replace('/staff/login' as any);
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#0F2942" />
          <Text style={styles.loadingText}>Loading Operator Profile & Duty Assignment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const RootContainer = embedded ? View : SafeAreaView;
  const rootContainerProps = embedded
    ? { style: { flex: 1, backgroundColor: '#F8FAFC' } }
    : { style: styles.safeArea, edges: ['top', 'left', 'right'] as const };

  return (
    <RootContainer {...rootContainerProps}>
      <StatusBar style="dark" />

      {/* 1. TOP HEADER */}
      {!embedded && (
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.busTerminalIconBox}>
              <MaterialCommunityIcons name="bus-clock" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>TransitOps • Bus</Text>
              <Text style={styles.headerSubtitle}>{profile.assignedFleet}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.onlinePill, isOffline && styles.offlinePill]}
              onPress={handleSyncCache}
              activeOpacity={0.8}
            >
              <View style={[styles.statusDot, isOffline && styles.statusDotRed]} />
              <Text style={[styles.onlinePillText, isOffline && styles.offlinePillText]}>
                {isOffline ? 'Offline - Unsynced' : 'Online - Synced'}
              </Text>
              {syncingCache ? (
                <ActivityIndicator size="small" color="#0F766E" style={{ marginLeft: 4 }} />
              ) : (
                <Ionicons name="sync" size={13} color={isOffline ? '#DC2626' : '#0F766E'} style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.powerButton} onPress={handleLogout} activeOpacity={0.7}>
              <Feather name="power" size={19} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. OPERATOR PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            {/* Operator Avatar with MTA Corner Badge */}
            <View style={styles.avatarWrapper}>
              <Image
                source={require('../../assets/images/kavithusan_operator.jpg')}
                style={styles.avatarImg}
                resizeMode="cover"
              />
              <View style={styles.mtaBadge}>
                <Text style={styles.mtaBadgeText}>MTA</Text>
              </View>
            </View>

            {/* Operator Metadata */}
            <View style={styles.operatorMetaColumn}>
              <View style={styles.depotTagsRow}>
                <View style={styles.drvPill}>
                  <View style={styles.drvDot} />
                  <Text style={styles.drvPillText}>{profile.staffId}</Text>
                </View>
                <View style={styles.depotPill}>
                  <View style={styles.depotDot} />
                  <Text style={styles.depotPillText}>{profile.depot}</Text>
                </View>
              </View>

              <Text style={styles.operatorName}>{profile.name}</Text>

              <View style={styles.roleRow}>
                <MaterialCommunityIcons name="shield-account" size={15} color="#0D9488" style={{ marginRight: 4 }} />
                <Text style={styles.roleText}>{profile.role}</Text>
              </View>
            </View>
          </View>

          {/* Rating & Tier Row */}
          <View style={styles.ratingTierRow}>
            <View style={styles.ratingLeft}>
              <MaterialCommunityIcons name="star" size={16} color="#F59E0B" style={{ marginRight: 4 }} />
              <Text style={styles.ratingNumber}>{profile.rating.toFixed(2)}</Text>
              <Text style={styles.ratingCommendation}>({profile.ratingNote})</Text>
            </View>

            <View style={styles.tierPill}>
              <MaterialCommunityIcons name="shield-check" size={13} color="#0F766E" style={{ marginRight: 3 }} />
              <Text style={styles.tierPillText}>{profile.tier}</Text>
            </View>
          </View>
        </View>

        {/* 3. CURRENT DUTY ASSIGNMENT CARD */}
        <View style={styles.dutyCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="bus" size={18} color="#0F2942" style={{ marginRight: 6 }} />
              <Text style={styles.cardHeaderTitle}>Current Duty Assignment</Text>
            </View>
            <View style={[styles.dutyStatusPill, profile.dutyStatus !== 'ON DUTY' && styles.dutyStatusPillOff]}>
              <Text style={[styles.dutyStatusText, profile.dutyStatus !== 'ON DUTY' && styles.dutyStatusTextOff]}>
                {profile.dutyStatus}
              </Text>
            </View>
          </View>

          {/* 2-Column Route & Fleet Subcards */}
          <View style={styles.subcardsRow}>
            {/* Active Route Subcard */}
            <View style={styles.subcard}>
              <View style={styles.subcardHeader}>
                <Feather name="git-merge" size={12} color="#0284C7" style={{ marginRight: 4 }} />
                <Text style={styles.subcardLabelTeal}>Active Route</Text>
              </View>
              <Text style={styles.subcardTitle}>{profile.activeRoute}</Text>
              <Text style={styles.subcardSubtitle}>{profile.routeDescription}</Text>
            </View>

            {/* Assigned Fleet Subcard */}
            <View style={styles.subcard}>
              <View style={styles.subcardHeader}>
                <MaterialCommunityIcons name="lightning-bolt" size={13} color="#0D9488" style={{ marginRight: 3 }} />
                <Text style={styles.subcardLabelCyan}>Assigned Fleet</Text>
              </View>
              <Text style={styles.subcardTitle}>{profile.assignedFleet}</Text>
              <Text style={styles.subcardSubtitle}>{profile.fleetType}</Text>
            </View>
          </View>

          {/* Shift Timeline & Progress Bar */}
          <View style={styles.shiftProgressSection}>
            <View style={styles.shiftProgressHeaderRow}>
              <Text style={styles.shiftWindowText}>{profile.shiftWindow}</Text>
              <Text style={styles.shiftElapsedText}>{shiftMetrics.elapsedStr}</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${shiftMetrics.progressPct}%` }]} />
            </View>

            <View style={styles.shiftStopsRow}>
              <Text style={styles.shiftStopsText}>Terminal Start: {profile.terminalStart}</Text>
              <Text style={styles.shiftStopsText}>Est. EOD Depot: {profile.estEodDepot}</Text>
            </View>
          </View>

          {/* Action Buttons: Switch Vehicle & View Roster */}
          <View style={styles.dutyActionsRow}>
            <TouchableOpacity
              style={styles.switchVehicleBtn}
              onPress={() => setShowSwitchVehicleModal(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="swap-horizontal" size={17} color="#0D9488" style={{ marginRight: 6 }} />
              <Text style={styles.switchVehicleBtnText}>Switch Vehicle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewRosterBtn}
              onPress={() => setShowRosterModal(true)}
              activeOpacity={0.8}
            >
              <Feather name="calendar" size={15} color="#1E293B" style={{ marginRight: 6 }} />
              <Text style={styles.viewRosterBtnText}>View Shift Roster</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. SHIFT TELEMETRY & BOARDING */}
        <View style={styles.telemetrySection}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="chart-bell-curve" size={18} color="#0F2942" style={{ marginRight: 6 }} />
              <Text style={styles.cardHeaderTitle}>Shift Telemetry & Boarding</Text>
            </View>

            <View style={styles.liveFeedBeacon}>
              <Animated.View style={[styles.beaconDot, { opacity: pulseAnim }]} />
              <Text style={styles.liveFeedText}>❖ {profile.feedStatus}</Text>
            </View>
          </View>

          {/* 2x2 KPI Grid */}
          <View style={styles.kpiGrid}>
            {/* Card 1: Today's Boardings */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiCardHeader}>
                <Text style={styles.kpiLabel}>Today's Boardings</Text>
                <MaterialCommunityIcons name="account-group" size={17} color="#0F2942" />
              </View>
              <Text style={styles.kpiValueLarge}>{profile.todaysBoardings}</Text>
              <Text style={styles.kpiTrendGreen}>↗ +{profile.boardingsTrendPct}% vs avg</Text>
            </View>

            {/* Card 2: Cashless Boarding */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiCardHeader}>
                <Text style={styles.kpiLabel}>Cashless Boarding</Text>
                <MaterialCommunityIcons name="target" size={17} color="#0D9488" />
              </View>
              <Text style={[styles.kpiValueLarge, { color: '#0D9488' }]}>{profile.cashlessBoardingPct}%</Text>
              <Text style={styles.kpiSubGray}>Contactless / QR</Text>
            </View>

            {/* Card 3: Scans Completed */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiCardHeader}>
                <Text style={styles.kpiLabel}>Scans Completed</Text>
                <MaterialCommunityIcons name="qrcode-scan" size={16} color="#0F2942" />
              </View>
              <Text style={styles.kpiValueLarge}>{profile.scansCompleted}</Text>
              <Text style={styles.kpiSubTeal}>{profile.validPassesPct.toFixed(0)}% Valid Passes</Text>
            </View>

            {/* Card 4: On-Time Departure */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiCardHeader}>
                <Text style={styles.kpiLabel}>On-Time Departure</Text>
                <MaterialCommunityIcons name="clock-check-outline" size={17} color="#EA580C" />
              </View>
              <Text style={styles.kpiValueLarge}>{profile.onTimeDeparturePct}%</Text>
              <Text style={styles.kpiSubGray}>{profile.punctualityStatus}</Text>
            </View>
          </View>
        </View>

        {/* 5. OFFICIAL CERTIFICATIONS */}
        <View style={styles.certsCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="certificate" size={18} color="#0F2942" style={{ marginRight: 6 }} />
              <Text style={styles.cardHeaderTitle}>Official Certifications</Text>
            </View>
            <View style={styles.allValidPill}>
              <Text style={styles.allValidText}>All Valid</Text>
            </View>
          </View>

          <View style={styles.certsList}>
            {profile.certifications.map((cert) => (
              <TouchableOpacity
                key={cert.id}
                style={styles.certRow}
                activeOpacity={0.7}
                onPress={() => setSelectedCert(cert)}
              >
                <View style={styles.certIconBox}>
                  {cert.category === 'LICENSE' ? (
                    <MaterialCommunityIcons name="card-account-details-outline" size={18} color="#0D9488" />
                  ) : cert.category === 'SECURITY' ? (
                    <MaterialCommunityIcons name="shield-key-outline" size={18} color="#0284C7" />
                  ) : (
                    <MaterialCommunityIcons name="medical-bag" size={18} color="#EA580C" />
                  )}
                </View>

                <View style={styles.certCenterText}>
                  <Text style={styles.certTitle}>{cert.name}</Text>
                  <Text style={styles.certSubtitle}>{cert.detail}</Text>
                </View>

                <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 6. DIAGNOSTICS & HARDWARE */}
        <View style={styles.diagnosticsCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="tune" size={18} color="#0F2942" style={{ marginRight: 6 }} />
              <Text style={styles.cardHeaderTitle}>Diagnostics & Hardware</Text>
            </View>
            <Text style={styles.busUnitLabel}>Bus Unit {profile.assignedFleet}</Text>
          </View>

          {/* Diagnostic Item 1: Air-Gap Verification Cache */}
          <View style={styles.diagItem}>
            <View style={styles.diagLeft}>
              <View style={styles.diagIconBox}>
                <MaterialCommunityIcons name="database-check-outline" size={18} color="#64748B" />
              </View>
              <View>
                <Text style={styles.diagTitle}>Air-Gap Verification Cache</Text>
                <Text style={styles.diagSub}>{profile.diagnostics.airGapCachedTokens.toLocaleString()} cryptotokens cached locally</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.syncedPill} onPress={handleSyncCache}>
              <Text style={styles.syncedPillText}>{profile.diagnostics.airGapStatus}</Text>
            </TouchableOpacity>
          </View>

          {/* Diagnostic Item 2: Hardware Optical Scanner */}
          <View style={styles.diagItem}>
            <View style={styles.diagLeft}>
              <View style={styles.diagIconBox}>
                <MaterialCommunityIcons name="barcode-scan" size={18} color="#64748B" />
              </View>
              <View>
                <Text style={styles.diagTitle}>Hardware Optical Scanner</Text>
                <Text style={styles.scannerStatusGreen}>
                  {profile.diagnostics.scannerConnected ? `Connected: ${profile.diagnostics.scannerName}` : 'Disconnected'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleRepairScanner} style={styles.repairBtn}>
              {repairingScanner ? (
                <ActivityIndicator size="small" color="#0F2942" />
              ) : (
                <Text style={styles.repairBtnText}>Re-pair</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Diagnostic Item 3: Scanner Beep & Haptics */}
          <View style={styles.diagItem}>
            <View style={styles.diagLeft}>
              <View style={styles.diagIconBox}>
                <MaterialCommunityIcons name="volume-high" size={18} color="#64748B" />
              </View>
              <View>
                <Text style={styles.diagTitle}>Scanner Beep & Haptics</Text>
                <Text style={styles.diagSub}>Audible confirmation on valid fare</Text>
              </View>
            </View>

            <Switch
              value={profile.diagnostics.scannerBeepHaptics}
              onValueChange={handleToggleBeep}
              trackColor={{ false: '#CBD5E1', true: '#0F766E' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Diagnostic Item 4: Turnstile Auto-Brightness Boost */}
          <View style={styles.diagItem}>
            <View style={styles.diagLeft}>
              <View style={styles.diagIconBox}>
                <MaterialCommunityIcons name="brightness-7" size={18} color="#64748B" />
              </View>
              <View>
                <Text style={styles.diagTitle}>Turnstile Auto-Brightness Boost</Text>
                <Text style={styles.diagSub}>Overrides screen for glare scanning</Text>
              </View>
            </View>

            <Switch
              value={profile.diagnostics.brightnessBoost}
              onValueChange={handleToggleBrightness}
              trackColor={{ false: '#CBD5E1', true: '#0F766E' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 7. ACTION BUTTONS */}
        <View style={styles.actionButtonsCol}>
          {/* Button 1: Report Vehicle Fault / Maintenance */}
          <TouchableOpacity
            style={styles.reportFaultBtn}
            onPress={() => setShowFaultModal(true)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="wrench-outline" size={18} color="#0F2942" style={{ marginRight: 8 }} />
            <Text style={styles.reportFaultBtnText}>Report Vehicle Fault / Maintenance</Text>
          </TouchableOpacity>

          {/* Button 2: Clock Out & Complete Shift Summary */}
          <TouchableOpacity
            style={styles.clockOutBtn}
            onPress={() => setShowClockOutModal(true)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="exit-to-app" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.clockOutBtnText}>Clock Out & Complete Shift Summary</Text>
          </TouchableOpacity>

          {/* Button 3: Log Out / Exit Terminal */}
          <TouchableOpacity
            style={styles.exitTerminalBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={16} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={styles.exitTerminalBtnText}>Log Out / Exit Terminal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 8. REPORT VEHICLE FAULT MODAL */}
      <Modal visible={showFaultModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="wrench-outline" size={20} color="#0F2942" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Report Vehicle Fault</Text>
              </View>
              <TouchableOpacity onPress={() => setShowFaultModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalAutoTagsRow}>
              <View style={styles.autoTagPill}>
                <Text style={styles.autoTagText}>Bus: {profile.assignedFleet}</Text>
              </View>
              <View style={styles.autoTagPill}>
                <Text style={styles.autoTagText}>Route: {profile.activeRoute}</Text>
              </View>
              <View style={styles.autoTagPill}>
                <Text style={styles.autoTagText}>Op: {profile.staffId}</Text>
              </View>
            </View>

            <Text style={styles.formSectionLabel}>FAULT SUBSYSTEM CATEGORY</Text>
            <View style={styles.chipsRow}>
              {(
                [
                  'Doors & Ramp',
                  'Brakes',
                  'HVAC / Climate',
                  'Farebox / Scanner',
                  'Engine / Powertrain',
                  'Tires / Suspension',
                  'Electrical',
                ] as MaintenanceFaultReport['category'][]
              ).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chipPill, faultCategory === cat && styles.chipPillActive]}
                  onPress={() => setFaultCategory(cat)}
                >
                  <Text style={[styles.chipText, faultCategory === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formSectionLabel}>OPERATIONAL SEVERITY</Text>
            <View style={styles.severityRow}>
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as MaintenanceFaultReport['severity'][]).map((sev) => (
                <TouchableOpacity
                  key={sev}
                  style={[
                    styles.severityBtn,
                    faultSeverity === sev && styles.severityBtnActive,
                    faultSeverity === sev && sev === 'CRITICAL' && { backgroundColor: '#DC2626' },
                  ]}
                  onPress={() => setFaultSeverity(sev)}
                >
                  <Text style={[styles.severityText, faultSeverity === sev && styles.severityTextActive]}>{sev}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formSectionLabel}>DEFECT DESCRIPTION</Text>
            <TextInput
              style={styles.modalTextInput}
              value={faultDescription}
              onChangeText={setFaultDescription}
              placeholder="Describe malfunction symptoms, audible clicks, or error codes..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowFaultModal(false)}
                disabled={submittingFault}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitFault}
                disabled={submittingFault}
              >
                {submittingFault ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Submit to Dispatch</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 9. CLOCK OUT & SHIFT SUMMARY MODAL */}
      <Modal visible={showClockOutModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="flag-checkered" size={20} color="#0F2942" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Clock Out & Conclude Shift?</Text>
              </View>
              <TouchableOpacity onPress={() => setShowClockOutModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmSubText}>
              Review your final operational metrics before officially clocking out from {profile.assignedFleet}:
            </Text>

            <View style={styles.summaryStatsBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Passenger Boardings:</Text>
                <Text style={styles.summaryVal}>{profile.todaysBoardings} Boarded</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Digital QR / Passes Scanned:</Text>
                <Text style={styles.summaryVal}>{profile.scansCompleted} Scans</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Cashless Adoption:</Text>
                <Text style={styles.summaryVal}>{profile.cashlessBoardingPct}%</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>On-Time Departure Performance:</Text>
                <Text style={styles.summaryVal}>{profile.onTimeDeparturePct}% (Tier-1)</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Shift Duration:</Text>
                <Text style={styles.summaryVal}>{shiftMetrics.elapsedStr.replace(' elapsed', '')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Active Bus & Line:</Text>
                <Text style={styles.summaryVal}>{profile.assignedFleet} ({profile.activeRoute})</Text>
              </View>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowClockOutModal(false)}>
                <Text style={styles.modalCancelBtnText}>Return to Duty</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalClockOutBtn} onPress={handleClockOutShift}>
                <Text style={styles.modalClockOutBtnText}>Confirm Clock Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 10. SWITCH VEHICLE MODAL */}
      <Modal visible={showSwitchVehicleModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Assigned Vehicle Fleet</Text>
              <TouchableOpacity onPress={() => setShowSwitchVehicleModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, marginVertical: 12 }}>
              {[
                { bus: '#4028', type: 'Electric Hybrid (Current)' },
                { bus: '#4208', type: 'Zero-Emission EV' },
                { bus: '#1382', type: 'Clean Diesel Express' },
              ].map((v) => (
                <TouchableOpacity
                  key={v.bus}
                  style={[styles.vehicleOptionCard, profile.assignedFleet === v.bus && styles.vehicleOptionCardActive]}
                  onPress={() => handleConfirmSwitchVehicle(v.bus, v.type.replace(' (Current)', ''))}
                >
                  <View>
                    <Text style={styles.vehicleOptionBus}>{v.bus}</Text>
                    <Text style={styles.vehicleOptionType}>{v.type}</Text>
                  </View>
                  <Feather
                    name={profile.assignedFleet === v.bus ? 'check-circle' : 'chevron-right'}
                    size={18}
                    color={profile.assignedFleet === v.bus ? '#0D9488' : '#94A3B8'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* 11. SHIFT ROSTER MODAL */}
      <Modal visible={showRosterModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Weekly Shift Roster</Text>
              <TouchableOpacity onPress={() => setShowRosterModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8, marginVertical: 10 }}>
              {[
                { day: 'Mon', route: 'Line 42 Eastbound', hours: '05:00 - 14:30', status: 'Completed' },
                { day: 'Tue', route: 'Line 42 Eastbound', hours: '05:00 - 14:30', status: 'Completed' },
                { day: 'Wed', route: 'Line 42 Eastbound', hours: '05:00 - 14:30', status: 'Active Today' },
                { day: 'Thu', route: 'Line 42 Eastbound', hours: '05:00 - 14:30', status: 'Scheduled' },
                { day: 'Fri', route: 'Line 42 Eastbound', hours: '05:00 - 14:30', status: 'Scheduled' },
                { day: 'Sat', route: 'Standby Controller', hours: '06:00 - 12:00', status: 'Rest' },
              ].map((r) => (
                <View key={r.day} style={styles.rosterRow}>
                  <Text style={styles.rosterDay}>{r.day}</Text>
                  <View style={{ flex: 1, paddingHorizontal: 10 }}>
                    <Text style={styles.rosterRoute}>{r.route}</Text>
                    <Text style={styles.rosterHours}>{r.hours}</Text>
                  </View>
                  <Text
                    style={[
                      styles.rosterStatus,
                      r.status === 'Active Today' && { color: '#0D9488', fontWeight: '800' },
                    ]}
                  >
                    {r.status}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.modalPrimaryCloseBtn} onPress={() => setShowRosterModal(false)}>
              <Text style={styles.modalPrimaryCloseText}>Close Roster</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 12. CERTIFICATION DETAIL MODAL */}
      <Modal visible={!!selectedCert} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Official Credential Record</Text>
              <TouchableOpacity onPress={() => setSelectedCert(null)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedCert && (
              <View style={{ gap: 10, marginVertical: 12 }}>
                <View style={styles.certModalFieldRow}>
                  <Text style={styles.certModalFieldLabel}>Credential Name:</Text>
                  <Text style={styles.certModalFieldValue}>{selectedCert.name}</Text>
                </View>
                <View style={styles.certModalFieldRow}>
                  <Text style={styles.certModalFieldLabel}>Authority / Classification:</Text>
                  <Text style={styles.certModalFieldValue}>{selectedCert.detail}</Text>
                </View>
                <View style={styles.certModalFieldRow}>
                  <Text style={styles.certModalFieldLabel}>Validity Period:</Text>
                  <Text style={styles.certModalFieldValue}>Valid through {selectedCert.validUntil}</Text>
                </View>
                <View style={styles.certModalFieldRow}>
                  <Text style={styles.certModalFieldLabel}>Status:</Text>
                  <Text style={[styles.certModalFieldValue, { color: '#16A34A', fontWeight: '800' }]}>
                    VERIFIED & ACTIVE
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.modalPrimaryCloseBtn} onPress={() => setSelectedCert(null)}>
              <Text style={styles.modalPrimaryCloseText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 14. LOG OUT / EXIT TERMINAL MODAL */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: 380 }]}>
            <View style={{ alignItems: 'center', marginVertical: 12 }}>
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: '#FEE2E2',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Feather name="log-out" size={26} color="#DC2626" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 6 }}>
                Exit Terminal & Sign Out?
              </Text>
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 }}>
                Are you sure you want to end your driver terminal session? Any offline logs have been securely saved.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { flex: 1, paddingVertical: 13 }]}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#DC2626',
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 13,
                }}
                onPress={executeSignOut}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Confirm Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 13. BOTTOM NAVIGATION */}
      {!embedded && <DashboardBottomNav currentTab="profile" onSelectTab={handleSelectTab} />}
    </RootContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  // 1. Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busTerminalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0F2942',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  offlinePill: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  statusDotRed: {
    backgroundColor: '#DC2626',
  },
  onlinePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  offlinePillText: {
    color: '#DC2626',
  },
  powerButton: {
    padding: 6,
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },

  // 2. Operator Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImg: {
    width: 74,
    height: 74,
    borderRadius: 14,
    backgroundColor: '#0F2942',
  },
  mtaBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0F2942',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  mtaBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  operatorMetaColumn: {
    flex: 1,
  },
  depotTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  drvPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  drvDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#16A34A',
    marginRight: 4,
  },
  drvPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  depotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  depotDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EA580C',
    marginRight: 4,
  },
  depotPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C2410C',
  },
  operatorName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0D9488',
  },
  ratingTierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
    marginRight: 4,
  },
  ratingCommendation: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tierPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F766E',
  },

  // 3. Current Duty Assignment Card
  dutyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  dutyStatusPill: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  dutyStatusPillOff: {
    backgroundColor: '#FEE2E2',
  },
  dutyStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  dutyStatusTextOff: {
    color: '#DC2626',
  },
  subcardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  subcard: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    padding: 10,
  },
  subcardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subcardLabelTeal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  subcardLabelCyan: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0D9488',
  },
  subcardTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 1,
  },
  subcardSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  shiftProgressSection: {
    marginBottom: 12,
  },
  shiftProgressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shiftWindowText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  shiftElapsedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 3,
  },
  shiftStopsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftStopsText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  dutyActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  switchVehicleBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0D9488',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchVehicleBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
  },
  viewRosterBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewRosterBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },

  // 4. Shift Telemetry & Boarding
  telemetrySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  liveFeedBeacon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beaconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D9488',
    marginRight: 4,
  },
  liveFeedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  kpiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  kpiValueLarge: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 1,
  },
  kpiTrendGreen: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
  },
  kpiSubTeal: {
    fontSize: 10,
    color: '#0D9488',
    fontWeight: '700',
  },
  kpiSubGray: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },

  // 5. Official Certifications
  certsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  allValidPill: {
    backgroundColor: '#CCFBF1',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  allValidText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F766E',
  },
  certsList: {
    gap: 8,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  certIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  certCenterText: {
    flex: 1,
  },
  certTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 1,
  },
  certSubtitle: {
    fontSize: 10,
    color: '#64748B',
  },

  // 6. Diagnostics & Hardware
  diagnosticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  busUnitLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  diagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  diagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  diagIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  diagTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 1,
  },
  diagSub: {
    fontSize: 10,
    color: '#64748B',
  },
  scannerStatusGreen: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  syncedPill: {
    backgroundColor: '#CCFBF1',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  syncedPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F766E',
  },
  repairBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  repairBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F2942',
    textDecorationLine: 'underline',
  },

  // 7. Action Buttons
  actionButtonsCol: {
    gap: 10,
  },
  reportFaultBtn: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportFaultBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  clockOutBtn: {
    height: 48,
    backgroundColor: '#0F2942',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F2942',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  clockOutBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  exitTerminalBtn: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitTerminalBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },

  // Modals Styling
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalAutoTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  autoTagPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  autoTagText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '700',
  },
  formSectionLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  chipPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipPillActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  chipText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  severityBtn: {
    flex: 1,
    height: 32,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  severityBtnActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  severityText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  severityTextActive: {
    color: '#FFFFFF',
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    height: 64,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#0F2942',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  confirmSubText: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 16,
  },
  summaryStatsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  modalClockOutBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#0F2942',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClockOutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  vehicleOptionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  vehicleOptionCardActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  vehicleOptionBus: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  vehicleOptionType: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rosterDay: {
    width: 34,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  rosterRoute: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  rosterHours: {
    fontSize: 10,
    color: '#64748B',
  },
  rosterStatus: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  modalPrimaryCloseBtn: {
    height: 40,
    backgroundColor: '#0F2942',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  modalPrimaryCloseText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  certModalFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  certModalFieldLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  certModalFieldValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
});
