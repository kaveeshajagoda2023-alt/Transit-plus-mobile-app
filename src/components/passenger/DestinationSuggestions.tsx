import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TransitLocation } from '@/types/location';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface DestinationSuggestionsProps {
  suggestions: TransitLocation[];
  onSelectSuggestion: (location: TransitLocation) => void;
}

export const DestinationSuggestions: React.FC<DestinationSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
}) => {
  if (suggestions.length === 0) return null;

  const getLocationIcon = (category: TransitLocation['category']) => {
    switch (category) {
      case 'station':
        return <MaterialCommunityIcons name="train" size={16} color={TransitColors.trainBadge} />;
      case 'hub':
        return <Ionicons name="git-network-outline" size={16} color={TransitColors.primary} />;
      case 'airport':
        return <Ionicons name="airplane" size={16} color="#0284C7" />;
      case 'university':
        return <Ionicons name="school" size={16} color="#0D9488" />;
      default:
        return <Feather name="map-pin" size={16} color={TransitColors.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      {suggestions.slice(0, 5).map((item, index) => {
        const isLast = index === Math.min(suggestions.length, 5) - 1;
        return (
          <View key={item.id}>
            <TouchableOpacity
              style={styles.itemRow}
              activeOpacity={0.7}
              onPress={() => onSelectSuggestion(item)}
              accessibilityRole="button"
              accessibilityLabel={`Select destination ${item.name}`}
            >
              <View style={styles.iconCircle}>
                {getLocationIcon(item.category)}
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.subtitle && (
                  <Text style={styles.subtitleText} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                )}
              </View>

              <Feather name="arrow-up-left" size={16} color={TransitColors.textMuted} />
            </TouchableOpacity>

            {!isLast && <View style={styles.divider} />}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    overflow: 'hidden',
    ...TransitShadows.floating,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: TransitColors.textPrimary,
  },
  subtitleText: {
    fontSize: 11.5,
    color: TransitColors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
});
