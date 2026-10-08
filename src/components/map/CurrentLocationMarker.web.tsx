import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Coordinate } from '@/types/route';

interface CurrentLocationMarkerProps {
  coordinate: Coordinate;
}

export const CurrentLocationMarker: React.FC<CurrentLocationMarkerProps> = () => {
  return (
    <View style={styles.container}>
      <View style={styles.halo} />
      <View style={styles.outerRing} />
      <View style={styles.coreDot} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.4)',
  },
  outerRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  coreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
});
