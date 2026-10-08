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
import { usePassengerAuth } from '@/context/PassengerAuthContext';
import { passengerAuthApi } from '@/services/api/passengerAuthApi';

export function PassengerLoginScreen() {
  const { login, socialLogin, isOffline, setOffline } = usePassengerAuth();

  const [identifier, setIdentifier] = useState('sara.miller@gmail.com');
  const [password, setPassword] = useState('CommuterPulse2025#');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<'APPLE' | 'GOOGLE' | null>(
    null
  );
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = (): boolean => {
    let isValid = true;
    setIdentifierError(null);
    setPasswordError(null);
    setGeneralError(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setIdentifierError('Please enter your Transit ID or email address.');
      isValid = false;
    } else if (cleanId.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId)) {
      setIdentifierError('Please enter a valid email format.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    if (isOffline) {
      setGeneralError('Network offline. Check data connection or toggle sandbox network.');
      return;
    }

    setIsLoading(true);
    setGeneralError(null);

    try {
      const response = await login({
        identifier,
        password,
        rememberMe: rememberDevice,
      });

      if (response.success && response.user) {
        router.replace('/passenger/home' as any);
      } else {
        setGeneralError(response.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setGeneralError('An unexpected server error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'APPLE' | 'GOOGLE') => {
    setSocialLoadingProvider(provider);
    setGeneralError(null);

    try {
      const res = await socialLogin(provider);
      if (res.success && res.user) {
        router.replace('/passenger/home' as any);
      } else {
        setGeneralError(res.error || `Unable to authenticate with ${provider}.`);
      }
    } catch {
      setGeneralError('Social login error occurred.');
    } finally {
      setSocialLoadingProvider(null);
    }
  };

  const handleForgotPassword = async () => {
    if (!identifier.trim()) {
      Alert.alert(
        'Forgot Password',
        'Please enter your email in the field above to receive a recovery link.'
      );
      return;
    }

    const res = await passengerAuthApi.requestPasswordReset(identifier);
    if (res.success) {
      Alert.alert('Reset Link Sent', res.message);
    } else {
      Alert.alert('Reset Failed', res.error || 'Unable to send recovery email.');
    }
  };

  const handleBiometricPrompt = () => {
    Alert.alert(
      'Biometric Fast-Pass',
      'Face ID / Fingerprint sensor ready for Sara Miller. Tap Sign In to proceed.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header Row */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>

        {/* Real-time Status Badge */}
        <TouchableOpacity
          style={[styles.statusBadge, isOffline && styles.statusBadgeOffline]}
          onPress={() => setOffline(!isOffline)}
          activeOpacity={0.8}
        >
          <View style={[styles.statusDot, isOffline && styles.statusDotOffline]} />
          <Text style={[styles.statusText, isOffline && styles.statusTextOffline]}>
            {isOffline ? 'OFFLINE SIMULATOR' : 'METRO OPS: ACTIVE'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* App Emblem */}
          <View style={styles.logoContainer}>
            <View style={styles.logoSquare}>
              <MaterialCommunityIcons name="bus-clock" size={28} color="#00F0FF" />
            </View>
          </View>

          {/* Heading */}
          <Text style={styles.heading}>Welcome Back to TransitPulse</Text>
          <Text style={styles.subheading}>
            Sign in to access your digital tickets, saved lines, and MetroPay balance.
          </Text>

          {/* General Error Banner */}
          {generalError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorBannerText}>{generalError}</Text>
            </View>
          )}

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            <AuthInputField
              label="Transit ID or Email"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setIdentifierError(null);
              }}
              placeholder="sara.miller@gmail.com"
              iconName="mail"
              keyboardType="email-address"
              error={identifierError}
              onClear={() => setIdentifier('')}
            />

            <AuthPasswordField
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(null);
              }}
              placeholder="CommuterPulse2025#"
              error={passwordError}
              onForgotPassword={handleForgotPassword}
            />

            {/* Options Row (Remember Device & Biometrics) */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberDevice(!rememberDevice)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={rememberDevice ? 'checkbox' : 'square-outline'}
                  size={19}
                  color={rememberDevice ? '#0D9488' : '#94A3B8'}
                />
                <Text style={styles.rememberText}>Remember this device</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.biometricBadge}
                onPress={handleBiometricPrompt}
                activeOpacity={0.8}
              >
                <Ionicons name="finger-print" size={16} color="#0D9488" />
                <Text style={styles.biometricText}>Biometrics active</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Action Button */}
            <AuthPrimaryButton
              title="Sign In"
              onPress={handleSignIn}
              loading={isLoading}
              style={styles.signInButton}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social SSO Buttons */}
            <AuthSocialButtons
              onApplePress={() => handleSocialLogin('APPLE')}
              onGooglePress={() => handleSocialLogin('GOOGLE')}
              isLoading={Boolean(socialLoadingProvider)}
              activeProvider={socialLoadingProvider}
            />

            {/* Encryption notice */}
            <View style={styles.encryptionRow}>
              <Feather name="shield" size={12} color="#64748B" />
              <Text style={styles.encryptionText}>
                Protected via 256-bit transit network encryption
              </Text>
            </View>

            {/* Bottom Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.noAccountText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/passenger/register' as any)}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
  },
  statusBadgeOffline: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  statusDotOffline: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.4,
  },
  statusTextOffline: {
    color: '#DC2626',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoSquare: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#0B2545',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B2545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
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
    marginBottom: 16,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '500',
  },
  biometricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  biometricText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D9488',
  },
  signInButton: {
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
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
  encryptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  encryptionText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noAccountText: {
    fontSize: 13,
    color: '#64748B',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
  },
});
