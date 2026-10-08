import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TripData } from '@/types/trip';

interface EndTripModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmEndTrip: () => Promise<void>;
  trip: TripData;
}

export const EndTripModal: React.FC<EndTripModalProps> = ({
  visible,
  onClose,
  onConfirmEndTrip,
  trip,
}) => {
  const [isEnding, setIsEnding] = useState(false);

  const handleConfirm = async () => {
    setIsEnding(true);
    try {
      await onConfirmEndTrip();
      onClose();
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.iconCircle}>
            <Feather name="stop-circle" size={28} color="#DC2626" />
          </View>

          <Text style={styles.title}>End Current Trip?</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to conclude the active run for {trip.routeNumber} ({trip.busNumber})?
          </Text>

          {/* Trip Summary Recap */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Digital QR Fares:</Text>
              <Text style={styles.summaryValue}>{trip.digitalQrCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Cash Fares:</Text>
              <Text style={styles.summaryValue}>{trip.cashFareCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shift Digital Revenue:</Text>
              <Text style={styles.summaryValue}>RS {trip.shiftDigitalFareTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Current Stop:</Text>
              <Text style={styles.summaryValue}>{trip.currentStop}</Text>
            </View>
          </View>

          <Text style={styles.warningNote}>
            Ending the trip will close ticket validation for this run and archive operational logs.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isEnding}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, isEnding && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={isEnding}
            >
              {isEnding ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm End Trip</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  warningNote: {
    fontSize: 11,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  confirmBtn: {
    flex: 1.2,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
