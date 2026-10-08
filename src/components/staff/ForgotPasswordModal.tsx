import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStaffAuth } from '@/context/StaffAuthContext';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  defaultIdentifier?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
  defaultIdentifier = '',
}) => {
  const { requestPasswordReset, resetPassword } = useStaffAuth();
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [step, setStep] = useState<'REQUEST' | 'RESET' | 'DONE'>('REQUEST');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recoveryPin, setRecoveryPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [dispatchInfo, setDispatchInfo] = useState<string>('');

  const handleRequestPin = async () => {
    if (!identifier.trim()) {
      setErrorMessage('Please enter your Staff ID or MTA Work Email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await requestPasswordReset(identifier);
      if (res.success) {
        if (res.recoveryPin) {
          setRecoveryPin(res.recoveryPin);
        }
        setDispatchInfo(res.contactDispatch || 'MTA Dispatch Zone 4');
        setStep('RESET');
      } else {
        setErrorMessage(res.error || 'Unable to request password recovery.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Server error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyNewPassword = async () => {
    if (!recoveryPin.trim() || !newPassword.trim()) {
      setErrorMessage('Please provide both the Recovery PIN and your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await resetPassword(identifier, recoveryPin, newPassword);
      if (res.success) {
        setStep('DONE');
      } else {
        setErrorMessage(res.error || 'Failed to reset password. Check PIN.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Server error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('REQUEST');
    setErrorMessage(null);
    setRecoveryPin('');
    setNewPassword('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="shield-key-outline" size={24} color="#0284C7" />
            </View>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Staff Account Recovery</Text>
              <Text style={styles.subtitle}>MTA Identity & Terminal Dispatch</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {step === 'REQUEST' && (
            <View style={styles.body}>
              <Text style={styles.description}>
                Enter your authorized Staff ID (e.g., DRV-84920) or official MTA Work Email to dispatch a secure one-time verification token.
              </Text>

              <Text style={styles.inputLabel}>Staff ID or Work Email</Text>
              <View style={styles.inputWrap}>
                <Feather name="user" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="DRV-84920@transitpulse.gov"
                  placeholderTextColor="#94A3B8"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                onPress={handleRequestPin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Request Emergency Dispatch PIN</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === 'RESET' && (
            <View style={styles.body}>
              <View style={styles.pinNotice}>
                <Feather name="radio" size={16} color="#0284C7" />
                <Text style={styles.pinNoticeText}>
                  Recovery PIN dispatched for {identifier}. Channel: {dispatchInfo}
                </Text>
              </View>

              <Text style={styles.inputLabel}>6-Digit Recovery PIN</Text>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="numeric" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit PIN"
                  placeholderTextColor="#94A3B8"
                  value={recoveryPin}
                  onChangeText={setRecoveryPin}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>

              <Text style={styles.inputLabel}>New Staff Password</Text>
              <View style={styles.inputWrap}>
                <Feather name="lock" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Min 6 alphanumeric characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                onPress={handleApplyNewPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Confirm New Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === 'DONE' && (
            <View style={styles.body}>
              <View style={styles.successBox}>
                <Feather name="check-circle" size={40} color="#059669" />
                <Text style={styles.successTitle}>Password Successfully Reset</Text>
                <Text style={styles.successDesc}>
                  Your staff credentials have been updated securely across all MTA terminals. You can now log in.
                </Text>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleClose}>
                <Text style={styles.submitBtnText}>Return to Terminal Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    marginTop: 16,
  },
  description: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  submitBtn: {
    height: 48,
    backgroundColor: '#0F2942',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  pinNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  pinNoticeText: {
    fontSize: 12,
    color: '#0369A1',
    fontWeight: '600',
    flex: 1,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  successDesc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
