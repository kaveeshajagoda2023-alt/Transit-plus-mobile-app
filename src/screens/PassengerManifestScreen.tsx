import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { DashboardBottomNav, DashboardTab } from '@/components/dashboard/DashboardBottomNav';
import { tripApi } from '@/services/api/tripApi';
import { TripData, PassengerManifestItem } from '@/types/trip';

type ManifestFilterTab = 'ALL' | 'DIGITAL' | 'CASH' | 'FAILED';

interface PassengerManifestScreenProps {
  onBack?: () => void;
  tripData?: TripData;
  embedded?: boolean;
}

export function PassengerManifestScreen({
  onBack,
  tripData: propTripData,
  embedded = false,
}: PassengerManifestScreenProps) {
  const [trip, setTrip] = useState<TripData | null>(propTripData || null);
  const [passengers, setPassengers] = useState<PassengerManifestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ManifestFilterTab>('ALL');

  // Real-time trip timer state (duration in minutes)
  const [durationMinutes, setDurationMinutes] = useState<number>(104); // 1h 44m baseline

  // Modals
  const [selectedPassenger, setSelectedPassenger] = useState<PassengerManifestItem | null>(null);
  const [showEndTripModal, setShowEndTripModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isEndingTrip, setIsEndingTrip] = useState<boolean>(false);

  // Issue Reporting Form State
  const [issueType, setIssueType] = useState<string>('Incorrect fare');
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [isSubmittingIssue, setIsSubmittingIssue] = useState<boolean>(false);

  // Initialize and subscribe to live trip updates & manifest
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const currentTrip = propTripData || (await tripApi.getActiveTrip());
        const manifest = await tripApi.getPassengerManifest();
        if (mounted) {
          setTrip(currentTrip);
          setPassengers(manifest);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    // Subscribe to live trip updates (WebSockets / real-time emitter)
    const unsub = tripApi.subscribeTripUpdates((updated) => {
      if (mounted) {
        setTrip(updated);
        tripApi.getPassengerManifest().then((m) => {
          if (mounted) setPassengers(m);
        });
      }
    });

    // Real-time trip timer interval
    const timerInterval = setInterval(() => {
      setDurationMinutes((prev) => prev + 1);
    }, 60000);

    return () => {
      mounted = false;
      unsub();
      clearInterval(timerInterval);
    };
  }, [propTripData]);

  // Derived occupancy & capacity calculations
  const occupiedCount = trip?.occupiedSeats ?? 42;
  const totalCapacity = trip?.totalSeats ?? 55;
  const occupancyPercentage = Math.round((occupiedCount / totalCapacity) * 100);
  const remainingSeats = Math.max(0, totalCapacity - occupiedCount);

  // Dynamic Occupancy Status determination
  const occupancyStatus = useMemo(() => {
    if (occupancyPercentage >= 95) return { label: 'Full', color: '#DC2626', bg: '#FEE2E2' };
    if (occupancyPercentage >= 70) return { label: 'High Occupancy', color: '#C2410C', bg: '#FFEDD5' };
    if (occupancyPercentage >= 40) return { label: 'Normal', color: '#15803D', bg: '#DCFCE7' };
    return { label: 'Low Occupancy', color: '#0369A1', bg: '#E0F2FE' };
  }, [occupancyPercentage]);

  // Dynamic Boarding Statistics
  const digitalCount = trip?.digitalQrCount ?? 36;
  const cashCount = trip?.cashFareCount ?? 4;
  const failedCount = trip?.pendingFailCount ?? 2;
  const digitalAdoptionRate = Math.round((digitalCount / Math.max(1, occupiedCount)) * 100);

  // Format Duration (e.g. 1h 44m)
  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hours}h ${m < 10 ? '0' : ''}${m}m`;
  };

  // Filter and Search logic
  const filteredPassengers = useMemo(() => {
    return passengers.filter((p) => {
      // 1. Tab Filter
      if (activeTab === 'DIGITAL' && p.category !== 'DIGITAL') return false;
      if (activeTab === 'CASH' && p.category !== 'CASH') return false;
      if (activeTab === 'FAILED' && p.category !== 'FAILED') return false;

      // 2. Search Query Filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.ticketId.toLowerCase().includes(q) ||
        p.passengerName.toLowerCase().includes(q) ||
        p.boardedAtStop.toLowerCase().includes(q) ||
        (p.type && p.type.toLowerCase().includes(q)) ||
        (p.fareLabel && p.fareLabel.toLowerCase().includes(q))
      );
    });
  }, [passengers, activeTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const all = passengers.length;
    const digital = passengers.filter((p) => p.category === 'DIGITAL').length || digitalCount;
    const cash = passengers.filter((p) => p.category === 'CASH').length || cashCount;
    const failed = passengers.filter((p) => p.category === 'FAILED').length || failedCount;
    return { all, digital, cash, failed };
  }, [passengers, digitalCount, cashCount, failedCount]);

  // Navigation tab switcher
  const handleSelectTab = (tab: DashboardTab) => {
    if (tab === 'dashboard') {
      router.replace('/staff/dashboard' as any);
    } else if (tab === 'scanner') {
      router.replace('/staff/scanner' as any);
    } else if (tab === 'passengers') {
      // Already on passengers
    } else if (tab === 'profile') {
      router.replace('/staff/profile' as any);
    } else {
      router.replace('/staff/dashboard' as any);
    }
  };

  // Handle Complete & End Trip Confirmation
  const handleConfirmEndTrip = async () => {
    setIsEndingTrip(true);
    try {
      const updated = await tripApi.endTrip();
      setTrip(updated);
      setShowEndTripModal(false);
      Alert.alert(
        'Trip Concluded',
        `Trip ${updated.id} completed. Manifest finalized with ${occupiedCount} passengers. Shift records archived.`,
        [{ text: 'OK', onPress: () => router.replace('/staff/dashboard' as any) }]
      );
    } catch {
      Alert.alert('Error', 'Unable to finalize trip at this time.');
    } finally {
      setIsEndingTrip(false);
    }
  };

  // Handle Export / Download Manifest
  const handleExportManifest = async () => {
    try {
      const report = await tripApi.exportManifestReport();
      const exportText = `TRANSITPULSE MANIFEST REPORT\nTrip: ${report.tripId} | Bus: ${report.busNumber} | Route: ${report.route}\nDriver: ${report.driverName}\nOccupancy: ${report.occupancy}\nTotal Boarded: ${report.totalBoarded} | Digital: ${report.digitalQrCount} | Cash: ${report.cashFareCount} | Failed: ${report.failedScanCount}\n\n${report.csv}`;

      if (Platform.OS === 'web') {
        const blob = new Blob([exportText], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manifest-${report.tripId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('Manifest Exported', 'CSV manifest report successfully saved to your downloads folder.');
      } else {
        await Share.share({
          title: `Trip Manifest ${report.tripId}`,
          message: exportText,
        });
      }
    } catch {
      Alert.alert('Export Error', 'Unable to export passenger manifest report.');
    }
  };

  // Handle Report Issue Submission
  const handleSubmitIssue = async () => {
    if (!issueDescription.trim()) {
      Alert.alert('Missing Detail', 'Please provide a brief description of the issue.');
      return;
    }
    setIsSubmittingIssue(true);
    try {
      const res = await tripApi.reportTripIssue({
        type: issueType,
        description: issueDescription.trim(),
      });
      setIsSubmittingIssue(false);
      setShowReportModal(false);
      setIssueDescription('');
      Alert.alert('Issue Transmitted', `Report ${res.issueId} logged to Metro Transit Dispatch.`);
    } catch {
      setIsSubmittingIssue(false);
      Alert.alert('Submission Error', 'Unable to transmit issue report.');
    }
  };

  const RootContainer = embedded ? View : SafeAreaView;
  const rootContainerProps = embedded
    ? { style: { flex: 1, backgroundColor: '#F8FAFC' } }
    : { style: styles.safeArea, edges: ['top', 'left', 'right'] as const };

  return (
    <RootContainer {...rootContainerProps}>
      <StatusBar style="dark" />

      {/* 1. TOP OPERATIONAL HEADER */}
      {!embedded && (
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.busTerminalIconBox}>
              <MaterialCommunityIcons name="bus-clock" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>TransitOps • Bus {trip?.busNumber || '#4028'}</Text>
              <Text style={styles.headerSubtitle}>
                {trip?.driverName || 'Driver M. Kavi'} • Route {trip?.routeNumber?.replace('LINE ', '') || '42'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.liveGreenDot} />
            <TouchableOpacity style={styles.headerProfileBtn} onPress={() => router.replace('/staff/dashboard' as any)}>
              <MaterialCommunityIcons name="account-tie" size={20} color="#0F2942" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. TOP TRIP INFORMATION CARD */}
        <View style={styles.tripSummaryCard}>
          <View style={styles.tripSummaryTopRow}>
            <View style={styles.activeDispatchBadge}>
              <Text style={styles.activeDispatchText}>ACTIVE DISPATCH</Text>
            </View>

            <View style={styles.arrivingBlock}>
              <View style={styles.arrivingPill}>
                <Feather name="clock" size={11} color="#0284C7" style={{ marginRight: 4 }} />
                <Text style={styles.arrivingPillText}>Arriving</Text>
              </View>
              <Text style={styles.terminalEtaText}>
                {trip?.nextStop || 'Terminal'} in {trip?.etaMinutes || 6}m
              </Text>
            </View>
          </View>

          <Text style={styles.tripSummaryTitle}>
            Trip #{trip?.routeNumber?.replace('LINE ', '') || '42'} Summary & Manifest
          </Text>
          <Text style={styles.tripSummarySubtitle}>
            Driver M. Davis • Bus {trip?.busNumber || '#4028'}
          </Text>
        </View>

        {/* 3. LIVE CABIN OCCUPANCY CARD */}
        <View style={styles.occupancyCard}>
          <View style={styles.occupancyCardTopRow}>
            <View style={styles.occupancyTitleLeft}>
              <View style={styles.occupancyIconBox}>
                <MaterialCommunityIcons name="seat-passenger" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.occupancyTitleText}>Live Cabin Occupancy</Text>
                <Text style={styles.occupancySubText}>Vehicle Real-Time Load</Text>
              </View>
            </View>

            <View style={[styles.occupancyStatusBadge, { backgroundColor: occupancyStatus.bg }]}>
              <Text style={[styles.occupancyStatusText, { color: occupancyStatus.color }]}>
                {occupancyStatus.label}
              </Text>
            </View>
          </View>

          {/* Large Metrics Row */}
          <View style={styles.headcountRow}>
            <Text style={styles.headcountLarge}>
              {occupiedCount}{' '}
              <Text style={styles.headcountTotal}>/ {totalCapacity} Passengers</Text>
            </Text>
            <Text style={styles.headcountPercentage}>{occupancyPercentage}%</Text>
          </View>

          {/* Progress Bar Track */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, occupancyPercentage)}%`,
                  backgroundColor: occupancyPercentage > 90 ? '#DC2626' : '#0D9488',
                },
              ]}
            />
          </View>

          {/* Seats Remaining & Standing Room */}
          <View style={styles.occupancyFooterRow}>
            <View style={styles.seatsRemainingLeft}>
              <MaterialCommunityIcons name="seat" size={15} color="#0D9488" style={{ marginRight: 5 }} />
              <Text style={styles.seatsRemainingText}>{remainingSeats} Seats Remaining</Text>
            </View>
            <Text style={styles.standingRoomText}>Standing Room: Normal</Text>
          </View>
        </View>

        {/* 4. 2x2 BOARDING STATISTICS GRID */}
        <View style={styles.statsGrid}>
          {/* Total Boarded */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Total Boarded</Text>
              <MaterialCommunityIcons name="account-arrow-right" size={18} color="#0F2942" />
            </View>
            <Text style={styles.statCardNumber}>{occupiedCount}</Text>
            <Text style={styles.statCardTrend}>↗ +12% vs avg</Text>
          </View>

          {/* Digital QR */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Digital QR</Text>
              <MaterialCommunityIcons name="qrcode-scan" size={18} color="#0D9488" />
            </View>
            <Text style={styles.statCardNumber}>{digitalCount}</Text>
            <Text style={styles.statCardSubTeal}>{digitalAdoptionRate}% Adoption</Text>
          </View>

          {/* Cash Fares */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Cash Fares</Text>
              <MaterialCommunityIcons name="cash-multiple" size={18} color="#EA580C" />
            </View>
            <Text style={styles.statCardNumber}>{cashCount}</Text>
            <Text style={styles.statCardSubGray}>$10.00 Collected</Text>
          </View>

          {/* Failed Scans */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Failed Scans</Text>
              <MaterialCommunityIcons name="shield-alert-outline" size={18} color="#DC2626" />
            </View>
            <Text style={[styles.statCardNumber, { color: '#DC2626' }]}>{failedCount}</Text>
            <Text style={styles.statCardSubGray}>Resolved in route</Text>
          </View>
        </View>

        {/* 5. TRIP DURATION & SCHEDULE CARD */}
        <View style={styles.scheduleTimerCard}>
          <View style={styles.scheduleTimerLeft}>
            <View style={styles.timerClockBox}>
              <Feather name="clock" size={18} color="#2DD4BF" />
            </View>
            <View>
              <Text style={styles.shiftStartText}>Shift Start: 08:30 AM</Text>
              <Text style={styles.durationLargeText}>Duration: {formatDuration(durationMinutes)}</Text>
            </View>
          </View>

          <View style={styles.onSchedulePill}>
            <Text style={styles.onScheduleText}>ON SCHEDULE</Text>
          </View>
        </View>

        {/* 6. PASSENGER MANIFEST SECTION */}
        <View style={styles.manifestSectionHeader}>
          <Text style={styles.manifestTitle}>Passenger Manifest</Text>
          <Text style={styles.manifestRecordedCount}>{passengers.length} Recorded Entries</Text>
        </View>

        {/* Search Field */}
        <View style={styles.searchBarContainer}>
          <Feather name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search ticket ID, stop or fare..."
            placeholderTextColor="#94A3B8"
            autoCorrect={false}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          ) : (
            <MaterialCommunityIcons name="tune-variant" size={18} color="#94A3B8" />
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsRow}>
          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'ALL' && styles.filterTabActive]}
            onPress={() => setActiveTab('ALL')}
          >
            <Text style={[styles.filterTabText, activeTab === 'ALL' && styles.filterTabTextActive]}>
              All ({tabCounts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'DIGITAL' && styles.filterTabActive]}
            onPress={() => setActiveTab('DIGITAL')}
          >
            <Text style={[styles.filterTabText, activeTab === 'DIGITAL' && styles.filterTabTextActive]}>
              Verified ({tabCounts.digital})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'CASH' && styles.filterTabActive]}
            onPress={() => setActiveTab('CASH')}
          >
            <Text style={[styles.filterTabText, activeTab === 'CASH' && styles.filterTabTextActive]}>
              Cash ({tabCounts.cash})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeTab === 'FAILED' && styles.filterTabActive]}
            onPress={() => setActiveTab('FAILED')}
          >
            <Text style={[styles.filterTabText, activeTab === 'FAILED' && styles.filterTabTextActive]}>
              Failed ({tabCounts.failed})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 7. PASSENGER MANIFEST ITEMS */}
        <View style={styles.manifestList}>
          {filteredPassengers.map((item) => {
            const isCash = item.category === 'CASH' || item.ticketId.startsWith('CSH');
            const isFailed = item.category === 'FAILED' || item.status === 'REJECTED';

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.manifestItemCard}
                activeOpacity={0.7}
                onPress={() => setSelectedPassenger(item)}
              >
                {/* Left Category Icon */}
                <View
                  style={[
                    styles.itemIconCircle,
                    isCash && styles.itemIconCircleBlue,
                    isFailed && styles.itemIconCircleOrange,
                  ]}
                >
                  {isFailed ? (
                    <MaterialCommunityIcons name="alert" size={18} color="#EA580C" />
                  ) : isCash ? (
                    <MaterialCommunityIcons name="currency-usd" size={18} color="#2563EB" />
                  ) : (
                    <Feather name="check" size={16} color="#16A34A" />
                  )}
                </View>

                {/* Center Ticket & Stop Info */}
                <View style={styles.itemCenterInfo}>
                  <View style={styles.ticketPillRow}>
                    <Text style={styles.itemTicketId}>#{item.ticketId}</Text>
                    <View
                      style={[
                        styles.itemTypeBadge,
                        isFailed && styles.itemTypeBadgeRed,
                        isCash && styles.itemTypeBadgeBlue,
                      ]}
                    >
                      <Text
                        style={[
                          styles.itemTypeBadgeText,
                          isFailed && styles.itemTypeBadgeTextRed,
                          isCash && styles.itemTypeBadgeTextBlue,
                        ]}
                      >
                        {item.fareLabel || item.type || 'Standard Single'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemStopRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={13} color="#94A3B8" style={{ marginRight: 3 }} />
                    <Text style={styles.itemStopText}>
                      {item.boardedAtStop} ({item.boardedAtTime})
                    </Text>
                  </View>
                </View>

                {/* Right Status Badge */}
                <View style={styles.itemRightStatus}>
                  <View
                    style={[
                      styles.statusPill,
                      isFailed && styles.statusPillRed,
                      isCash && styles.statusPillBlue,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isFailed && styles.statusPillTextRed,
                        isCash && styles.statusPillTextBlue,
                      ]}
                    >
                      {item.badgeLabel || (isFailed ? 'Rejected' : isCash ? 'Cash' : 'Verified Digital')}
                    </Text>
                  </View>
                  <Text style={[styles.statusSubText, isFailed && { color: '#DC2626' }]}>
                    {item.badgeSubLabel || (isFailed ? 'Override Off' : isCash ? 'Farebox #1' : 'NFC Tap')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredPassengers.length === 0 && (
            <View style={styles.emptyStateBox}>
              <MaterialCommunityIcons name="card-search-outline" size={32} color="#94A3B8" />
              <Text style={styles.emptyStateTitle}>No Manifest Records Match Filter</Text>
              <Text style={styles.emptyStateSub}>Clear the search term or switch filter category.</Text>
            </View>
          )}
        </View>

        {/* 8. COMPLETE & END TRIP BUTTON */}
        <TouchableOpacity
          style={styles.endTripButton}
          onPress={() => setShowEndTripModal(true)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="restart" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.endTripButtonText}>Complete & End Trip</Text>
        </TouchableOpacity>

        {/* 9. DOWNLOAD MANIFEST & REPORT ISSUE BUTTON */}
        <TouchableOpacity
          style={styles.downloadReportButton}
          onPress={() => setShowReportModal(true)}
          activeOpacity={0.8}
        >
          <Feather name="download" size={17} color="#0D9488" style={{ marginRight: 8 }} />
          <Text style={styles.downloadReportButtonText}>Download Manifest & Report Issue</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 10. PASSENGER DETAIL MODAL */}
      <Modal visible={!!selectedPassenger} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Passenger Manifest Entry</Text>
              <TouchableOpacity onPress={() => setSelectedPassenger(null)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedPassenger && (
              <View style={styles.modalBody}>
                <View style={styles.modalFieldRow}>
                  <Text style={styles.modalFieldLabel}>Passenger Name:</Text>
                  <Text style={styles.modalFieldValue}>{selectedPassenger.passengerName}</Text>
                </View>

                <View style={styles.modalFieldRow}>
                  <Text style={styles.modalFieldLabel}>Ticket Reference:</Text>
                  <Text style={[styles.modalFieldValue, { fontWeight: '800' }]}>#{selectedPassenger.ticketId}</Text>
                </View>

                <View style={styles.modalFieldRow}>
                  <Text style={styles.modalFieldLabel}>Fare Class:</Text>
                  <Text style={styles.modalFieldValue}>{selectedPassenger.type}</Text>
                </View>

                <View style={styles.modalFieldRow}>
                  <Text style={styles.modalFieldLabel}>Boarded Stop:</Text>
                  <Text style={styles.modalFieldValue}>{selectedPassenger.boardedAtStop}</Text>
                </View>

                <View style={styles.modalFieldRow}>
                  <Text style={styles.modalFieldLabel}>Boarding Timestamp:</Text>
                  <Text style={styles.modalFieldValue}>{selectedPassenger.boardedAtTime}</Text>
                </View>

                <View style={styles.modalFieldRow}>
                  <Text style={styles.modalFieldLabel}>Destination:</Text>
                  <Text style={styles.modalFieldValue}>{selectedPassenger.destination || 'Terminal 6'}</Text>
                </View>

                <View style={styles.modalFieldRow}>
                  <Text style={styles.modalFieldLabel}>Payment Method:</Text>
                  <Text style={styles.modalFieldValue}>
                    {selectedPassenger.method === 'CASH'
                      ? 'Cash Farebox #1'
                      : selectedPassenger.method === 'NFC'
                      ? 'NFC Transit Pass'
                      : 'Digital QR Code'}
                  </Text>
                </View>

                <View style={styles.modalFieldRow}>
                  <Text style={styles.modalFieldLabel}>Verification Status:</Text>
                  <Text
                    style={[
                      styles.modalFieldValue,
                      selectedPassenger.status === 'REJECTED'
                        ? { color: '#DC2626', fontWeight: '800' }
                        : { color: '#16A34A', fontWeight: '800' },
                    ]}
                  >
                    {selectedPassenger.status === 'REJECTED' ? 'REJECTED / EXPIRED' : 'VERIFIED ONBOARD'}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setSelectedPassenger(null)}>
              <Text style={styles.modalPrimaryBtnText}>Close Record</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 11. COMPLETE TRIP CONFIRMATION MODAL */}
      <Modal visible={showEndTripModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="flag-checkered" size={20} color="#EA580C" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Complete & End Trip #42?</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEndTripModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmSubText}>
              Review the finalized trip summary metrics before closing the passenger manifest:
            </Text>

            <View style={styles.confirmMetricsBox}>
              <View style={styles.confirmMetricRow}>
                <Text style={styles.confirmMetricLabel}>Passengers Boarded:</Text>
                <Text style={styles.confirmMetricVal}>{occupiedCount} Passengers</Text>
              </View>
              <View style={styles.confirmMetricRow}>
                <Text style={styles.confirmMetricLabel}>Digital QR Tickets:</Text>
                <Text style={styles.confirmMetricVal}>{digitalCount} Validated</Text>
              </View>
              <View style={styles.confirmMetricRow}>
                <Text style={styles.confirmMetricLabel}>Cash Fares Collected:</Text>
                <Text style={styles.confirmMetricVal}>{cashCount} Fares ($10.00)</Text>
              </View>
              <View style={styles.confirmMetricRow}>
                <Text style={styles.confirmMetricLabel}>Failed / Rejected Scans:</Text>
                <Text style={styles.confirmMetricVal}>{failedCount} Exceptions</Text>
              </View>
              <View style={styles.confirmMetricRow}>
                <Text style={styles.confirmMetricLabel}>Active Trip Duration:</Text>
                <Text style={styles.confirmMetricVal}>{formatDuration(durationMinutes)}</Text>
              </View>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowEndTripModal(false)}
                disabled={isEndingTrip}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmEndBtn}
                onPress={handleConfirmEndTrip}
                disabled={isEndingTrip}
              >
                {isEndingTrip ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmEndBtnText}>Confirm & End</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 12. EXPORT MANIFEST & REPORT ISSUE MODAL */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trip Operations Tools</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Quick Export Manifest Button */}
            <TouchableOpacity style={styles.exportActionCard} onPress={handleExportManifest}>
              <View style={styles.exportIconBox}>
                <Feather name="file-text" size={20} color="#0D9488" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exportCardTitle}>Export Manifest CSV Report</Text>
                <Text style={styles.exportCardSub}>Download complete passenger & fare audit table</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Issue Reporting Form */}
            <View style={styles.issueFormSection}>
              <Text style={styles.issueSectionTitle}>Report Incident / Discrepancy</Text>

              <Text style={styles.issueFieldLabel}>ISSUE CATEGORY</Text>
              <View style={styles.issueTypePills}>
                {['Incorrect fare', 'Missing passenger', 'Duplicate card', 'Scanner fault'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.issuePill, issueType === cat && styles.issuePillActive]}
                    onPress={() => setIssueType(cat)}
                  >
                    <Text style={[styles.issuePillText, issueType === cat && styles.issuePillTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.issueFieldLabel}>DESCRIPTION</Text>
              <TextInput
                style={styles.issueTextInput}
                value={issueDescription}
                onChangeText={setIssueDescription}
                placeholder="Describe manifest irregularity or equipment glitch..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.submitIssueBtn}
                onPress={handleSubmitIssue}
                disabled={isSubmittingIssue}
              >
                {isSubmittingIssue ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitIssueBtnText}>Transmit Incident Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 13. BOTTOM NAVIGATION BAR */}
      {!embedded && <DashboardBottomNav currentTab="passengers" onSelectTab={handleSelectTab} />}
    </RootContainer>
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  headerProfileBtn: {
    padding: 4,
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

  // Top Trip Summary Card
  tripSummaryCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  tripSummaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activeDispatchBadge: {
    backgroundColor: '#A7F3D0',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeDispatchText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  arrivingBlock: {
    alignItems: 'flex-end',
  },
  arrivingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    marginBottom: 2,
  },
  arrivingPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  terminalEtaText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  tripSummaryTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  tripSummarySubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Occupancy Card
  occupancyCard: {
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
  occupancyCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  occupancyTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  occupancyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0F2942',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  occupancyTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  occupancySubText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  occupancyStatusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  occupancyStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headcountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  headcountLarge: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },
  headcountTotal: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  headcountPercentage: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  occupancyFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatsRemainingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsRemainingText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0D9488',
  },
  standingRoomText: {
    fontSize: 11,
    color: '#64748B',
  },

  // 2x2 Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statCardLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  statCardNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  statCardTrend: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#10B981',
  },
  statCardSubTeal: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0D9488',
  },
  statCardSubGray: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#64748B',
  },

  // Schedule Timer Card
  scheduleTimerCard: {
    backgroundColor: '#0F2942',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTimerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerClockBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#083344',
    borderWidth: 1,
    borderColor: '#0E7490',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  shiftStartText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  durationLargeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  onSchedulePill: {
    backgroundColor: '#072F4F',
    borderWidth: 1,
    borderColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  onScheduleText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },

  // Manifest Header & Search
  manifestSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  manifestTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  manifestRecordedCount: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },

  // Filter Tabs
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  filterTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Manifest List Items
  manifestList: {
    gap: 8,
    marginBottom: 16,
  },
  manifestItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemIconCircleBlue: {
    backgroundColor: '#DBEAFE',
  },
  itemIconCircleOrange: {
    backgroundColor: '#FFEDD5',
  },
  itemCenterInfo: {
    flex: 1,
  },
  ticketPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  itemTicketId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemTypeBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  itemTypeBadgeRed: {
    backgroundColor: '#FEE2E2',
  },
  itemTypeBadgeBlue: {
    backgroundColor: '#DBEAFE',
  },
  itemTypeBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  itemTypeBadgeTextRed: {
    color: '#DC2626',
  },
  itemTypeBadgeTextBlue: {
    color: '#1D4ED8',
  },
  itemStopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemStopText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  itemRightStatus: {
    alignItems: 'flex-end',
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    marginBottom: 2,
  },
  statusPillRed: {
    backgroundColor: '#FEE2E2',
  },
  statusPillBlue: {
    backgroundColor: '#DBEAFE',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  statusPillTextRed: {
    color: '#DC2626',
  },
  statusPillTextBlue: {
    color: '#1D4ED8',
  },
  statusSubText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 2,
  },
  emptyStateSub: {
    fontSize: 11,
    color: '#64748B',
  },

  // Action Buttons
  endTripButton: {
    backgroundColor: '#EA580C',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  endTripButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  downloadReportButton: {
    backgroundColor: '#FFFFFF',
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0D9488',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadReportButtonText: {
    color: '#0D9488',
    fontSize: 13.5,
    fontWeight: '700',
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
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
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    gap: 8,
    marginBottom: 16,
  },
  modalFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFieldLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  modalFieldValue: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  modalPrimaryBtn: {
    backgroundColor: '#0F2942',
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  confirmSubText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
  },
  confirmMetricsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  confirmMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmMetricLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  confirmMetricVal: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '700',
  },
  modalActionsRow: {
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
  modalConfirmEndBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmEndBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  exportActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    padding: 12,
    marginBottom: 16,
  },
  exportIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  exportCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  exportCardSub: {
    fontSize: 11,
    color: '#0D9488',
    marginTop: 1,
  },
  issueFormSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  issueSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  issueFieldLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  issueTypePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  issuePill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  issuePillActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  issuePillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  issuePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  issueTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 12.5,
    color: '#0F172A',
    height: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitIssueBtn: {
    backgroundColor: '#0F2942',
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitIssueBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
