import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Lock, Eye, EyeOff, Fingerprint, UserCheck, AlertCircle } from 'lucide-react-native';

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
            <UserCheck size={16} color="#38bdf8" />
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
            placeholderTextColor="#64748b"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Master Security Passcode</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={passcode}
              onChangeText={setPasscode}
              placeholder="Enter security passcode"
              placeholderTextColor="#64748b"
              secureTextEntry={!showPasscode}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPasscode(!showPasscode)}
            >
              {showPasscode ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
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
            <Fingerprint size={18} color="#0ea5e9" />
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
    backgroundColor: '#0f172a',
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
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  titleHighlight: {
    color: '#0ea5e9',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: '#0ea5e9',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#fff',
  },
  formCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formHeaderText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#f43f5e',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#f43f5e',
    fontSize: 12,
    marginLeft: 8,
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
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
    top: 12,
  },
  submitButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    color: '#0ea5e9',
    fontSize: 12,
    marginLeft: 6,
  },
  registerText: {
    color: '#94a3b8',
    fontSize: 12,
  }
});
