import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { usePassengerAuth } from '@/context/PassengerAuthContext';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { TransitColors } from '@/constants/transitTheme';

export function PassengerProfileScreen() {
  const { user, logout } = usePassengerAuth();

  // Fallback to pre-seeded commuter data if not logged in
  const passenger = {
    name: user?.name || 'Sara Miller',
    email: user?.email || 'sara.miller@gmail.com',
    phone: user?.phone || '+1 (555) 0196 283',
    transitId: user?.id ? `MTA-${user.id.toUpperCase()}` : 'MTA-PAX-84920',
    concession: user?.concessionType || 'STANDARD_ADULT',
    balance: user?.metroPayBalance !== undefined ? user.metroPayBalance : 42.5,
    digitalTicketsCount: user?.digitalTicketsCount ?? 3,
    savedRoutesCount: user?.savedRoutesCount ?? 4,
  };

  // Preference switches
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [autoBrightness, setAutoBrightness] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  // Modals
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Top Up State
  const [topUpAmount, setTopUpAmount] = useState('20');
  const [currentBalance, setCurrentBalance] = useState(passenger.balance);

  // Edit Profile State
  const [editName, setEditName] = useState(passenger.name);
  const [editPhone, setEditPhone] = useState(passenger.phone);

  const handleConfirmTopUp = () => {
    const addVal = parseFloat(topUpAmount);
    if (isNaN(addVal) || addVal <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid top-up amount.');
      return;
    }
    const newBal = currentBalance + addVal;
    setCurrentBalance(newBal);
    setShowTopUpModal(false);
    Alert.alert('Top-Up Successful', `$${addVal.toFixed(2)} added to your MetroPay digital wallet.`);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Full name cannot be blank.');
      return;
    }
    setShowEditProfileModal(false);
    Alert.alert('Profile Updated', 'Your commuter contact information has been saved.');
  };

  const executeSignOut = async () => {
    setShowSignOutModal(false);
    try {
      await logout();
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    router.replace('/passenger/login' as any);
  };

  const getConcessionLabel = (type: string) => {
    switch (type) {
      case 'STUDENT_YOUTH':
        return 'Student / Youth Pass (50% Off)';
      case 'SENIOR_CONCESSION':
        return 'Senior Citizen Fare (Free Off-Peak)';
      default:
        return 'Standard Adult Commuter';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top App Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.appLogoBadge}>
            <Feather name="activity" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.appName}>TransitPulse</Text>
            <Text style={styles.appSub}>Commuter Account Portal</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => setShowEditProfileModal(true)}
          activeOpacity={0.7}
        >
          <Feather name="edit-3" size={18} color={TransitColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Commuter Identity Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {(passenger.name || 'S').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.verifiedDot}>
                <Feather name="check" size={10} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.passengerName}>{passenger.name}</Text>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>VERIFIED</Text>
                </View>
              </View>
              <Text style={styles.passengerEmail}>{passenger.email}</Text>
              <Text style={styles.passengerPhone}>{passenger.phone}</Text>
            </View>
          </View>

          {/* Concession & Transit ID Bar */}
          <View style={styles.concessionBar}>
            <View style={styles.concessionLeft}>
              <MaterialCommunityIcons name="badge-account-outline" size={16} color="#0D9488" />
              <Text style={styles.concessionText}>{getConcessionLabel(passenger.concession)}</Text>
            </View>
            <Text style={styles.transitIdText}>{passenger.transitId}</Text>
          </View>
        </View>

        {/* 2. MetroPay Digital Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletHeaderLeft}>
              <View style={styles.walletIconCircle}>
                <MaterialCommunityIcons name="wallet-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.walletLabel}>MetroPay Digital Transit Wallet</Text>
                <Text style={styles.walletSub}>Contactless NFC & QR Boarding</Text>
              </View>
            </View>

            <View style={styles.nfcPill}>
              <MaterialCommunityIcons name="contactless-payment" size={16} color="#10B981" />
              <Text style={styles.nfcText}>NFC READY</Text>
            </View>
          </View>

          <View style={styles.walletBalanceRow}>
            <View>
              <Text style={styles.balanceSub}>AVAILABLE FARE BALANCE</Text>
              <Text style={styles.balanceAmount}>${currentBalance.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.topUpButton}
              onPress={() => setShowTopUpModal(true)}
              activeOpacity={0.8}
            >
              <Feather name="plus-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.topUpText}>Top Up</Text>
            </TouchableOpacity>
          </View>

          {/* Active Passes Quick Bar */}
          <TouchableOpacity
            style={styles.passesRow}
            onPress={() => router.push('/tickets' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.passesRowLeft}>
              <MaterialCommunityIcons name="ticket-confirmation-outline" size={18} color="#0F2942" />
              <Text style={styles.passesRowText}>
                {passenger.digitalTicketsCount} Active Digital Fare Passes
              </Text>
            </View>
            <View style={styles.passesRowRight}>
              <Text style={styles.viewPassesText}>View Passes</Text>
              <Feather name="chevron-right" size={16} color="#0F2942" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. Travel Statistics Grid */}
        <Text style={styles.sectionHeading}>TRAVEL TELEMETRY & STATS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="navigation" size={18} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>28</Text>
            <Text style={styles.statLabel}>Trips Completed</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <MaterialCommunityIcons name="leaf" size={18} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>14.2 kg</Text>
            <Text style={styles.statLabel}>CO₂ Emissions Saved</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FAF5FF' }]}>
              <Feather name="star" size={18} color="#7C3AED" />
            </View>
            <Text style={styles.statValue}>{passenger.savedRoutesCount}</Text>
            <Text style={styles.statLabel}>Saved Bus/Rail Lines</Text>
          </View>
        </View>

        {/* 4. Commuter Travel Preferences */}
        <Text style={styles.sectionHeading}>COMMUTER PREFERENCES</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>Disruption & Delay Alerts</Text>
              <Text style={styles.settingDesc}>Receive live push notifications for Line 42 detours</Text>
            </View>
            <Switch
              value={alertsEnabled}
              onValueChange={setAlertsEnabled}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={alertsEnabled ? '#2563EB' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>Auto-Brightness for QR Scans</Text>
              <Text style={styles.settingDesc}>Boost screen light automatically at turnstiles</Text>
            </View>
            <Switch
              value={autoBrightness}
              onValueChange={setAutoBrightness}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={autoBrightness ? '#2563EB' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>Biometric Pass Security</Text>
              <Text style={styles.settingDesc}>Require Face ID / Fingerprint before fare release</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={biometricsEnabled ? '#2563EB' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* 5. Staff Portal Card */}
        <View style={styles.staffPortalCard}>
          <View style={styles.staffCardHeader}>
            <View style={styles.staffBadgeIcon}>
              <Feather name="shield" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.staffCardTitle}>TransitPulse Staff Portal</Text>
              <Text style={styles.staffCardSub}>
                Authorized Drivers, Conductors & MTA Dispatch Terminal
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.staffLaunchBtn}
            onPress={() => router.push('/staff/login' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.staffLaunchText}>Open Staff Terminal Login</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 6. Account Actions & Sign Out */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.roleSwitchBtn}
            onPress={() => router.push('/role-selection' as any)}
            activeOpacity={0.8}
          >
            <Feather name="refresh-cw" size={16} color="#475569" style={{ marginRight: 8 }} />
            <Text style={styles.roleSwitchText}>Switch Role / Account Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => setShowSignOutModal(true)}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={17} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={styles.signOutText}>Sign Out of Passenger Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          TransitPulse v4.8.2 • Metro Transit Authority (MTA) • All rights reserved
        </Text>
      </ScrollView>

      {/* MODAL 1: Top Up MetroPay Wallet */}
      <Modal visible={showTopUpModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="wallet-plus" size={22} color="#0F2942" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Top Up MetroPay Wallet</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTopUpModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubText}>
              Current Balance: <Text style={{ fontWeight: '800', color: '#0F172A' }}>${currentBalance.toFixed(2)}</Text>
            </Text>

            <View style={styles.presetButtonsRow}>
              {['10', '20', '50', '100'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.presetBtn, topUpAmount === amt && styles.presetBtnActive]}
                  onPress={() => setTopUpAmount(amt)}
                >
                  <Text style={[styles.presetBtnText, topUpAmount === amt && styles.presetBtnTextActive]}>
                    ${amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>CUSTOM AMOUNT ($ USD)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              placeholder="e.g. 25.00"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowTopUpModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleConfirmTopUp}
              >
                <Text style={styles.modalPrimaryText}>Confirm Top Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Edit Commuter Profile */}
      <Modal visible={showEditProfileModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Commuter Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfileModal(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter full name"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>PHONE NUMBER</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="phone-pad"
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowEditProfileModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalPrimaryText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: Sign Out Confirmation */}
      <Modal visible={showSignOutModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: 360 }]}>
            <View style={{ alignItems: 'center', marginVertical: 12 }}>
              <View style={styles.signOutIconCircle}>
                <Feather name="log-out" size={26} color="#DC2626" />
              </View>
              <Text style={styles.signOutModalTitle}>Sign Out of TransitPulse?</Text>
              <Text style={styles.signOutModalSub}>
                Are you sure you want to sign out of {passenger.name}'s account? Your passes and MetroPay balance will remain saved.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { flex: 1, paddingVertical: 13 }]}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmSignOutBtn}
                onPress={executeSignOut}
              >
                <Text style={styles.confirmSignOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Tab Bar */}
      <BottomNavigation currentTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appLogoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0F2942',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  appSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 28,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
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
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F2942',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  passengerName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  passengerEmail: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  passengerPhone: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  concessionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
  },
  concessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  concessionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F766E',
  },
  transitIdText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  walletCard: {
    backgroundColor: '#0F2942',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0F2942',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  walletSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  nfcPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  nfcText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#10B981',
  },
  walletBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceSub: {
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: '700',
    color: '#94A3B8',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  topUpText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  passesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  passesRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passesRowText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  passesRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewPassesText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0D9488',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 6,
    marginBottom: 8,
    marginLeft: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  staffPortalCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  staffCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  staffBadgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0F2942',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  staffCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  staffLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2942',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 8,
  },
  staffLaunchText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionButtonsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  roleSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
  },
  roleSwitchText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 12,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  footerNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  presetBtnActive: {
    borderColor: '#0F2942',
    backgroundColor: '#0F2942',
  },
  presetBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#334155',
  },
  presetBtnTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  modalPrimaryBtn: {
    flex: 1,
    backgroundColor: '#0F2942',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalPrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  signOutIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  signOutModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  signOutModalSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  confirmSignOutBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmSignOutText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
