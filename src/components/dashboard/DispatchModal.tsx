import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DispatchAlertPayload } from '@/types/trip';

interface DispatchModalProps {
  visible: boolean;
  onClose: () => void;
  onSendDispatch: (payload: DispatchAlertPayload) => Promise<{ success: boolean; messageId: string }>;
  busNumber: string;
}

const PRESET_ALERTS: { label: string; type: DispatchAlertPayload['type']; priority: DispatchAlertPayload['priority']; icon: any }[] = [
  { label: 'Request Route Assistance', type: 'ASSISTANCE', priority: 'MEDIUM', icon: 'hand-left' },
  { label: 'Overcrowded Bus Notice', type: 'OVERCROWDED', priority: 'MEDIUM', icon: 'account-group' },
  { label: 'Mechanical Issue Alert', type: 'MECHANICAL', priority: 'HIGH', icon: 'wrench' },
  { label: 'Emergency Police / Medical', type: 'EMERGENCY', priority: 'CRITICAL', icon: 'shield-alert' },
];

export const DispatchModal: React.FC<DispatchModalProps> = ({
  visible,
  onClose,
  onSendDispatch,
  busNumber,
}) => {
  const [customMsg, setCustomMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const handleSendPreset = async (preset: typeof PRESET_ALERTS[0]) => {
    setIsSending(true);
    try {
      const res = await onSendDispatch({
        type: preset.type,
        message: `${preset.label} reported from ${busNumber}`,
        priority: preset.priority,
      });
      if (res.success) {
        setSentNotice(`Dispatch beacon transmitted (${preset.label})`);
        setTimeout(() => {
          setSentNotice(null);
          onClose();
        }, 1200);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSendCustom = async () => {
    if (!customMsg.trim()) return;
    setIsSending(true);
    try {
      const res = await onSendDispatch({
        type: 'GENERAL',
        message: customMsg.trim(),
        priority: 'MEDIUM',
      });
      if (res.success) {
        setSentNotice('Dispatch message delivered');
        setCustomMsg('');
        setTimeout(() => {
          setSentNotice(null);
          onClose();
        }, 1200);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="alarm-light-outline" size={22} color="#DC2626" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>MTA Dispatch Center</Text>
              <Text style={styles.subtitle}>
                Zone 4 Command Frequency • Radio Channel 12
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {sentNotice && (
            <View style={styles.sentBox}>
              <Feather name="check" size={16} color="#059669" />
              <Text style={styles.sentText}>{sentNotice}</Text>
            </View>
          )}

          {/* Presets */}
          <Text style={styles.sectionLabel}>Quick Operational Signals:</Text>
          <View style={styles.presetsList}>
            {PRESET_ALERTS.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={[
                  styles.presetBtn,
                  preset.priority === 'CRITICAL' && styles.presetBtnCritical,
                ]}
                onPress={() => handleSendPreset(preset)}
                disabled={isSending}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={preset.icon}
                  size={18}
                  color={preset.priority === 'CRITICAL' ? '#DC2626' : '#0F2942'}
                />
                <Text
                  style={[
                    styles.presetBtnText,
                    preset.priority === 'CRITICAL' && styles.presetBtnTextCritical,
                  ]}
                >
                  {preset.label}
                </Text>
                <Feather name="chevron-right" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Message */}
          <Text style={styles.sectionLabel}>Direct Message to Dispatch:</Text>
          <View style={styles.customRow}>
            <TextInput
              style={styles.input}
              placeholder="Type message to dispatcher..."
              placeholderTextColor="#94A3B8"
              value={customMsg}
              onChangeText={setCustomMsg}
              editable={!isSending}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!customMsg.trim() || isSending) && styles.sendBtnDisabled,
              ]}
              onPress={handleSendCustom}
              disabled={!customMsg.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="send" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>
            All transmissions are recorded under TransitOps Compliance protocol.
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
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
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
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  sentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  sentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  presetsList: {
    gap: 8,
    marginBottom: 16,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  presetBtnCritical: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  presetBtnText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  presetBtnTextCritical: {
    color: '#DC2626',
  },
  customRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
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
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#0F2942',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  footerNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
