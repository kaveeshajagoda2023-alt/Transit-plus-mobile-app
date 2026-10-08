import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { DashboardBottomNav, DashboardTab } from '@/components/dashboard/DashboardBottomNav';
import { tripApi } from '@/services/api/tripApi';
import { TripData, ScanValidationResponse } from '@/types/trip';

interface TicketSuccessScreenProps {
  validationData?: ScanValidationResponse | null;
  onScanNext?: () => void;
}

export function TicketSuccessScreen({
  validationData: propValidationData,
  onScanNext,
}: TicketSuccessScreenProps) {
  const params = useLocalSearchParams();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [showPassengerModal, setShowPassengerModal] = useState(false);

  // Parse validation data from props or route params
  const validation: ScanValidationResponse = propValidationData || {
    valid: true,
    result: 'PASS',
    ticketId: (params.ticketId as string) || 'TK-9021-042',
    ticketTypeLabel: (params.ticketType as string) || 'Valid Single Journey Transit Pass',
    fareAmount: params.fare ? Number(params.fare) : 100,
    passengerName: (params.passenger as string) || 'Dilshan Silva',
    bookingReference: (params.bookingRef as string) || 'MTA-BK-90214',
    passengerCount: 1,
    originStop: (params.origin as string) || 'Market St & 4th',
    destinationStop: (params.destination as string) || 'University Malabe Campus',
    originZone: 'Zone 1',
    destinationZone: 'Zone 2',
    paymentStatus: 'PAID',
    paymentMethod: 'Digital Wallet Pay',
    transactionId: 'TXN-884028-091',
    paidAt: 'Today, 10:14:15 AM (Via Automated)',
    activityItem: {
      id: 'act-sample',
      ticketId: 'TK-9021-042',
      ticketTypeLabel: 'Standard Single',
      eventText: 'Boarded just now',
      result: 'PASS',
      timestamp: Date.now(),
      fareAmount: 100,
      method: 'QR',
    },
    updatedTrip: {} as any,
  };

  // Animated checkmark entrance
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // Fetch active trip data for live headcount
    tripApi.getActiveTrip().then((t) => setTrip(t)).catch(() => {});
  }, [scaleAnim, opacityAnim]);

  const handleScanNext = () => {
    if (onScanNext) {
      onScanNext();
    } else {
      router.replace('/staff/scanner' as any);
    }
  };

  const handleSelectTab = (tab: DashboardTab) => {
    if (tab === 'dashboard') {
      router.replace('/staff/dashboard' as any);
    } else if (tab === 'scanner') {
      router.replace('/staff/scanner' as any);
    } else if (tab === 'activity' || tab === 'passengers' || tab === 'profile') {
      router.replace('/staff/dashboard' as any);
    }
  };

  const occupiedCount = trip?.occupiedSeats || 39;
  const totalSeats = trip?.totalSeats || 55;
  const occupancyPercent = Math.round((occupiedCount / totalSeats) * 100);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* 1. COMPACT TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <MaterialCommunityIcons name="bus" size={18} color="#0F172A" style={{ marginRight: 6 }} />
          <Text style={styles.headerTitleText}>TransitOps • Bus #4028</Text>
        </View>

        <View style={styles.headerRightStatus}>
          <MaterialCommunityIcons name="broadcast" size={18} color="#0D9488" />
          <View style={styles.liveIndicatorDot} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. SUCCESS ICON & STATUS BANNER */}
        <Animated.View
          style={[
            styles.successCenterSection,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Feather name="check" size={32} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.successTitleText}>PAYMENT VERIFIED</Text>
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>✓ PAID</Text>
            </View>
          </View>

          <Text style={styles.successSubtitleText}>
            {validation.ticketTypeLabel || 'Valid Single Journey Transit Pass'}
          </Text>
        </Animated.View>

        {/* 3. LIVE VEHICLE OCCUPANCY CARD */}
        <View style={styles.occupancyCard}>
          <View style={styles.occupancyLeft}>
            <View style={styles.occupancyIconCircle}>
              <MaterialCommunityIcons name="seat-passenger" size={18} color="#0D9488" />
            </View>
            <Text style={styles.occupancyCountText}>
              {occupiedCount} | {totalSeats} passengers
            </Text>
          </View>

          <View style={styles.occupancyBadge}>
            <Text style={styles.occupancyBadgeText}>{occupancyPercent}% Normal</Text>
          </View>
        </View>

        {/* 4. MAIN TICKET INFORMATION CARD */}
        <View style={styles.ticketCard}>
          {/* Top Token ID & Status */}
          <View style={styles.ticketHeaderRow}>
            <Text style={styles.ticketIdText}>#{validation.ticketId}</Text>
            <View style={styles.validTokenBadge}>
              <Text style={styles.validTokenText}>VALID TOKEN</Text>
            </View>
          </View>

          {/* Route & Grid Assignment */}
          <View style={styles.routeRow}>
            <View style={styles.routeLeft}>
              <MaterialCommunityIcons name="bus-side" size={20} color="#059669" style={{ marginRight: 8 }} />
              <Text style={styles.routeNameText}>Bus Line 42 Eastbound</Text>
            </View>
            <Text style={styles.gridAssignmentText}>Grid Assignment #09</Text>
          </View>

          {/* Journey Stops Timeline */}
          <View style={styles.stopsTimelineContainer}>
            {/* Origin Stop */}
            <View style={styles.stopTimelineItem}>
              <View style={styles.stopDotGreen} />
              <View style={styles.stopTextContent}>
                <Text style={styles.stopLabel}>BOARDING STOP</Text>
                <Text style={styles.stopNameText}>{validation.originStop || 'Market St & 4th'}</Text>
              </View>
              <View style={styles.zoneTag}>
                <Text style={styles.zoneTagText}>{validation.originZone || 'Zone 1'}</Text>
              </View>
            </View>

            {/* Connecting Vertical Track */}
            <View style={styles.timelineTrack} />

            {/* Destination Stop */}
            <View style={styles.stopTimelineItem}>
              <View style={styles.stopDotGreen} />
              <View style={styles.stopTextContent}>
                <Text style={styles.stopLabel}>DESTINATION</Text>
                <Text style={styles.stopNameText}>
                  {validation.destinationStop || 'University Malabe Campus'}
                </Text>
              </View>
              <View style={styles.zoneTag}>
                <Text style={styles.zoneTagText}>{validation.destinationZone || 'Zone 2'}</Text>
              </View>
            </View>
          </View>

          {/* Fare & Payment Method Details Box */}
          <View style={styles.fareMethodBox}>
            <View style={styles.fareMethodCol}>
              <Text style={styles.metaLabel}>FARE & CATEGORY</Text>
              <Text style={styles.metaValueBold}>Rs {validation.fareAmount.toFixed(2)} / Adult</Text>
              <Text style={styles.metaValueSub}>Standard Single</Text>
            </View>

            <View style={styles.fareMethodDivider} />

            <View style={styles.fareMethodCol}>
              <Text style={styles.metaLabel}>METHOD</Text>
              <Text style={styles.metaValueBold}>{validation.paymentMethod || 'Digital Wallet Pay'}</Text>
              <Text style={styles.metaValueSub}>(•-4028 Terminal)</Text>
            </View>
          </View>

          {/* Timestamp & Transaction Meta */}
          <View style={styles.ticketCardFooter}>
            <View style={styles.footerTimeRow}>
              <Feather name="clock" size={13} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.footerTimeText}>
                {validation.paidAt || 'Today, 10:14:15 AM (Via Automated)'}
              </Text>
            </View>
            <Text style={styles.footerRefText}>
              Ref: {validation.bookingReference || 'MTA-BK-90214'} • Txn: {validation.transactionId || 'TXN-884028-091'}
            </Text>
          </View>
        </View>

        {/* 5. PRIMARY & SECONDARY ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.scanNextButton}
            onPress={handleScanNext}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.scanNextButtonText}>SCAN NEXT TICKET</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.passengerDetailsButton}
            onPress={() => setShowPassengerModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={18} color="#0D9488" style={{ marginRight: 8 }} />
            <Text style={styles.passengerDetailsButtonText}>View Full Passenger Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 6. PASSENGER DETAILS MODAL */}
      <Modal visible={showPassengerModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Passenger Manifest Record</Text>
              <TouchableOpacity onPress={() => setShowPassengerModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Passenger Name:</Text>
                <Text style={styles.modalValue}>{validation.passengerName || 'Dilshan Silva'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Ticket Reference:</Text>
                <Text style={styles.modalValue}>{validation.ticketId}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Booking Ref:</Text>
                <Text style={styles.modalValue}>{validation.bookingReference || 'MTA-BK-90214'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Boarded Stop:</Text>
                <Text style={styles.modalValue}>{validation.originStop || 'Market St & 4th'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Destination:</Text>
                <Text style={styles.modalValue}>{validation.destinationStop || 'University Malabe Campus'}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Payment Status:</Text>
                <Text style={[styles.modalValue, { color: '#059669', fontWeight: '800' }]}>PAID & VERIFIED</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowPassengerModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 7. BOTTOM NAVIGATION BAR */}
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
  liveIndicatorDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // Success Circle Section
  successCenterSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  outerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  innerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  successTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  paidBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  paidBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  successSubtitleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },

  // Occupancy Card
  occupancyCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  occupancyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  occupancyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  occupancyCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  occupancyBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  occupancyBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803D',
  },

  // Main Ticket Card
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  ticketIdText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  validTokenBadge: {
    backgroundColor: '#CCFBF1',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  validTokenText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.4,
  },

  // Route Row
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  routeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  gridAssignmentText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  // Stops Timeline
  stopsTimelineContainer: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  stopTimelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stopDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  timelineTrack: {
    width: 2,
    height: 22,
    backgroundColor: '#CBD5E1',
    marginLeft: 4,
    marginVertical: 2,
  },
  stopTextContent: {
    flex: 1,
  },
  stopLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  stopNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  zoneTag: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  zoneTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },

  // Fare & Method Box
  fareMethodBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    marginBottom: 14,
  },
  fareMethodCol: {
    flex: 1,
  },
  fareMethodDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  metaValueBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  metaValueSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  // Ticket Card Footer
  ticketCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  footerTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  footerTimeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  footerRefText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },

  // Actions
  actionsContainer: {
    gap: 12,
  },
  scanNextButton: {
    backgroundColor: '#0F2942',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F2942',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  scanNextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  passengerDetailsButton: {
    backgroundColor: '#FFFFFF',
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerDetailsButtonText: {
    color: '#0F766E',
    fontSize: 13.5,
    fontWeight: '700',
  },

  // Passenger Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 380,
    borderRadius: 18,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    gap: 10,
    marginBottom: 18,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  modalValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  modalCloseBtn: {
    backgroundColor: '#0F2942',
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
