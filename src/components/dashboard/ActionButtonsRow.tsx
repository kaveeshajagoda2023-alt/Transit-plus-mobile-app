import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface ActionButtonsRowProps {
  onReportDelay: () => void;
  onDispatch: () => void;
  onEndTrip: () => void;
}

export const ActionButtonsRow: React.FC<ActionButtonsRowProps> = ({
  onReportDelay,
  onDispatch,
  onEndTrip,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Report Delay */}
      <TouchableOpacity
        style={styles.whiteBtn}
        onPress={onReportDelay}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Report Delay"
      >
        <Feather name="alert-triangle" size={16} color="#D97706" />
        <Text style={styles.whiteBtnText}>Report Delay</Text>
      </TouchableOpacity>

      {/* 2. Dispatch (Primary Red) */}
      <TouchableOpacity
        style={styles.redDispatchBtn}
        onPress={onDispatch}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Dispatch"
      >
        <MaterialCommunityIcons name="alarm-light-outline" size={18} color="#FFFFFF" />
        <Text style={styles.redBtnText}>Dispatch</Text>
      </TouchableOpacity>

      {/* 3. End Trip */}
      <TouchableOpacity
        style={styles.whiteBtn}
        onPress={onEndTrip}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="End Trip"
      >
        <Feather name="stop-circle" size={16} color="#0F172A" />
        <Text style={styles.whiteBtnText}>End Trip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  whiteBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  whiteBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  redDispatchBtn: {
    flex: 1.1,
    height: 48,
    backgroundColor: '#B91C1C', // Deep red matching screenshot
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#B91C1C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  redBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
