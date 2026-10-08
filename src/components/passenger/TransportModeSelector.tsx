import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TransportModeOption } from '@/types/journey';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface TransportModeSelectorProps {
  selectedMode: TransportModeOption;
  onSelectMode: (mode: TransportModeOption) => void;
}

export const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
}) => {
  const modes: {
    key: TransportModeOption;
    label: string;
    icon: (isActive: boolean) => React.ReactNode;
  }[] = [
    {
      key: 'both',
      label: 'Both',
      icon: (isActive) => (
        <Ionicons
          name="bus"
          size={15}
          color={isActive ? '#FFFFFF' : TransitColors.trainBadge}
          style={styles.icon}
        />
      ),
    },
    {
      key: 'bus',
      label: 'Bus Only',
      icon: (isActive) => (
        <Ionicons
          name="bus"
          size={15}
          color={isActive ? '#FFFFFF' : TransitColors.trainBadge}
          style={styles.icon}
        />
      ),
    },
    {
      key: 'train',
      label: 'Train Only',
      icon: (isActive) => (
        <MaterialCommunityIcons
          name="train"
          size={15}
          color={isActive ? '#FFFFFF' : TransitColors.trainBadge}
          style={styles.icon}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>TRANSPORT MODES</Text>

      <View style={styles.segmentedContainer}>
        {modes.map((item) => {
          const isActive = selectedMode === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              onPress={() => onSelectMode(item.key)}
              style={[
                styles.modeButton,
                isActive && styles.activeModeButton,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.label}`}
              accessibilityState={{ selected: isActive }}
            >
              {item.icon(isActive)}
              <Text
                style={[
                  styles.modeLabel,
                  isActive ? styles.activeModeLabel : styles.inactiveModeLabel,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: TransitColors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F1FA',
    borderRadius: 14,
    padding: 3,
    gap: 3,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeModeButton: {
    backgroundColor: TransitColors.primary,
    ...TransitShadows.card,
  },
  icon: {
    marginRight: 6,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeModeLabel: {
    color: '#FFFFFF',
  },
  inactiveModeLabel: {
    color: TransitColors.textPrimary,
  },
});
