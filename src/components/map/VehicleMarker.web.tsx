import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Vehicle } from '@/types/vehicle';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface VehicleMarkerProps {
  vehicle: Vehicle;
  isSelected?: boolean;
  onPress?: (vehicle: Vehicle) => void;
}

export const VehicleMarker: React.FC<VehicleMarkerProps> = ({
  vehicle,
  isSelected = false,
  onPress,
}) => {
  const isBus = vehicle.type === 'bus';
  const bgColor = isBus ? TransitColors.busBadge : TransitColors.trainBadgeSecondary;

  const label = isBus
    ? `Bus ${vehicle.routeNumber}`
    : vehicle.routeNumber.startsWith('Line')
    ? vehicle.routeNumber
    : `Train ${vehicle.routeNumber}`;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress && onPress(vehicle)}
      style={[
        styles.markerContainer,
        isSelected && styles.selectedContainer,
      ]}
    >
      <View style={[styles.pillBadge, { backgroundColor: bgColor }]}>
        {isBus ? (
          <Ionicons name="bus" size={13} color="#FFFFFF" style={styles.icon} />
        ) : (
          <MaterialCommunityIcons
            name="train"
            size={13}
            color="#FFFFFF"
            style={styles.icon}
          />
        )}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={[styles.pointerArrow, { borderTopColor: bgColor }]} />
      <View style={styles.pulseDot} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    ...TransitShadows.marker,
  },
  selectedContainer: {
    transform: [{ scale: 1.15 }],
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pointerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -1,
  },
  pulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TransitColors.liveGreen,
    position: 'absolute',
    top: 2,
    right: 2,
  },
});
