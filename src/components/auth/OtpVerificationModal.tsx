import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';

interface OtpVerificationModalProps {
  visible: boolean;
  email: string;
  onVerify: (code: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  onClose: () => void;
  defaultOtp?: string;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  visible,
  email,
  onVerify,
  onResend,
  onClose,
  defaultOtp = '849201',
}) => {
  const [otpCode, setOtpCode] = useState(defaultOtp);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      setOtpCode(defaultOtp);
      setErrorMessage(null);
      setIsSuccess(false);
      setResendCooldown(30);
    }
  }, [visible, defaultOtp]);

  useEffect(() => {
    if (!visible || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [visible, resendCooldown]);

  const handleVerify = async () => {
    const clean = otpCode.trim();
    if (clean.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setErrorMessage(null);
    setIsVerifying(true);
    try {
      const ok = await onVerify(clean);
      if (ok) {
        setIsSuccess(true);
      } else {
        setErrorMessage('Invalid verification code. Please check and retry.');
      }
    } catch {
      setErrorMessage('Verification failed due to a server error. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setErrorMessage(null);
    try {
      await onResend();
    } catch {
      setErrorMessage('Failed to resend verification code.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={20} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Ionicons
              name={isSuccess ? 'checkmark-circle' : 'mail-unread-outline'}
              size={32}
              color={isSuccess ? '#10B981' : '#0D9488'}
            />
          </View>

          <Text style={styles.title}>
            {isSuccess ? 'Account Verified!' : 'Verify Your Email'}
          </Text>

          <Text style={styles.subtext}>
            {isSuccess
              ? 'Your TransitPulse commuter account is now officially verified and activated.'
              : `We sent a 6-digit confirmation code to:`}
          </Text>

          {!isSuccess && <Text style={styles.emailHighlight}>{email}</Text>}

          {!isSuccess ? (
            <>
              <View style={styles.otpInputContainer}>
                <TextInput
                  style={styles.otpInput}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  placeholder="849201"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <View style={styles.testHintRow}>
                <Feather name="info" size={13} color="#0D9488" />
                <Text style={styles.testHintText}>Simulated Sandbox OTP: 849201</Text>
              </View>

              {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

              <TouchableOpacity
                style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
                onPress={handleVerify}
                disabled={isVerifying}
                activeOpacity={0.85}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify & Continue →</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                <Text style={styles.resendPrompt}>Didn't receive code? </Text>
                {resendCooldown > 0 ? (
                  <Text style={styles.cooldownText}>Resend in {resendCooldown}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View style={styles.successActions}>
              <TouchableOpacity style={styles.verifyButton} onPress={onClose} activeOpacity={0.85}>
                <Text style={styles.verifyButtonText}>Go to Commuter Dashboard →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 4,
  },
  emailHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2942',
    marginBottom: 18,
    textAlign: 'center',
  },
  otpInputContainer: {
    width: '100%',
    marginVertical: 12,
  },
  otpInput: {
    height: 54,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 8,
  },
  testHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 14,
  },
  testHintText: {
    fontSize: 11.5,
    color: '#0D9488',
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12.5,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  verifyButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#0B2545',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  resendPrompt: {
    fontSize: 13,
    color: '#64748B',
  },
  cooldownText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '700',
  },
  successActions: {
    width: '100%',
    marginTop: 16,
  },
});
