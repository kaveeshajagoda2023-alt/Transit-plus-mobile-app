import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
} from '@expo/vector-icons';

import { useStaffAuth } from '@/context/StaffAuthContext';
import { StaffTerminalHeader } from '@/components/staff/StaffTerminalHeader';
import { TerminalStatusBar } from '@/components/staff/TerminalStatusBar';
import { AuthStateTabs } from '@/components/staff/AuthStateTabs';
import { StaffErrorBanner } from '@/components/staff/StaffErrorBanner';
import { NfcScanModal } from '@/components/staff/NfcScanModal';
import { ForgotPasswordModal } from '@/components/staff/ForgotPasswordModal';
import { FederalNoticeCard } from '@/components/staff/FederalNoticeCard';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

export function StaffLoginScreen() {
  const {
    terminalStatus,
    activeTab,
    setActiveTab,
    errorMessage,
    setErrorMessage,
    rememberMe,
    setRememberMe,
    savedIdentifier,
    isAuthenticating,
    login,
    loginWithNfc,
    refreshTerminalStatus,
    toggleSimulatedOffline,
    isNetworkOffline,
  } = useStaffAuth();

  // Input states
  const [identifier, setIdentifier] = useState(savedIdentifier || 'DRV-84920@transitpulse.gov');
  const [password, setPassword] = useState('TransitSecure2024!');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Modals
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showDevCredentials, setShowDevCredentials] = useState(false);

  useEffect(() => {
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
    }
  }, [savedIdentifier]);

  // Client-side validations
  const validateInputs = (): boolean => {
    let isValid = true;
    setIdentifierError(null);
    setPasswordError(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setIdentifierError('Staff ID or MTA work email is required');
      isValid = false;
    } else if (cleanId.includes('@') && !cleanId.includes('.')) {
      setIdentifierError('Enter a valid work email or MTA Staff ID');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Staff password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (isAuthenticating) return;

    if (!validateInputs()) {
      setActiveTab('error');
      setErrorMessage('Please correct validation errors before submitting.');
      return;
    }

    const res = await login({
      identifier: identifier.trim(),
      password,
      rememberMe,
    });

    if (res.success && res.user) {
      // Role-based routing
      router.replace('/staff/dashboard' as any);
    }
  };

  const handleNfcBadgeScanned = async (badgeId: string) => {
    const res = await loginWithNfc(badgeId);
    if (res.success && res.user) {
      router.replace('/staff/dashboard' as any);
    }
  };

  const handleFillCredential = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setIdentifierError(null);
    setPasswordError(null);
    setErrorMessage(null);
    setActiveTab('normal');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* 1. Header (TransitOps • Bus #4028 | Metro Transit Authority) */}
      <StaffTerminalHeader
        status={terminalStatus}
        onRefresh={refreshTerminalStatus}
        onToggleOffline={toggleSimulatedOffline}
      />

      {/* 2. Sub-header (TERMINAL READY • DISPATCH ZONE 4 | v4.8.2-ops) */}
      <TerminalStatusBar status={terminalStatus} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 3. Security Pill: SECURE VEHICLE ONBOARD TERMINAL */}
          <View style={styles.securityPillRow}>
            <View style={styles.securityPill}>
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={14}
                color="#1D4ED8"
              />
              <Text style={styles.securityPillText}>
                SECURE VEHICLE ONBOARD TERMINAL
              </Text>
            </View>
          </View>

          {/* 4. Portal Title & Subtitle */}
          <Text style={styles.portalTitle}>TransitPulse Staff Portal</Text>
          <Text style={styles.portalSubtitle}>
            Official Transit Staff & Conductor Access Only
          </Text>

          {/* 5. Interactive State Switcher Tabs */}
          <AuthStateTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isAuthenticating={isAuthenticating}
          />

          {/* 6. Error Banner (shown dynamically when in error state) */}
          {(activeTab === 'error' || errorMessage) && (
            <StaffErrorBanner
              message={errorMessage}
              onDismiss={() => {
                setErrorMessage(null);
                setActiveTab('normal');
              }}
              onRetry={handleLogin}
            />
          )}

          {/* 7. Main Login Card */}
          <View style={styles.loginCard}>
            {/* Field 1: Staff ID or Work Email */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Staff ID or Work Email</Text>
                <Text style={styles.fieldHint}>Badge ID / MTA Domain</Text>
              </View>

              <View
                style={[
                  styles.inputBox,
                  identifierError && styles.inputBoxError,
                  activeTab === 'authenticating' && styles.inputBoxDisabled,
                ]}
              >
                <MaterialCommunityIcons
                  name="badge-account-outline"
                  size={20}
                  color={identifierError ? '#DC2626' : '#64748B'}
                  style={styles.inputLeftIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="DRV-84920@transitpulse.gov"
                  placeholderTextColor="#94A3B8"
                  value={identifier}
                  onChangeText={(val) => {
                    setIdentifier(val);
                    if (identifierError) setIdentifierError(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isAuthenticating && activeTab !== 'authenticating'}
                  accessibilityLabel="Staff ID or Work Email"
                />
                {identifier.length > 0 && !isAuthenticating && (
                  <TouchableOpacity
                    onPress={() => setIdentifier('')}
                    style={styles.clearBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Clear Staff ID"
                  >
                    <Feather name="x-circle" size={17} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
              {identifierError && (
                <Text style={styles.inlineError}>{identifierError}</Text>
              )}
            </View>

            {/* Field 2: Staff Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Staff Password</Text>
                <Text style={styles.fieldHint}>6-16 Alphanumeric</Text>
              </View>

              <View
                style={[
                  styles.inputBox,
                  passwordError && styles.inputBoxError,
                  activeTab === 'authenticating' && styles.inputBoxDisabled,
                ]}
              >
                <Feather
                  name="lock"
                  size={19}
                  color={passwordError ? '#DC2626' : '#64748B'}
                  style={styles.inputLeftIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="TransitSecure2024!"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (passwordError) setPasswordError(null);
                  }}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isAuthenticating && activeTab !== 'authenticating'}
                  accessibilityLabel="Staff Password"
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeBtn}
                  accessibilityRole="button"
                  accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                >
                  <Feather
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              {passwordError && (
                <Text style={styles.inlineError}>{passwordError}</Text>
              )}
            </View>

            {/* Options Row: Remember Me & Forgot Password? */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
                accessibilityLabel="Remember Me on this terminal"
              >
                <View
                  style={[
                    styles.checkboxBox,
                    rememberMe && styles.checkboxBoxChecked,
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.rememberText}>Remember Me on this terminal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowForgotModal(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Forgot Password"
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Main Button: Secure Terminal Login */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (isAuthenticating || activeTab === 'authenticating') &&
                  styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isAuthenticating || activeTab === 'authenticating'}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Secure Terminal Login"
            >
              {isAuthenticating || activeTab === 'authenticating' ? (
                <View style={styles.buttonLoadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Authenticating Terminal...</Text>
                </View>
              ) : (
                <View style={styles.buttonContentRow}>
                  <MaterialCommunityIcons name="login" size={19} color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Secure Terminal Login</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider: OR OPERATOR NFC KEY */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR OPERATOR NFC KEY</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* NFC Key Button: Tap Physical Conductor Badge */}
            <TouchableOpacity
              style={[
                styles.nfcButton,
                (isAuthenticating || activeTab === 'authenticating') &&
                  styles.nfcButtonDisabled,
              ]}
              onPress={() => setShowNfcModal(true)}
              disabled={isAuthenticating || activeTab === 'authenticating'}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Tap Physical Conductor Badge"
            >
              <Ionicons name="radio-outline" size={19} color="#0D9488" />
              <Text style={styles.nfcButtonText}>Tap Physical Conductor Badge</Text>
            </TouchableOpacity>
          </View>

          {/* 8. Federal & State Compliance Notice */}
          <FederalNoticeCard />

          {/* 9. Interactive Development Test Drawer */}
          <View style={styles.devBarContainer}>
            <TouchableOpacity
              style={styles.devBarToggle}
              onPress={() => setShowDevCredentials(!showDevCredentials)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="shield-account" size={16} color="#64748B" />
              <Text style={styles.devBarToggleText}>
                {showDevCredentials ? 'Hide Test Accounts & Telemetry' : 'Quick Test Accounts & Telemetry'}
              </Text>
              <Feather
                name={showDevCredentials ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#64748B"
              />
            </TouchableOpacity>

            {showDevCredentials && (
              <View style={styles.devCredentialsCard}>
                <Text style={styles.devTitle}>Quick Authorized Test Accounts:</Text>

                <View style={styles.devButtonsGrid}>
                  <TouchableOpacity
                    style={styles.devQuickBtn}
                    onPress={() => handleFillCredential('DRV-84920@transitpulse.gov', 'TransitSecure2024!')}
                  >
                    <Text style={styles.devBtnTitle}>Driver (Marcus Vance)</Text>
                    <Text style={styles.devBtnSub}>DRV-84920 • Bus #4028</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.devQuickBtn}
                    onPress={() => handleFillCredential('cnd.rostova@transitpulse.gov', 'ConductorPass2024!')}
                  >
                    <Text style={styles.devBtnTitle}>Conductor (Elena Rostova)</Text>
                    <Text style={styles.devBtnSub}>CND-55219 • Lead</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.devQuickBtn}
                    onPress={() => handleFillCredential('dispatch.sterling@transitpulse.gov', 'DispatchHQ2024!')}
                  >
                    <Text style={styles.devBtnTitle}>Dispatcher (David S.)</Text>
                    <Text style={styles.devBtnSub}>DSP-10382 • Zone 4</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.devQuickBtn}
                    onPress={() => handleFillCredential('admin.chen@transitpulse.gov', 'AdminTransit2024!')}
                  >
                    <Text style={styles.devBtnTitle}>Admin (Sarah Chen)</Text>
                    <Text style={styles.devBtnSub}>ADM-99001 • Security</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.devQuickBtn, styles.devQuickBtnWarn]}
                    onPress={() => handleFillCredential('passenger.john@gmail.com', 'Passenger123!')}
                  >
                    <Text style={[styles.devBtnTitle, { color: '#B45309' }]}>Passenger (Denied Test)</Text>
                    <Text style={styles.devBtnSub}>Unauthorized Role</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.devQuickBtn, styles.devQuickBtnDanger]}
                    onPress={() => handleFillCredential('suspended.staff@transitpulse.gov', 'Password123!')}
                  >
                    <Text style={[styles.devBtnTitle, { color: '#B91C1C' }]}>Suspended Account</Text>
                    <Text style={styles.devBtnSub}>DRV-99999 • Locked</Text>
                  </TouchableOpacity>
                </View>

                {/* Network connectivity toggle */}
                <View style={styles.networkToggleRow}>
                  <Text style={styles.networkLabel}>
                    Server Status: {isNetworkOffline ? 'SIMULATED OFFLINE' : 'CONNECTED (18ms)'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.offlineToggleBtn, isNetworkOffline && styles.offlineToggleActive]}
                    onPress={toggleSimulatedOffline}
                  >
                    <Text style={styles.offlineToggleText}>
                      {isNetworkOffline ? 'Restore Network' : 'Test Network Failure'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* NFC Scan Modal */}
      <NfcScanModal
        visible={showNfcModal}
        onClose={() => setShowNfcModal(false)}
        onBadgeScanned={handleNfcBadgeScanned}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultIdentifier={identifier}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    paddingTop: 16,
    paddingBottom: 32,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  securityPillRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBF2FE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  securityPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  portalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0A1C2E',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  portalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginTop: 6,
    ...TransitShadows.card,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  fieldHint: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputBoxDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.7,
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  eyeBtn: {
    padding: 6,
  },
  inlineError: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.8,
    borderColor: '#0F2942',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxChecked: {
    backgroundColor: '#0F2942',
  },
  rememberText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#334155',
  },
  forgotText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0D9488',
  },
  loginButton: {
    height: 52,
    backgroundColor: '#0F2942',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#64748B',
    opacity: 0.7,
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  nfcButton: {
    height: 50,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nfcButtonDisabled: {
    opacity: 0.5,
  },
  nfcButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '800',
  },
  devBarContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  devBarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
  },
  devBarToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    flex: 1,
    marginLeft: 8,
  },
  devCredentialsCard: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  devTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  devButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  devQuickBtn: {
    width: '48%',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  devQuickBtnWarn: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  devQuickBtnDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  devBtnTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  devBtnSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  networkToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  networkLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  offlineToggleBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  offlineToggleActive: {
    backgroundColor: '#EF4444',
  },
  offlineToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
});
