import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';

interface JourneySummaryCardProps {
  originName: string;
  destinationName: string;
  departureLabel?: string;
  onEditPress: () => void;
}

export const JourneySummaryCard: React.FC<JourneySummaryCardProps> = ({
  originName,
  destinationName,
  departureLabel = 'Leave now',
  onEditPress,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Timeline Indicator Column */}
      <View style={styles.timelineColumn}>
        <View style={styles.originDot} />
        <View style={styles.timelineLine} />
        <View style={styles.destinationDot} />
      </View>

      {/* Origin & Destination Labels */}
      <View style={styles.textColumn}>
        <Text style={styles.locationTitle} numberOfLines={1}>
          {originName}
        </Text>
        <Text style={styles.locationTitle} numberOfLines={1}>
          {destinationName}
        </Text>
        <View style={styles.timeRow}>
          <Feather
            name="clock"
            size={12}
            color={TransitColors.textSecondary}
            style={styles.clockIcon}
          />
          <Text style={styles.timeText}>{departureLabel}</Text>
        </View>
      </View>

      {/* Edit Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={onEditPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Edit journey details"
      >
        <Feather name="edit-2" size={17} color={TransitColors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#EBF3FB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E7F6',
  },
  timelineColumn: {
    alignItems: 'center',
    width: 16,
    height: 48,
    marginRight: 12,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F2942',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 2,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0D9488',
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  locationTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: TransitColors.textSecondary,
    fontWeight: '600',
  },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D0E1F3',
    marginLeft: 8,
  },
});
