import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TripStatus, ScheduleStatus } from '@/types/trip';

interface TripStatusCardProps {
  tripStatus: TripStatus;
  scheduleStatus: ScheduleStatus;
  delayMinutes?: number;
}

export const TripStatusCard: React.FC<TripStatusCardProps> = ({
  tripStatus,
  scheduleStatus,
  delayMinutes,
}) => {
  const getDotColor = () => {
    switch (tripStatus) {
      case 'ACTIVE':
        return '#10B981';
      case 'DELAYED':
        return '#F59E0B';
      case 'COMPLETED':
        return '#64748B';
      case 'PAUSED':
        return '#F59E0B';
      default:
        return '#EF4444';
    }
  };

  const getTripStatusLabel = () => {
    switch (tripStatus) {
      case 'ACTIVE':
        return 'Trip Status: Active';
      case 'DELAYED':
        return 'Trip Status: Delayed';
      case 'COMPLETED':
        return 'Trip Status: Completed';
      case 'PAUSED':
        return 'Trip Status: Paused';
      default:
        return `Trip Status: ${tripStatus}`;
    }
  };

  const getScheduleLabel = () => {
    if (scheduleStatus === 'DELAYED' && delayMinutes) {
      return `Sched. Delayed +${delayMinutes}m`;
    }
    switch (scheduleStatus) {
      case 'ON_TIME':
        return 'Sched. On Time';
      case 'EARLY':
        return 'Sched. Early';
      case 'DELAYED':
        return 'Sched. Delayed';
      default:
        return 'Sched. Regular';
    }
  };

  const isDelayed = scheduleStatus === 'DELAYED' || tripStatus === 'DELAYED';

  return (
    <View style={styles.card}>
      {/* Left: Trip Status with dot */}
      <View style={styles.statusLeft}>
        <View style={[styles.dot, { backgroundColor: getDotColor() }]} />
        <Text style={styles.statusText}>{getTripStatusLabel()}</Text>
      </View>

      {/* Right: Schedule Pill */}
      <View style={[styles.schedulePill, isDelayed && styles.schedulePillDelayed]}>
        <Feather
          name="clock"
          size={13}
          color={isDelayed ? '#DC2626' : '#475569'}
        />
        <Text style={[styles.scheduleText, isDelayed && styles.scheduleTextDelayed]}>
          {getScheduleLabel()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F766E', // Emerald / dark teal from screenshot
    letterSpacing: -0.1,
  },
  schedulePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  schedulePillDelayed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  scheduleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  scheduleTextDelayed: {
    color: '#DC2626',
    fontWeight: '700',
  },
});
