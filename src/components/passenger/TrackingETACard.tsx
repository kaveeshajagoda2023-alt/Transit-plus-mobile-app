import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface TrackingETACardProps {
  etaMinutes: number;
  delayMinutes?: number;
  stopsAway: number;
}

export const TrackingETACard: React.FC<TrackingETACardProps> = ({
  etaMinutes,
  delayMinutes = 0,
  stopsAway,
}) => {
  return (
    <View style={styles.card}>
      {/* Clock Icon Circle */}
      <View style={styles.clockCircle}>
        <Feather name="clock" size={20} color="#C2410C" />
      </View>

      {/* Main Details Column */}
      <View style={styles.detailsColumn}>
        <Text style={styles.arrivingTitle}>
          Arriving in {etaMinutes} min
        </Text>

        {/* Subtitle with Delay & Stops Away */}
        <View style={styles.subRow}>
          {delayMinutes > 0 && (
            <View style={styles.delayItem}>
              <View style={styles.delayDot} />
              <Text style={styles.delayText}>
                +{delayMinutes} min traffic delay
              </Text>
            </View>
          )}

          {delayMinutes > 0 && <Text style={styles.dotDivider}>•</Text>}

          <Text style={styles.stopsAwayText}>
            {stopsAway} {stopsAway === 1 ? 'stop' : 'stops'} away
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 68,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 20,
    ...TransitShadows.floating,
  },
  clockCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailsColumn: {
    flex: 1,
  },
  arrivingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: -0.3,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    flexWrap: 'wrap',
  },
  delayItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  delayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EA580C',
    marginRight: 5,
  },
  delayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
  },
  dotDivider: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 6,
  },
  stopsAwayText: {
    fontSize: 12,
    fontWeight: '600',
    color: TransitColors.textSecondary,
  },
});
