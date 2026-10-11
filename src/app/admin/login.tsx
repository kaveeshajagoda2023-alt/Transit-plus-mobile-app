import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Lock, Eye, EyeOff, Fingerprint, UserCheck, AlertCircle } from 'lucide-react-native';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

export default function AdminLoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState('Transport Coordinator');
  const [isRegistering, setIsRegistering] = useState(false);
  const [staffId, setStaffId] = useState('CDR-8910@transitpulse.gov');
  const [passcode, setPasscode] = useState('••••••••');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = () => {
    if (!staffId) {
      setErrorMsg('Please enter your official Staff ID.');
      return;
    }
    // Authenticate and navigate to Admin Dashboard
    router.replace('/admin/dashboard');
  };

  const handleQuickLogin = () => {
    router.replace('/admin/dashboard');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={32} color="#fff" />
          </View>
          <Text style={styles.title}>
            Transit<Text style={styles.titleHighlight}>Plus</Text> Ops Portal
          </Text>
          <Text style={styles.subtitle}>
            Restricted Administrative Access & Fleet Control (FR1)
          </Text>
        </View>

        {/* Role Selection Tabs */}
        <View style={styles.tabsContainer}>
          {['Passenger', 'Driver / Conductor', 'Transport Coordinator'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.tabButton, role === r && styles.tabButtonActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.tabText, role === r && styles.tabTextActive]}>
                {r.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <UserCheck size={16} color="#0284C7" />
            <Text style={styles.formHeaderText}>
              {isRegistering ? 'New Coordinator Registration' : 'Staff Login & Clearance Verification'}
            </Text>
          </View>

          {errorMsg ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color="#f43f5e" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Official Staff Email / ID</Text>
          <TextInput
            style={styles.input}
            value={staffId}
            onChangeText={setStaffId}
            placeholder="e.g. CDR-8910@transitpulse.gov"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Master Security Passcode</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={passcode}
              onChangeText={setPasscode}
              placeholder="Enter security passcode"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPasscode}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPasscode(!showPasscode)}
            >
              {showPasscode ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleAuth}>
            <Lock size={18} color="#fff" style={styles.submitIcon} />
            <Text style={styles.submitButtonText}>
              {isRegistering ? 'Register Admin Account' : 'Authenticate Secure Portal'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.quickLoginButton} onPress={handleQuickLogin}>
            <Fingerprint size={18} color="#0284C7" />
            <Text style={styles.quickLoginText}>Quick Biometric Face ID</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
            <Text style={styles.registerText}>
              {isRegistering ? 'Back to Login' : 'Register Staff Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#0F2942',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...TransitShadows.card,
  },
  title: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  titleHighlight: {
    color: '#0284C7',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#0F2942',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formHeaderText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    color: '#0F172A',
    fontSize: 14,
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  submitButton: {
    backgroundColor: '#0F2942',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    ...TransitShadows.card,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  quickLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickLoginText: {
    color: '#0284C7',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '700',
  },
  registerText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});
