import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { useStaffAuth } from '@/context/StaffAuthContext';
import { tripApi } from '@/services/api/tripApi';
import {
  TripData,
  DelayReportPayload,
  DispatchAlertPayload,
  ScanValidationResponse,
} from '@/types/trip';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TripStatusCard } from '@/components/dashboard/TripStatusCard';
import { RouteInfoCard } from '@/components/dashboard/RouteInfoCard';
import { ScanActionCard } from '@/components/dashboard/ScanActionCard';
import { CapacityStatsCard } from '@/components/dashboard/CapacityStatsCard';
import { ActionButtonsRow } from '@/components/dashboard/ActionButtonsRow';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import {
  DashboardBottomNav,
  DashboardTab,
} from '@/components/dashboard/DashboardBottomNav';

import { TicketScannerModal } from '@/components/dashboard/TicketScannerModal';
import { DelayReportModal } from '@/components/dashboard/DelayReportModal';
import { DispatchModal } from '@/components/dashboard/DispatchModal';
import { EndTripModal } from '@/components/dashboard/EndTripModal';
import { CashFareModal } from '@/components/dashboard/CashFareModal';

import { PassengersView } from '@/components/dashboard/tabs/PassengersView';
import { ActivityView } from '@/components/dashboard/tabs/ActivityView';
import { ProfileView } from '@/components/dashboard/tabs/ProfileView';

export function StaffDashboardScreen() {
  const { user, logout, isNetworkOffline } = useStaffAuth();

  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<DashboardTab>('dashboard');

  // Modals
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);
  const [scannerMode, setScannerMode] = useState<'QR' | 'NFC'>('QR');
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [showEndTripModal, setShowEndTripModal] = useState<boolean>(false);
  const [showCashFareModal, setShowCashFareModal] = useState<boolean>(false);

  // Initialize and subscribe to real-time trip state
  useEffect(() => {
    let mounted = true;

    async function loadInitialTrip() {
      try {
        const driverName = user?.name ? `Driver ${user.name}` : undefined;
        const initial = await tripApi.getActiveTrip(driverName);
        if (mounted) {
          setTrip(initial);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) setLoading(false);
      }
    }

    loadInitialTrip();

    // Real-time WebSocket / event subscription
    const unsubscribe = tripApi.subscribeTripUpdates((updated) => {
      if (mounted) {
        setTrip(updated);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [user]);

  // Auth Guard
  if (!user && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.errorTitle}>Authentication Required</Text>
          <Text style={styles.errorSubtitle}>
            Please sign in to the TransitPulse Staff Portal.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle Ticket Validation (QR or NFC)
  const handleValidateTicket = async (
    ticketId: string,
    method: 'QR' | 'NFC' = 'QR'
  ): Promise<ScanValidationResponse> => {
    const res = await tripApi.validateTicket(ticketId, method);
    if (res.updatedTrip) {
      setTrip(res.updatedTrip);
    }
    return res;
  };

  // Handle Cash Fare
  const handleRecordCashFare = async (amount: number) => {
    const updated = await tripApi.recordCashFare(amount);
    setTrip(updated);
  };

  // Handle Delay Report
  const handleSubmitDelay = async (payload: DelayReportPayload) => {
    const updated = await tripApi.reportDelay(payload);
    setTrip(updated);
  };

  // Handle Dispatch Alert
  const handleSendDispatch = async (payload: DispatchAlertPayload) => {
    return await tripApi.sendDispatchMessage(payload);
  };

  // Handle Door Toggle
  const handleToggleDoors = async () => {
    const { doorStatus } = await tripApi.toggleDoors();
    if (trip) {
      setTrip({ ...trip, doorStatus });
    }
  };

  // Handle Stop Advance
  const handleAdvanceStop = async () => {
    const updated = await tripApi.advanceStop();
    setTrip(updated);
  };

  // Handle Occupancy manual +/-
  const handleUpdateOccupancy = async (delta: number) => {
    const updated = await tripApi.updateOccupancy(delta);
    setTrip(updated);
  };

  // Handle End Trip
  const handleConfirmEndTrip = async () => {
    const updated = await tripApi.endTrip();
    setTrip(updated);
    Alert.alert(
      'Trip Concluded',
      `Trip ${updated.id} completed. Shift statistics logged successfully.`,
      [{ text: 'OK' }]
    );
  };

  // Handle Logout
  const handleLogout = async () => {
    Alert.alert(
      'End Shift & Logout',
      'Are you sure you want to log out of the vehicle terminal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/staff/login' as any);
          },
        },
      ]
    );
  };

  if (loading || !trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#0F2942" />
          <Text style={styles.loadingText}>Initializing Terminal Onboard Feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* 1. Top Header: TransitOps • Bus #4028 | Driver M. Kavi • Line 42 Colombo */}
      <DashboardHeader
        trip={trip}
        onRefresh={async () => {
          const fresh = await tripApi.getActiveTrip();
          setTrip(fresh);
        }}
        onProfilePress={() => setCurrentTab('profile')}
        isConnected={!isNetworkOffline}
      />

      {/* 2. Main Content Views by Tab */}
      {currentTab === 'dashboard' && (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* A. Trip Status Row: ● Trip Status: Active | Sched. On Time */}
          <TripStatusCard
            tripStatus={trip.tripStatus}
            scheduleStatus={trip.scheduleStatus}
            delayMinutes={trip.delayMinutes}
          />

          {/* B. Route & Stops Card: LINE 42 Market Square → Univ. Cit | Current & Next Stops */}
          <RouteInfoCard
            trip={trip}
            onToggleDoors={handleToggleDoors}
            onAdvanceStop={handleAdvanceStop}
          />

          {/* C. Primary Action: SCAN PASSENGER TICKET (with NFC button) */}
          <ScanActionCard
            onScanPress={() => {
              setScannerMode('QR');
              setShowScannerModal(true);
            }}
            onNfcPress={() => {
              setScannerMode('NFC');
              setShowScannerModal(true);
            }}
          />

          {/* D. Vehicle Capacity Card: 38 / 55 Seats, 69% Medium, 3 stats, Shift Total */}
          <CapacityStatsCard
            trip={trip}
            onCashFarePress={() => setShowCashFareModal(true)}
            onDigitalQrPress={() => setCurrentTab('activity')}
            onPendingPress={() => setCurrentTab('activity')}
            onOccupancyChange={handleUpdateOccupancy}
          />

          {/* E. Action Buttons Row: Report Delay | Dispatch | End Trip */}
          <ActionButtonsRow
            onReportDelay={() => setShowDelayModal(true)}
            onDispatch={() => setShowDispatchModal(true)}
            onEndTrip={() => setShowEndTripModal(true)}
          />

          {/* F. Recent Activity: Real-time Feed with PASS / REJECT tickets */}
          <RecentActivityFeed
            activity={trip.recentActivity}
            onViewAll={() => setCurrentTab('activity')}
          />
        </ScrollView>
      )}

      {currentTab === 'scanner' && (
        <View style={styles.tabContentWrapper}>
          <TicketScannerModal
            visible={true}
            onClose={() => setCurrentTab('dashboard')}
            onValidateTicket={handleValidateTicket}
            mode="QR"
          />
        </View>
      )}

      {currentTab === 'passengers' && (
        <PassengersView
          trip={trip}
          onUpdateOccupancy={handleUpdateOccupancy}
        />
      )}

      {currentTab === 'activity' && (
        <ActivityView activity={trip.recentActivity} />
      )}

      {currentTab === 'profile' && (
        <ProfileView
          user={user}
          trip={trip}
          onLogout={handleLogout}
          onSwitchToPassenger={() => router.push('/' as any)}
        />
      )}

      {/* 3. Bottom Navigation: Dashboard | Scanner | Passengers | Activity | Profile */}
      <DashboardBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'scanner') {
            setScannerMode('QR');
            setShowScannerModal(true);
          } else {
            setCurrentTab(tab);
          }
        }}
      />

      {/* Modals */}
      <TicketScannerModal
        visible={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onValidateTicket={handleValidateTicket}
        mode={scannerMode}
      />

      <DelayReportModal
        visible={showDelayModal}
        onClose={() => setShowDelayModal(false)}
        onSubmitDelay={handleSubmitDelay}
      />

      <DispatchModal
        visible={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        onSendDispatch={handleSendDispatch}
        busNumber={trip.busNumber}
      />

      <EndTripModal
        visible={showEndTripModal}
        onClose={() => setShowEndTripModal(false)}
        onConfirmEndTrip={handleConfirmEndTrip}
        trip={trip}
      />

      <CashFareModal
        visible={showCashFareModal}
        onClose={() => setShowCashFareModal(false)}
        onRecordCashFare={handleRecordCashFare}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  tabContentWrapper: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
});
