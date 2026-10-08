import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { TransportFilterType } from '@/types/vehicle';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface TransportFilterProps {
  activeFilter: TransportFilterType;
  onFilterChange: (filter: TransportFilterType) => void;
}

export const TransportFilter: React.FC<TransportFilterProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters: {
    key: TransportFilterType;
    label: string;
    icon: (isActive: boolean) => React.ReactNode;
  }[] = [
    {
      key: 'all',
      label: 'All',
      icon: (isActive) => (
        <Ionicons
          name="grid"
          size={14}
          color={isActive ? '#FFFFFF' : TransitColors.textPrimary}
          style={styles.chipIcon}
        />
      ),
    },
    {
      key: 'bus',
      label: 'Bus',
      icon: (isActive) => (
        <Ionicons
          name="bus"
          size={14}
          color={isActive ? '#FFFFFF' : TransitColors.textPrimary}
          style={styles.chipIcon}
        />
      ),
    },
    {
      key: 'train',
      label: 'Train',
      icon: (isActive) => (
        <MaterialCommunityIcons
          name="train"
          size={15}
          color={isActive ? '#FFFFFF' : TransitColors.textPrimary}
          style={styles.chipIcon}
        />
      ),
    },
    {
      key: 'starred',
      label: 'Starred',
      icon: (isActive) => (
        <Ionicons
          name="bookmark-outline"
          size={14}
          color={isActive ? '#FFFFFF' : TransitColors.textPrimary}
          style={styles.chipIcon}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((item) => {
          const isActive = activeFilter === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              onPress={() => onFilterChange(item.key)}
              style={[
                styles.chip,
                isActive ? styles.activeChip : styles.inactiveChip,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              {item.icon(isActive)}
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.activeChipText : styles.inactiveChipText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    ...TransitShadows.card,
  },
  activeChip: {
    backgroundColor: TransitColors.primary,
    borderColor: TransitColors.primary,
    borderWidth: 1,
  },
  inactiveChip: {
    backgroundColor: '#FFFFFF',
    borderColor: TransitColors.border,
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  inactiveChipText: {
    color: TransitColors.textPrimary,
  },
});
