import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TransitColors } from '@/constants/transitTheme';

interface LiveDeparturesHeaderProps {
  title?: string;
}

export const LiveDeparturesHeader: React.FC<LiveDeparturesHeaderProps> = ({
  title = 'Recommended Results',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.liveIndicator}>
        <View style={styles.pulseDot} />
        <Text style={styles.liveText}>Live Departures</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    letterSpacing: -0.2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0D9488',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0D9488',
  },
});
