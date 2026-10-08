import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TripData } from '@/types/trip';

interface CapacityStatsCardProps {
  trip: TripData;
  onCashFarePress?: () => void;
  onDigitalQrPress?: () => void;
  onPendingPress?: () => void;
  onOccupancyChange?: (delta: number) => void;
}

export const CapacityStatsCard: React.FC<CapacityStatsCardProps> = ({
  trip,
  onCashFarePress,
  onDigitalQrPress,
  onPendingPress,
  onOccupancyChange,
}) => {
  const percentage = Math.min(
    100,
    Math.round((trip.occupiedSeats / trip.totalSeats) * 100)
  );

  const getCapacityCategory = (pct: number) => {
    if (pct <= 50) return 'Low';
    if (pct <= 80) return 'Medium';
    if (pct <= 95) return 'High';
    return 'Full';
  };

  const getPillColor = (pct: number) => {
    if (pct <= 50) return { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' };
    if (pct <= 80) return { bg: '#CCFBF1', text: '#0F766E', dot: '#14B8A6' };
    return { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' };
  };

  const category = getCapacityCategory(percentage);
  const pillStyle = getPillColor(percentage);

  // Format currency with Sri Lankan Rupees
  const formattedFare = `RS ${trip.shiftDigitalFareTotal.toFixed(2)}`;

  return (
    <View style={styles.card}>
      {/* Top Label */}
      <Text style={styles.sectionLabel}>VEHICLE OCCUPANCY</Text>

      {/* Main Seats & Percentage Pill Row */}
      <View style={styles.seatsRow}>
        <View style={styles.seatsLeft}>
          <Text style={styles.seatsNumber}>{trip.occupiedSeats}</Text>
          <Text style={styles.seatsTotal}> / {trip.totalSeats} Seats</Text>
        </View>

        <View style={[styles.percentagePill, { backgroundColor: pillStyle.bg }]}>
          <View style={[styles.pillDot, { backgroundColor: pillStyle.dot }]} />
          <Text style={[styles.percentageText, { color: pillStyle.text }]}>
            {percentage}% {category}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>

      {/* Three Statistic Cards */}
      <View style={styles.statsCardsRow}>
        {/* 1. Digital QR */}
        <TouchableOpacity
          style={styles.statCard}
          onPress={onDigitalQrPress}
          activeOpacity={0.7}
        >
          <View style={styles.statIconRow}>
            <Feather name="check-circle" size={13} color="#0D9488" />
            <Text style={styles.statValue}>{trip.digitalQrCount}</Text>
          </View>
          <Text style={styles.statLabel}>Digital QR</Text>
        </TouchableOpacity>

        {/* 2. Cash Fare */}
        <TouchableOpacity
          style={styles.statCard}
          onPress={onCashFarePress}
          activeOpacity={0.7}
        >
          <View style={styles.statIconRow}>
            <MaterialCommunityIcons name="cash" size={15} color="#1E40AF" />
            <Text style={styles.statValue}>{trip.cashFareCount}</Text>
          </View>
          <Text style={styles.statLabel}>Cash Fare</Text>
        </TouchableOpacity>

        {/* 3. Pending/Fail */}
        <TouchableOpacity
          style={[styles.statCard, styles.statCardAlert]}
          onPress={onPendingPress}
          activeOpacity={0.7}
        >
          <View style={styles.statIconRow}>
            <Feather name="alert-triangle" size={13} color="#DC2626" />
            <Text style={[styles.statValue, { color: '#DC2626' }]}>
              {trip.pendingFailCount}
            </Text>
          </View>
          <Text style={[styles.statLabel, { color: '#B91C1C' }]}>Pending/Fail</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Shift Digital Fare Total */}
      <View style={styles.fareTotalRow}>
        <Text style={styles.fareTotalLabel}>Shift Digital Fare Total</Text>
        <Text style={styles.fareTotalValue}>{formattedFare}</Text>
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
    padding: 16,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seatsLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  seatsNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
  },
  seatsTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  percentagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E0E7FF', // Soft lavender/blue track
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0D9488', // Deep teal from screenshot
    borderRadius: 4,
  },
  statsCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  fareTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  fareTotalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  fareTotalValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
});
