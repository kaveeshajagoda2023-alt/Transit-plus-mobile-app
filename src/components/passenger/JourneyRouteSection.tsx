import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RouteStop } from '@/types/route';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface JourneyRouteSectionProps {
  stops: RouteStop[];
  baseEtaMinutes?: number;
}

export const JourneyRouteSection: React.FC<JourneyRouteSectionProps> = ({
  stops,
  baseEtaMinutes = 6,
}) => {
  // Calculate remaining stops dynamically: total stops - completed stops
  const completedCount = stops.filter((s) => s.status === 'completed').length;
  const remainingCount = Math.max(1, stops.length - completedCount);

  return (
    <View style={styles.card}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Journey Route</Text>
        <View style={styles.remainingBadge}>
          <Text style={styles.remainingText}>
            {remainingCount} {remainingCount === 1 ? 'STOP' : 'STOPS'} REMAINING
          </Text>
        </View>
      </View>

      {/* Stop Timeline List */}
      <View style={styles.timelineList}>
        {stops.map((stop, index) => {
          const isFirst = index === 0;
          const isLast = index === stops.length - 1;
          const isCompleted = stop.status === 'completed';
          const isCurrent = stop.status === 'current';
          const isUpcoming = !isCompleted && !isCurrent;

          // Calculate dynamic stop ETA relative to live ETA
          let stopEtaText: string | null = null;
          if (stop.etaMinutes !== undefined) {
            const adjustedEta = Math.max(1, stop.etaMinutes + (baseEtaMinutes - 6));
            stopEtaText = `Arriving in ${adjustedEta} min`;
          } else if (isCurrent) {
            stopEtaText = `Arriving in ${baseEtaMinutes} min`;
          } else if (isUpcoming) {
            const calculatedEta = baseEtaMinutes + (index - completedCount) * 4 + 1;
            stopEtaText = `Arriving in ${calculatedEta} min`;
          }

          return (
            <View key={stop.id || index} style={styles.stopRow}>
              {/* Timeline Indicator Column */}
              <View style={styles.indicatorCol}>
                {/* Status Dot / Icon */}
                {isCompleted ? (
                  <View style={styles.completedCircle}>
                    <Feather name="check" size={11} color="#FFFFFF" />
                  </View>
                ) : isCurrent ? (
                  <View style={styles.currentOuterRing}>
                    <View style={styles.currentInnerCore} />
                  </View>
                ) : (
                  <View style={styles.upcomingCircle} />
                )}

                {/* Connecting Line */}
                {!isLast && (
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted ? styles.lineCompleted : styles.linePending,
                    ]}
                  />
                )}
              </View>

              {/* Stop Info Details */}
              <View style={[styles.stopContent, isLast && styles.lastStopContent]}>
                <View style={styles.stopNameRow}>
                  <Text
                    style={[
                      styles.stopName,
                      isCurrent && styles.currentStopName,
                      isCompleted && styles.completedStopName,
                    ]}
                  >
                    {stop.name}
                  </Text>
                  {stop.isBoarding && (
                    <View style={styles.boardingBadge}>
                      <Text style={styles.boardingBadgeText}>Boarding</Text>
                    </View>
                  )}
                </View>

                {/* Platform and ETA Subtext */}
                <View style={styles.subtextRow}>
                  {stop.platform && (
                    <Text style={styles.platformText}>{stop.platform}</Text>
                  )}
                  {stopEtaText && !isCompleted && (
                    <>
                      {stop.platform && <Text style={styles.dotDivider}>•</Text>}
                      <Text
                        style={[
                          styles.etaText,
                          isCurrent && styles.currentEtaText,
                        ]}
                      >
                        {stopEtaText}
                      </Text>
                    </>
                  )}
                  {isCompleted && (
                    <>
                      {stop.platform && <Text style={styles.dotDivider}>•</Text>}
                      <Text style={styles.departedText}>Departed</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    ...TransitShadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    letterSpacing: -0.2,
  },
  remainingBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  remainingText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: TransitColors.textSecondary,
    letterSpacing: 0.5,
  },
  timelineList: {
    paddingLeft: 4,
  },
  stopRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 26,
    marginRight: 12,
  },
  completedCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  currentOuterRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  currentInnerCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#15803D',
  },
  upcomingCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#94A3B8',
    zIndex: 2,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: '#10B981',
  },
  linePending: {
    backgroundColor: '#E2E8F0',
  },
  stopContent: {
    flex: 1,
    paddingBottom: 16,
  },
  lastStopContent: {
    paddingBottom: 4,
  },
  stopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: TransitColors.textPrimary,
  },
  currentStopName: {
    color: TransitColors.primary,
    fontWeight: '800',
  },
  completedStopName: {
    color: TransitColors.textSecondary,
  },
  boardingBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  boardingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    flexWrap: 'wrap',
  },
  platformText: {
    fontSize: 12,
    color: TransitColors.textSecondary,
    fontWeight: '500',
  },
  dotDivider: {
    fontSize: 12,
    color: '#94A3B8',
    marginHorizontal: 5,
  },
  etaText: {
    fontSize: 12,
    color: TransitColors.textSecondary,
    fontWeight: '600',
  },
  currentEtaText: {
    color: '#EA580C',
    fontWeight: '700',
  },
  departedText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
