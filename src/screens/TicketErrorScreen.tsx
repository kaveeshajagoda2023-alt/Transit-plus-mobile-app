import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { DashboardBottomNav, DashboardTab } from '@/components/dashboard/DashboardBottomNav';
import { tripApi } from '@/services/api/tripApi';
import { ScanValidationResponse } from '@/types/trip';

type FaultScenario = 'invalid_qr' | 'expired' | 'already_used' | 'wrong_route';

interface TicketErrorScreenProps {
  validationData?: ScanValidationResponse | null;
  onScanNext?: () => void;
  onManualEntry?: () => void;
}

export function TicketErrorScreen({
  validationData: propValidationData,
  onScanNext,
  onManualEntry,
}: TicketErrorScreenProps) {
  const params = useLocalSearchParams();

  // Determine active fault scenario from params or props
  const initialReason = (propValidationData?.reason || (params.reason as string) || '').toLowerCase();
  const getInitialScenario = (): FaultScenario => {
    if (initialReason.includes('expired')) return 'expired';
    if (initialReason.includes('already') || initialReason.includes('duplicate')) return 'already_used';
    if (initialReason.includes('route') || initialReason.includes('138')) return 'wrong_route';
    return 'invalid_qr';
  };

  const [activeScenario, setActiveScenario] = useState<FaultScenario>(getInitialScenario());
  const [cashCollected, setCashCollected] = useState(false);

  // Scenario presets matching inspection fault simulation
  const SCENARIOS = {
    invalid_qr: {
      token: '#TK-UNRECOGNIZED',
      faultCode: '0x01',
      title: 'TICKET NOT VALID',
      diagnostics: 'UNRECOGNIZED_TOKEN_SCHEMA: Token not located in MTA master transit registry.',
      inspectionDetails: 'Inspection Timestamp: Today, 09:42 AM. Token cryptography failed signature check. QR code syntax unparseable.',
      mandate: 'Action: Request passenger to present physical receipt or re-issue digital token via mobile portal.',
      fareClass: 'Adult Single (Unverified)',
    },
    expired: {
      token: '#TK-8832',
      faultCode: '0x44',
      title: 'TICKET NOT VALID',
      diagnostics: 'EXPIRED_PASS_SCHEMA: Pass expired 20 minutes ago (valid until 09:20 AM)',
      inspectionDetails: 'Inspection Timestamp: 10/11/24 09:40 AM. Initial validation requested at 07:45 AM on South Transit Line. Gate/turnstile profile: elvis/pay-1229-8 expired.',
      mandate: 'Action: Collect standard cash on-board fare (Rs 65.00) or request passenger to renew digital token.',
      fareClass: 'Adult Single (Standard)',
    },
    already_used: {
      token: '#TK-7740',
      faultCode: '0x19',
      title: 'TICKET ALREADY REDEEMED',
      diagnostics: 'DUPLICATE_TOKEN_USE: Pass already scanned today at 09:35 AM on vehicle Bus #4028.',
      inspectionDetails: 'Inspection Timestamp: Today, 09:41 AM. Previous redemption recorded on Terminal TERM-4028-V4 by Driver M. Kavi.',
      mandate: 'Action: Deny duplicate entry or collect regular single journey cash fare (Rs 65.00).',
      fareClass: 'Student Monthly Pass',
    },
    wrong_route: {
      token: '#TK-4411',
      faultCode: '0x32',
      title: 'INVALID ROUTE TRANSIT',
      diagnostics: 'ROUTE_MISMATCH_SCHEMA: Pass valid strictly for Route 138, not Line 42 Eastbound.',
      inspectionDetails: 'Inspection Timestamp: Today, 09:43 AM. Origin: Pettah Main Station → Homagama Town (Line 138 corridor).',
      mandate: 'Action: Collect transfer fare (Rs 65.00) for Line 42 or direct passenger to correct bus terminal bay.',
      fareClass: 'Line 138 Standard Pass',
    },
  };

  const currentFault = SCENARIOS[activeScenario];

  const handleScanNext = () => {
    if (onScanNext) {
      onScanNext();
    } else {
      router.replace('/staff/scanner' as any);
    }
  };

  const handleManualEntry = () => {
    if (onManualEntry) {
      onManualEntry();
    } else {
      router.push('/staff/manual-entry' as any);
    }
  };

  const handleOverrideCashFare = async () => {
    try {
      await tripApi.recordCashFare(65);
      setCashCollected(true);
      Alert.alert(
        'Cash Fare Recorded',
        'Standard fare of Rs 65.00 recorded in onboard manifest. Occupancy incremented.',
        [{ text: 'OK' }]
      );
    } catch {
      Alert.alert('Error', 'Unable to record onboard cash fare.');
    }
  };

  const handleSelectTab = (tab: DashboardTab) => {
    if (tab === 'dashboard') {
      router.replace('/staff/dashboard' as any);
    } else if (tab === 'scanner') {
      router.replace('/staff/scanner' as any);
    } else {
      router.replace('/staff/dashboard' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* 1. TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <MaterialCommunityIcons name="shield-alert-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
          <Text style={styles.headerTitleText}>Validation Exception • Trip #42</Text>
        </View>

        <View style={styles.headerRightStatus}>
          <MaterialCommunityIcons name="broadcast" size={18} color="#DC2626" />
          <View style={styles.redIndicatorDot} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. INSPECTION FAULT SIMULATION SELECTOR BAR */}
        <View style={styles.simulationBar}>
          <View style={styles.simulationHeaderRow}>
            <Text style={styles.simulationHeaderText}>
              INSPECTION FAULT SIMULATION (3 SCENARIOS)
            </Text>
            <View style={styles.stateBadge}>
              <Text style={styles.stateBadgeText}>STATE 2/3</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenarioTabsRow}>
            <TouchableOpacity
              style={[styles.scenarioTab, activeScenario === 'invalid_qr' && styles.scenarioTabActive]}
              onPress={() => setActiveScenario('invalid_qr')}
            >
              <Text style={[styles.scenarioTabText, activeScenario === 'invalid_qr' && styles.scenarioTabTextActive]}>
                1. Invalid QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scenarioTab, activeScenario === 'expired' && styles.scenarioTabActive]}
              onPress={() => setActiveScenario('expired')}
            >
              <Text style={[styles.scenarioTabText, activeScenario === 'expired' && styles.scenarioTabTextActive]}>
                2. Expired Ticket
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scenarioTab, activeScenario === 'already_used' && styles.scenarioTabActive]}
              onPress={() => setActiveScenario('already_used')}
            >
              <Text style={[styles.scenarioTabText, activeScenario === 'already_used' && styles.scenarioTabTextActive]}>
                3. Already Used
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scenarioTab, activeScenario === 'wrong_route' && styles.scenarioTabActive]}
              onPress={() => setActiveScenario('wrong_route')}
            >
              <Text style={[styles.scenarioTabText, activeScenario === 'wrong_route' && styles.scenarioTabTextActive]}>
                4. Wrong Route
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 3. MAIN SECURITY EXCEPTION CARD */}
        <View style={styles.exceptionCard}>
          {/* Top Security Exception Badge */}
          <View style={styles.securityBadgeRow}>
            <View style={styles.redSquareDot} />
            <Text style={styles.securityBadgeText}>SECURITY EXCEPTION</Text>
          </View>

          {/* Red Octagon Icon & Exception Title */}
          <View style={styles.errorCenterRow}>
            <View style={styles.errorIconCircle}>
              <MaterialCommunityIcons name="close-octagon" size={40} color="#DC2626" />
            </View>
            <Text style={styles.errorTitleText}>{currentFault.title}</Text>
            <Text style={styles.errorTokenText}>
              TOKEN: {currentFault.token} • FAULT: {currentFault.faultCode}
            </Text>
          </View>

          {/* Failure Diagnostics Box */}
          <View style={styles.diagnosticsBox}>
            <View style={styles.boxHeaderRow}>
              <Feather name="alert-circle" size={15} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.diagnosticsHeaderTitle}>Failure Diagnostics:</Text>
            </View>
            <Text style={styles.diagnosticsSchemaText}>
              {currentFault.diagnostics}
            </Text>
            <Text style={styles.diagnosticsDetailsText}>
              {currentFault.inspectionDetails}
            </Text>
          </View>

          {/* Operational Mandate Box */}
          <View style={styles.mandateBox}>
            <View style={styles.boxHeaderRow}>
              <MaterialCommunityIcons name="shield-account" size={16} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.mandateHeaderTitle}>Operational Mandate:</Text>
            </View>
            <Text style={styles.mandateText}>{currentFault.mandate}</Text>
          </View>
        </View>

        {/* 4. VALIDATION CHECKPOINT DETAILS BOX */}
        <View style={styles.checkpointCard}>
          <View style={styles.checkpointHeaderRow}>
            <View style={styles.checkpointTitleLeft}>
              <MaterialCommunityIcons name="checkbox-multiple-marked-outline" size={16} color="#0D9488" style={{ marginRight: 6 }} />
              <Text style={styles.checkpointTitleText}>Validation Checkpoint</Text>
            </View>
            <View style={styles.routePill}>
              <Text style={styles.routePillText}>BUS #4028 • ROUTE 42</Text>
            </View>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Device Scanner ID</Text>
              <Text style={styles.gridValue}>TERM-4028-V4</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Current Zone</Text>
              <Text style={styles.gridValue}>Downtown Zone 1</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Passenger Fare Class</Text>
              <Text style={styles.gridValue}>{currentFault.fareClass}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Verification Service</Text>
              <Text style={styles.gridValue}>Active Spread</Text>
            </View>
          </View>
        </View>

        {/* 5. ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.scanNextButton}
            onPress={handleScanNext}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.scanNextButtonText}>Scan Next Passenger</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manualEntryButton}
            onPress={handleManualEntry}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="keyboard-outline" size={18} color="#0D9488" style={{ marginRight: 8 }} />
            <Text style={styles.manualEntryButtonText}>Manual Reference Entry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.overrideButton, cashCollected && styles.overrideButtonDisabled]}
            onPress={handleOverrideCashFare}
            activeOpacity={0.8}
            disabled={cashCollected}
          >
            <MaterialCommunityIcons name="cash-register" size={18} color="#EA580C" style={{ marginRight: 8 }} />
            <Text style={styles.overrideButtonText}>
              {cashCollected ? '✓ Cash Fare (Rs 65.00) Logged' : 'Override / Accept Cash Fare (Rs 65.00)'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 6. BOTTOM NAVIGATION */}
      <DashboardBottomNav currentTab="scanner" onSelectTab={handleSelectTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 6,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRightStatus: {
    position: 'relative',
    padding: 4,
  },
  redIndicatorDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },

  // Simulation Selector Bar
  simulationBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
  },
  simulationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  simulationHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  stateBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  stateBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  scenarioTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scenarioTab: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scenarioTabActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  scenarioTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  scenarioTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Exception Card
  exceptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  securityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  redSquareDot: {
    width: 6,
    height: 6,
    backgroundColor: '#DC2626',
    marginRight: 6,
  },
  securityBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.8,
  },
  errorCenterRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  errorIconCircle: {
    marginBottom: 8,
  },
  errorTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  errorTokenText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },

  // Diagnostics Box
  diagnosticsBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    marginBottom: 10,
  },
  boxHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  diagnosticsHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  diagnosticsSchemaText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B91C1C',
    lineHeight: 16,
    marginBottom: 4,
  },
  diagnosticsDetailsText: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 15,
  },

  // Mandate Box
  mandateBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 12,
  },
  mandateHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  mandateText: {
    fontSize: 11.5,
    color: '#9A3412',
    lineHeight: 16,
    fontWeight: '500',
  },

  // Checkpoint Card
  checkpointCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 18,
  },
  checkpointHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  checkpointTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkpointTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  routePill: {
    backgroundColor: '#CCFBF1',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  routePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  gridLabel: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Actions
  actionsContainer: {
    gap: 10,
  },
  scanNextButton: {
    backgroundColor: '#0F2942',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanNextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  manualEntryButton: {
    backgroundColor: '#FFFFFF',
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualEntryButtonText: {
    color: '#0F766E',
    fontSize: 13.5,
    fontWeight: '700',
  },
  overrideButton: {
    backgroundColor: '#FFF7ED',
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F97316',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overrideButtonDisabled: {
    opacity: 0.6,
  },
  overrideButtonText: {
    color: '#EA580C',
    fontSize: 13,
    fontWeight: '700',
  },
});
