import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { nfcService } from '@/services/nfc/nfcService';
import { TransitColors } from '@/constants/transitTheme';

interface NfcScanModalProps {
  visible: boolean;
  onClose: () => void;
  onBadgeScanned: (badgeId: string) => Promise<void>;
}

export const NfcScanModal: React.FC<NfcScanModalProps> = ({
  visible,
  onClose,
  onBadgeScanned,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [customBadge, setCustomBadge] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const hasHardware = nfcService.hasHardwareSupport();

  useEffect(() => {
    if (visible) {
      setErrorMessage(null);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, pulseAnim]);

  const handleSimulateScan = async (badgeId: string) => {
    setIsScanning(true);
    setErrorMessage(null);
    try {
      const result = await nfcService.scanBadge(badgeId);
      if (result.success && result.badgeId) {
        await onBadgeScanned(result.badgeId);
        onClose();
      } else {
        setErrorMessage(result.error || 'Failed to read badge.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'NFC verification failed.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="contactless-payment" size={24} color="#0D9488" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Operator NFC Key Reader</Text>
              <Text style={styles.subtitle}>
                {hasHardware ? 'Hardware NFC Active' : 'RFID Terminal Simulation Mode'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Scanner Pulse Visual */}
          <View style={styles.scannerVisual}>
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.nfcSensor}>
                <Ionicons name="radio" size={36} color="#0D9488" />
              </View>
            </Animated.View>
            <Text style={styles.sensorStatusText}>
              {isScanning
                ? 'Reading Conductor Cryptographic Key...'
                : 'Hold authorized transit badge against reader sensor'}
            </Text>
          </View>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Quick Conductor/Operator Badges */}
          <Text style={styles.sectionLabel}>Authorized Badges on Vehicle #4028:</Text>

          <View style={styles.badgeButtonsList}>
            <TouchableOpacity
              style={styles.badgeOptionBtn}
              onPress={() => handleSimulateScan('NFC-COND-55219')}
              disabled={isScanning}
              activeOpacity={0.8}
            >
              <View style={styles.badgeLeft}>
                <MaterialCommunityIcons name="badge-account-horizontal" size={20} color="#0F766E" />
                <View>
                  <Text style={styles.badgeName}>Elena Rostova (Conductor Lead)</Text>
                  <Text style={styles.badgeId}>Badge ID: NFC-COND-55219</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.badgeOptionBtn}
              onPress={() => handleSimulateScan('NFC-MTA-84920')}
              disabled={isScanning}
              activeOpacity={0.8}
            >
              <View style={styles.badgeLeft}>
                <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#1E40AF" />
                <View>
                  <Text style={styles.badgeName}>Marcus Vance (Senior Driver)</Text>
                  <Text style={styles.badgeId}>Badge ID: NFC-MTA-84920</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Custom Badge ID */}
          <View style={styles.customInputRow}>
            <TextInput
              style={styles.input}
              placeholder="Or enter Badge ID (e.g. NFC-DSP-10382)"
              placeholderTextColor="#94A3B8"
              value={customBadge}
              onChangeText={setCustomBadge}
              autoCapitalize="characters"
              editable={!isScanning}
            />
            <TouchableOpacity
              style={[
                styles.tapBtn,
                (!customBadge.trim() || isScanning) && styles.tapBtnDisabled,
              ]}
              onPress={() => handleSimulateScan(customBadge)}
              disabled={!customBadge.trim() || isScanning}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.tapBtnText}>Tap</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.noteText}>
            NFC transmissions are encrypted with MTA Dispatch Public Key SHA-256.
          </Text>
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
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
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
  scannerVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingVertical: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  pulseRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#99F6E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  nfcSensor: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F766E',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  badgeButtonsList: {
    gap: 8,
    marginBottom: 14,
  },
  badgeOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  badgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgeId: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12.5,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  tapBtn: {
    height: 44,
    paddingHorizontal: 18,
    backgroundColor: '#0D9488',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapBtnDisabled: {
    opacity: 0.5,
  },
  tapBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  noteText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
