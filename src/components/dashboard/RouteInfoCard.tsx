import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TripData } from '@/types/trip';

interface RouteInfoCardProps {
  trip: TripData;
  onToggleDoors?: () => void;
  onAdvanceStop?: () => void;
}

export const RouteInfoCard: React.FC<RouteInfoCardProps> = ({
  trip,
  onToggleDoors,
  onAdvanceStop,
}) => {
  const isDoorsOpen = trip.doorStatus === 'OPEN';

  return (
    <View style={styles.card}>
      {/* Route Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.lineBadge}>
          <Text style={styles.lineBadgeText}>{trip.routeNumber}</Text>
        </View>

        <Text style={styles.routePathText} numberOfLines={1}>
          {trip.origin} → {trip.destination}
        </Text>

        <View style={styles.zonePill}>
          <Text style={styles.zonePillText}>{trip.zone}</Text>
        </View>
      </View>

      {/* Two Stop Columns Side-by-Side */}
      <View style={styles.stopsRow}>
        {/* Left: Current Stop */}
        <TouchableOpacity
          style={styles.stopBox}
          onPress={onToggleDoors}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Current stop ${trip.currentStop}. Doors ${isDoorsOpen ? 'Open' : 'Closed'}. Tap to toggle.`}
        >
          <View style={styles.stopBoxLabelRow}>
            <Feather name="map-pin" size={13} color="#0D9488" />
            <Text style={styles.stopBoxLabel}>Current Stop</Text>
          </View>

          <Text style={styles.stopName} numberOfLines={1}>
            {trip.currentStop}
          </Text>

          <View style={styles.doorStatusRow}>
            <View
              style={[
                styles.doorIndicatorDot,
                { backgroundColor: isDoorsOpen ? '#10B981' : '#64748B' },
              ]}
            />
            <Text
              style={[
                styles.doorStatusText,
                { color: isDoorsOpen ? '#047857' : '#64748B' },
              ]}
            >
              {isDoorsOpen ? 'Doors Open' : 'Doors Closed'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right: Next Stop */}
        <TouchableOpacity
          style={styles.stopBox}
          onPress={onAdvanceStop}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Next stop ${trip.nextStop} in ${trip.etaMinutes} minutes. Tap to advance.`}
        >
          <View style={styles.stopBoxLabelRow}>
            <MaterialCommunityIcons name="fast-forward" size={14} color="#64748B" />
            <Text style={styles.stopBoxLabel}>Next Stop</Text>
          </View>

          <Text style={styles.stopName} numberOfLines={1}>
            {trip.nextStop}
          </Text>

          <Text style={styles.etaText}>
            in {trip.etaMinutes} min
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  lineBadge: {
    backgroundColor: '#0F2942',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lineBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  routePathText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  zonePill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  zonePillText: {
    color: '#0F766E',
    fontSize: 11,
    fontWeight: '800',
  },
  stopsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stopBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    borderRadius: 12,
    padding: 10,
  },
  stopBoxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  stopBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  stopName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  doorStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  doorIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  doorStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  etaText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
});
