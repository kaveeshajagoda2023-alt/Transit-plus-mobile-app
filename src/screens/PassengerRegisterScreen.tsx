import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthInputField } from '@/components/auth/AuthInputField';
import { AuthPasswordField } from '@/components/auth/AuthPasswordField';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthSocialButtons } from '@/components/auth/AuthSocialButtons';
import { OtpVerificationModal } from '@/components/auth/OtpVerificationModal';
import { ConcessionType } from '@/types/auth';
import { usePassengerAuth } from '@/context/PassengerAuthContext';

export function PassengerRegisterScreen() {
  const { register, verifyEmail, socialLogin, isOffline } = usePassengerAuth();

  // Form Fields
  const [fullName, setFullName] = useState('Sara Miller');
  const [email, setEmail] = useState('sara.miller@gmail.com');
  const [phone, setPhone] = useState('(555) 0196 283');
  const [password, setPassword] = useState('CommuterPulse2025#');
  const [concessionType, setConcessionType] = useState<ConcessionType>('STUDENT_YOUTH');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [disruptionAlerts, setDisruptionAlerts] = useState(true);

  // Validation & Error states
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Processing & Modals
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const validate = (): boolean => {
    let isValid = true;
    setFullNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setTermsError(null);
    setGeneralError(null);

    if (!fullName.trim()) {
      setFullNameError('Please enter your full legal name.');
      isValid = false;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError('Please enter a valid commuter email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please create a secure password.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      isValid = false;
    }

    if (!agreeTerms) {
      setTermsError('You must agree to the Transit Bylaws & Privacy Policy to create an account.');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    if (isOffline) {
      setGeneralError('Network offline. Registration requires an internet connection.');
      return;
    }

    setIsLoading(true);
    setGeneralError(null);

    try {
      const response = await register({
        fullName,
        email,
        phone: `+1 ${phone}`,
        password,
        concessionType,
        agreeToTerms: agreeTerms,
        disruptionAlertsEnabled: disruptionAlerts,
      });

      if (response.success) {
        setRegisteredEmail(email);
        setShowOtpModal(true);
      } else {
        setGeneralError(response.error || 'Failed to create account. Please check inputs.');
      }
    } catch {
      setGeneralError('An unexpected server error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string): Promise<boolean> => {
    const res = await verifyEmail(registeredEmail, code);
    return res.success;
  };

  const handleResendOtp = async () => {
    Alert.alert('Verification Code Resent', 'A new 6-digit code has been dispatched to your email.');
  };

  const handleOtpSuccessClose = () => {
    setShowOtpModal(false);
    router.replace('/passenger/home' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.brandRow}>
          <MaterialCommunityIcons name="bus-clock" size={20} color="#0D9488" />
          <Text style={styles.brandTitle}>TransitPulse</Text>
        </View>

        <View style={styles.quickBadge}>
          <Text style={styles.quickBadgeText}>⚡ Easy Tap & Ride in 60s</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Heading */}
          <Text style={styles.heading}>Create TransitPulse Account</Text>
          <Text style={styles.subtitle}>
            Join over 150,000+ daily commuters for seamless travel & fare savings.
          </Text>

          {/* Quick Social Buttons */}
          <AuthSocialButtons
            onApplePress={() => Alert.alert('Apple Quick Signup', 'Authenticating with Apple ID...')}
            onGooglePress={() => Alert.alert('Google Quick Signup', 'Authenticating with Google...')}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or register with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* General Error Banner */}
          {generalError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorBannerText}>{generalError}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <AuthInputField
              label="Full Name *"
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                setFullNameError(null);
              }}
              placeholder="e.g. Sara Miller"
              iconName="user"
              autoCapitalize="words"
              error={fullNameError}
              onClear={() => setFullName('')}
            />

            <AuthInputField
              label="Email Address *"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setEmailError(null);
              }}
              placeholder="e.g. sara@example.com"
              iconName="mail"
              keyboardType="email-address"
              error={emailError}
              onClear={() => setEmail('')}
            />

            <AuthInputField
              label="Mobile Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="(555) 0196 283"
              keyboardType="phone-pad"
              prefix={
                <View style={styles.flagPrefix}>
                  <Text style={styles.flagEmoji}>🇺🇸</Text>
                  <Text style={styles.countryCode}>+1</Text>
                  <Feather name="chevron-down" size={14} color="#64748B" />
                </View>
              }
              helperText="Used for real-time SMS arrival alerts & gate emergency recovery"
            />

            <AuthPasswordField
              label="Password *"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setPasswordError(null);
              }}
              placeholder="CommuterPulse2025#"
              showStrengthMeter
              error={passwordError}
            />

            {/* Concession Pass Type Selector */}
            <View style={styles.concessionSection}>
              <View style={styles.concessionHeaderRow}>
                <Text style={styles.sectionLabel}>FARES / CONCESSION PASS TYPE</Text>
                <Text style={styles.verificationNote}>Verified at checkout</Text>
              </View>

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={[
                    styles.concessionChip,
                    concessionType === 'STANDARD_ADULT' && styles.concessionChipActive,
                  ]}
                  onPress={() => setConcessionType('STANDARD_ADULT')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.concessionChipText,
                      concessionType === 'STANDARD_ADULT' && styles.concessionChipTextActive,
                    ]}
                  >
                    Standard Adult
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.concessionChip,
                    concessionType === 'STUDENT_YOUTH' && styles.concessionChipActive,
                  ]}
                  onPress={() => setConcessionType('STUDENT_YOUTH')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.concessionChipText,
                      concessionType === 'STUDENT_YOUTH' && styles.concessionChipTextActive,
                    ]}
                  >
                    Student / Youth (50% OFF)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.concessionChip,
                    concessionType === 'SENIOR_CONCESSION' && styles.concessionChipActive,
                  ]}
                  onPress={() => setConcessionType('SENIOR_CONCESSION')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.concessionChipText,
                      concessionType === 'SENIOR_CONCESSION' && styles.concessionChipTextActive,
                    ]}
                  >
                    Senior / Disability
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Checkboxes */}
            <View style={styles.checkboxesContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => {
                  setAgreeTerms(!agreeTerms);
                  setTermsError(null);
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={agreeTerms ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={agreeTerms ? '#0D9488' : '#94A3B8'}
                />
                <Text style={styles.checkboxLabel}>
                  I agree to the <Text style={styles.legalLink}>Transit Bylaws</Text> &{' '}
                  <Text style={styles.legalLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {termsError && <Text style={styles.termsErrorText}>{termsError}</Text>}

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setDisruptionAlerts(!disruptionAlerts)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={disruptionAlerts ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={disruptionAlerts ? '#0D9488' : '#94A3B8'}
                />
                <Text style={styles.checkboxLabel}>
                  Receive instant disruption push alerts for my favorite lines & platform changes
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <AuthPrimaryButton
              title="Create Account & Continue"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.submitBtn}
            />

            {/* Sign in footer link */}
            <View style={styles.loginRow}>
              <Text style={styles.alreadyText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/passenger/login' as any)}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        visible={showOtpModal}
        email={registeredEmail}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onClose={handleOtpSuccessClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  quickBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  quickBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0D9488',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 36,
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
    paddingHorizontal: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 12.5,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  flagPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 6,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  flagEmoji: {
    fontSize: 15,
  },
  countryCode: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  concessionSection: {
    marginBottom: 18,
  },
  concessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },
  verificationNote: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  concessionChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  concessionChipActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  concessionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  concessionChipTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  checkboxesContainer: {
    marginBottom: 20,
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  legalLink: {
    color: '#0D9488',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsErrorText: {
    color: '#EF4444',
    fontSize: 11.5,
    marginLeft: 28,
  },
  submitBtn: {
    marginBottom: 16,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alreadyText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
  },
});
