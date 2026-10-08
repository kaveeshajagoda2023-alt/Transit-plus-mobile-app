import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface ScanActionCardProps {
  onScanPress: () => void;
  onNfcPress: () => void;
  isScanning?: boolean;
}

export const ScanActionCard: React.FC<ScanActionCardProps> = ({
  onScanPress,
  onNfcPress,
  isScanning = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Primary Tap Area */}
      <TouchableOpacity
        style={styles.mainActionTouch}
        onPress={onScanPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Scan Passenger Ticket. Camera ready, tap or scan."
      >
        {/* QR icon frame */}
        <View style={styles.qrIconWrap}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#38BDF8" />
        </View>

        {/* Text Center */}
        <View style={styles.textCenter}>
          <Text style={styles.titleText}>SCAN PASSENGER TICKET</Text>
          <Text style={styles.subtitleText}>Camera Ready • Tap or Scan</Text>
        </View>
      </TouchableOpacity>

      {/* Right: NFC Button */}
      <TouchableOpacity
        style={styles.nfcPillBtn}
        onPress={onNfcPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="NFC tap ticket reader"
      >
        <Ionicons name="radio" size={14} color="#38BDF8" />
        <Text style={styles.nfcPillText}>NFC</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A2540', // Deep transit navy/teal from screenshot
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  mainActionTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qrIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitleText: {
    color: '#38BDF8',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
  },
  nfcPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 8,
  },
  nfcPillText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
