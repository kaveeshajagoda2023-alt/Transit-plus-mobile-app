import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DelayReportPayload } from '@/types/trip';

interface DelayReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitDelay: (payload: DelayReportPayload) => Promise<void>;
}

const DELAY_REASONS: DelayReportPayload['reason'][] = [
  'Traffic',
  'Vehicle issue',
  'Passenger issue',
  'Weather',
  'Road closure',
  'Other',
];

const DELAY_TIMES = [5, 10, 15, 20, 30];

export const DelayReportModal: React.FC<DelayReportModalProps> = ({
  visible,
  onClose,
  onSubmitDelay,
}) => {
  const [selectedReason, setSelectedReason] = useState<DelayReportPayload['reason']>('Traffic');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(10);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitDelay({
        reason: selectedReason,
        estimatedDelayMinutes: selectedMinutes,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Feather name="alert-triangle" size={20} color="#D97706" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Report Route Delay</Text>
              <Text style={styles.subtitle}>
                Broadcasts ETA adjustment to MTA Dispatch & passengers
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Reason Selection */}
          <Text style={styles.sectionLabel}>Select Delay Reason:</Text>
          <View style={styles.reasonsGrid}>
            {DELAY_REASONS.map((r) => {
              const isSelected = selectedReason === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.reasonPill, isSelected && styles.reasonPillActive]}
                  onPress={() => setSelectedReason(r)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.reasonText, isSelected && styles.reasonTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Minutes Selection */}
          <Text style={styles.sectionLabel}>Estimated Delay Duration:</Text>
          <View style={styles.timesRow}>
            {DELAY_TIMES.map((m) => {
              const isSelected = selectedMinutes === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.timeBtn, isSelected && styles.timeBtnActive]}
                  onPress={() => setSelectedMinutes(m)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.timeBtnText, isSelected && styles.timeBtnTextActive]}>
                    +{m} min
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Notes */}
          <Text style={styles.sectionLabel}>Additional Dispatch Notes (Optional):</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g. Heavy congestion near Borella junction"
            placeholderTextColor="#94A3B8"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.btnRow}>
                <MaterialCommunityIcons name="broadcast" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Broadcast Delay (+{selectedMinutes} min)</Text>
              </View>
            )}
          </TouchableOpacity>
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
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  reasonPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonPillActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  reasonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  reasonTextActive: {
    color: '#B45309',
    fontWeight: '800',
  },
  timesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  timeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  timeBtnActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  timeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  timeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  notesInput: {
    height: 60,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  submitBtn: {
    height: 48,
    backgroundColor: '#D97706',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
