import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DepartureOption } from '@/types/journey';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface DepartureSelectorModalProps {
  visible: boolean;
  currentOption: DepartureOption;
  currentTime: string;
  onClose: () => void;
  onSelect: (option: DepartureOption, time: string) => void;
}

export const DepartureSelectorModal: React.FC<DepartureSelectorModalProps> = ({
  visible,
  currentOption,
  currentTime,
  onClose,
  onSelect,
}) => {
  const [selectedOption, setSelectedOption] = useState<DepartureOption>(currentOption);
  const [selectedTime, setSelectedTime] = useState<string>(currentTime || '09:45 AM');

  const presetTimes = [
    'Leave Now (09:41 AM)',
    '09:50 AM',
    '10:00 AM',
    '10:15 AM',
    '10:30 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '05:30 PM',
    '06:00 PM',
  ];

  const handleConfirm = () => {
    onSelect(selectedOption, selectedTime);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Departure & Arrival Time</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={20} color={TransitColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Option Selector Tabs */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionTab,
                selectedOption === 'leave-now' && styles.activeOptionTab,
              ]}
              onPress={() => {
                setSelectedOption('leave-now');
                setSelectedTime('Leave Now');
              }}
            >
              <Text
                style={[
                  styles.optionTabText,
                  selectedOption === 'leave-now' && styles.activeOptionTabText,
                ]}
              >
                Leave now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionTab,
                selectedOption === 'depart-at' && styles.activeOptionTab,
              ]}
              onPress={() => setSelectedOption('depart-at')}
            >
              <Text
                style={[
                  styles.optionTabText,
                  selectedOption === 'depart-at' && styles.activeOptionTabText,
                ]}
              >
                Depart at
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionTab,
                selectedOption === 'arrive-by' && styles.activeOptionTab,
              ]}
              onPress={() => setSelectedOption('arrive-by')}
            >
              <Text
                style={[
                  styles.optionTabText,
                  selectedOption === 'arrive-by' && styles.activeOptionTabText,
                ]}
              >
                Arrive by
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time Picker presets if not leave-now */}
          {selectedOption !== 'leave-now' && (
            <View style={styles.timeSection}>
              <Text style={styles.timeSectionTitle}>Select Target Time</Text>
              <ScrollView style={styles.timesList} showsVerticalScrollIndicator={false}>
                {presetTimes.slice(1).map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeItem,
                        isSelected && styles.selectedTimeItem,
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeItemText,
                          isSelected && styles.selectedTimeItemText,
                        ]}
                      >
                        {time}
                      </Text>
                      {isSelected && (
                        <Feather name="check" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmButtonText}>Set Time & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    ...TransitShadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: TransitColors.primary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    gap: 3,
    marginBottom: 16,
  },
  optionTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeOptionTab: {
    backgroundColor: TransitColors.primary,
  },
  optionTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: TransitColors.textSecondary,
  },
  activeOptionTabText: {
    color: '#FFFFFF',
  },
  timeSection: {
    marginBottom: 16,
  },
  timeSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: TransitColors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  timesList: {
    maxHeight: 180,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
  },
  selectedTimeItem: {
    backgroundColor: TransitColors.trainBadge,
  },
  timeItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: TransitColors.textPrimary,
  },
  selectedTimeItemText: {
    color: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: TransitColors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
