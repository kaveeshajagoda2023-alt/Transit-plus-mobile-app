import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterLocation: () => void;
  onToggleLayer?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenterLocation,
  onToggleLayer,
}) => {
  const handleLayerPress = () => {
    if (onToggleLayer) {
      onToggleLayer();
    } else {
      Alert.alert('Map Layer', 'Switch between Standard, Satellite, and Transit Line view');
    }
  };

  return (
    <View style={styles.container}>
      {/* Layer / Collapse Button */}
      <TouchableOpacity
        style={styles.topButton}
        onPress={handleLayerPress}
        activeOpacity={0.8}
        accessibilityLabel="Map options"
      >
        <Feather name="chevron-down" size={20} color={TransitColors.primary} />
      </TouchableOpacity>

      {/* Zoom In & Out Stack */}
      <View style={styles.zoomStack}>
        <TouchableOpacity
          style={styles.zoomBtn}
          onPress={onZoomIn}
          activeOpacity={0.7}
          accessibilityLabel="Zoom In"
        >
          <Feather name="plus" size={20} color={TransitColors.primary} />
        </TouchableOpacity>

        <View style={styles.zoomDivider} />

        <TouchableOpacity
          style={styles.zoomBtn}
          onPress={onZoomOut}
          activeOpacity={0.7}
          accessibilityLabel="Zoom Out"
        >
          <Feather name="minus" size={20} color={TransitColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Center Location / Layers button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={onCenterLocation}
        activeOpacity={0.8}
        accessibilityLabel="My Location"
      >
        <MaterialCommunityIcons
          name="layers-outline"
          size={20}
          color={TransitColors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: 130,
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.floating,
  },
  zoomStack: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...TransitShadows.floating,
  },
  zoomBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.floating,
  },
});
