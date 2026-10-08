import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RouteSortOption } from '@/types/journey';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface SortChipBarProps {
  selectedSort: RouteSortOption;
  onSelectSort: (sort: RouteSortOption) => void;
}

export const SortChipBar: React.FC<SortChipBarProps> = ({
  selectedSort,
  onSelectSort,
}) => {
  const sortOptions: { key: RouteSortOption; label: string }[] = [
    { key: 'fastest', label: 'Fastest' },
    { key: 'earliest', label: 'Earliest arrival' },
    { key: 'lowest-fare', label: 'Lowest fare' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sortOptions.map((item) => {
          const isActive = selectedSort === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              onPress={() => onSelectSort(item.key)}
              style={[
                styles.chip,
                isActive ? styles.activeChip : styles.inactiveChip,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Sort by ${item.label}`}
              accessibilityState={{ selected: isActive }}
            >
              {isActive && (
                <Feather
                  name="check"
                  size={14}
                  color="#FFFFFF"
                  style={styles.checkIcon}
                />
              )}
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
    marginTop: 16,
    marginBottom: 14,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    borderColor: '#CBD5E1',
    borderWidth: 1,
  },
  checkIcon: {
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
