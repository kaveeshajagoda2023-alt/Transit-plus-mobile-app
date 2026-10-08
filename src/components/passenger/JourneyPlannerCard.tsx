import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TransitLocation } from '@/types/location';
import { DepartureOption } from '@/types/journey';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface JourneyPlannerCardProps {
  origin: TransitLocation | null;
  destination: TransitLocation | null;
  destinationText: string;
  departureOption: DepartureOption;
  departureTime: string;
  onDestinationTextChange: (text: string) => void;
  onClearOrigin: () => void;
  onClearDestination: () => void;
  onSwap: () => void;
  onOpenDepartureModal: () => void;
  onSelectDepartureOption: (option: DepartureOption) => void;
}

export const JourneyPlannerCard: React.FC<JourneyPlannerCardProps> = ({
  origin,
  destination,
  destinationText,
  departureOption,
  departureTime,
  onDestinationTextChange,
  onClearOrigin,
  onClearDestination,
  onSwap,
  onOpenDepartureModal,
  onSelectDepartureOption,
}) => {
  const originName = origin ? origin.name : 'Choose starting point';
  const hasDestination = destination !== null || destinationText.trim().length > 0;

  const departureLabel =
    departureOption === 'leave-now'
      ? 'Leave now'
      : departureOption === 'depart-at'
      ? `Depart at ${departureTime}`
      : `Arrive by ${departureTime}`;

  return (
    <View style={styles.cardContainer}>
      {/* FROM Location Row */}
      <View style={styles.fromRowContainer}>
        {/* Origin Target Icon */}
        <View style={styles.originIconCircle}>
          <View style={styles.originInnerDot} />
        </View>

        <View style={styles.locationInfoColumn}>
          <Text style={styles.fieldLabel}>FROM</Text>
          <Text style={styles.originNameText} numberOfLines={1}>
            {originName}
          </Text>
        </View>

        {origin && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={onClearOrigin}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Clear origin location"
          >
            <Feather name="x" size={16} color={TransitColors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Divider with Floating Swap Button */}
      <View style={styles.dividerContainer}>
        <View style={styles.dashedLine} />
        <TouchableOpacity
          style={styles.swapButton}
          onPress={onSwap}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Swap origin and destination"
        >
          <Ionicons
            name="swap-vertical"
            size={18}
            color={TransitColors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* TO Destination Row */}
      <View style={styles.toRowContainer}>
        {/* Destination Pin Icon */}
        <View style={styles.destPinCircle}>
          <Ionicons name="location" size={18} color="#C2410C" />
        </View>

        <View style={styles.locationInfoColumn}>
          <Text style={styles.fieldLabel}>TO</Text>
          <TextInput
            style={styles.destinationInput}
            placeholder="Enter destination, station"
            placeholderTextColor={TransitColors.textMuted}
            value={destinationText}
            onChangeText={onDestinationTextChange}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>

        {!hasDestination ? (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>Required</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={onClearDestination}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Clear destination"
          >
            <Feather name="x" size={16} color={TransitColors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Departure & Arrival Options Row */}
      <View style={styles.departureRow}>
        {/* Leave Now Button Pill */}
        <TouchableOpacity
          style={styles.leaveNowPill}
          onPress={onOpenDepartureModal}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Change departure time: currently ${departureLabel}`}
        >
          <Feather
            name="clock"
            size={14}
            color={TransitColors.textSecondary}
            style={styles.clockIcon}
          />
          <Text style={styles.leaveNowText} numberOfLines={1}>
            {departureLabel}
          </Text>
          <Feather
            name="chevron-down"
            size={14}
            color={TransitColors.textSecondary}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        {/* Quick Depart At / Arrive By Links */}
        <View style={styles.quickTimeLinks}>
          <TouchableOpacity
            style={styles.timeLinkBtn}
            onPress={() => {
              onSelectDepartureOption('depart-at');
              onOpenDepartureModal();
            }}
          >
            <Text
              style={[
                styles.timeLinkText,
                departureOption === 'depart-at' && styles.activeTimeLinkText,
              ]}
            >
              Depart at
            </Text>
          </TouchableOpacity>

          <Text style={styles.timeLinkDot}>•</Text>

          <TouchableOpacity
            style={styles.timeLinkBtn}
            onPress={() => {
              onSelectDepartureOption('arrive-by');
              onOpenDepartureModal();
            }}
          >
            <Text
              style={[
                styles.timeLinkText,
                departureOption === 'arrive-by' && styles.activeTimeLinkText,
              ]}
            >
              Arrive by
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  fromRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FD',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  originIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  originInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
  },
  locationInfoColumn: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: TransitColors.textMuted,
    letterSpacing: 0.5,
  },
  originNameText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: TransitColors.textPrimary,
    marginTop: 2,
  },
  clearBtn: {
    padding: 6,
  },
  dividerContainer: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 18,
    position: 'relative',
  },
  dashedLine: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    zIndex: 5,
    ...TransitShadows.card,
  },
  toRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  destPinCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  destinationInput: {
    fontSize: 14.5,
    fontWeight: '700',
    color: TransitColors.textPrimary,
    paddingVertical: 2,
  },
  requiredBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  departureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
  },
  leaveNowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    maxWidth: '55%',
  },
  clockIcon: {
    marginRight: 6,
  },
  leaveNowText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: TransitColors.textPrimary,
  },
  chevronIcon: {
    marginLeft: 6,
  },
  quickTimeLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeLinkBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  timeLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: TransitColors.textSecondary,
  },
  activeTimeLinkText: {
    color: TransitColors.primary,
    fontWeight: '800',
  },
  timeLinkDot: {
    fontSize: 10,
    color: TransitColors.textMuted,
  },
});
