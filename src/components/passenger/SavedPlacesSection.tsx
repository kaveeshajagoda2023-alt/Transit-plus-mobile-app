import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SavedPlace } from '@/types/location';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface SavedPlacesSectionProps {
  savedPlaces: SavedPlace[];
  onSelectPlace: (place: SavedPlace) => void;
  onManagePress: () => void;
}

export const SavedPlacesSection: React.FC<SavedPlacesSectionProps> = ({
  savedPlaces,
  onSelectPlace,
  onManagePress,
}) => {
  const getIconConfig = (type: SavedPlace['type']) => {
    switch (type) {
      case 'home':
        return {
          icon: <Ionicons name="home" size={18} color="#0284C7" />,
          bgColor: '#E0F2FE',
        };
      case 'university':
        return {
          icon: <Ionicons name="school" size={18} color="#0D9488" />,
          bgColor: '#CCFBF1',
        };
      case 'work':
        return {
          icon: <Ionicons name="briefcase" size={18} color="#EA580C" />,
          bgColor: '#FFEDD5',
        };
      default:
        return {
          icon: <Feather name="map-pin" size={18} color={TransitColors.primary} />,
          bgColor: '#F1F5F9',
        };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>SAVED PLACES</Text>
        <TouchableOpacity
          onPress={onManagePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Manage saved places"
        >
          <Text style={styles.manageText}>Manage</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Grid / Row */}
      <View style={styles.cardsRow}>
        {savedPlaces.map((place) => {
          const { icon, bgColor } = getIconConfig(place.type);
          return (
            <TouchableOpacity
              key={place.id}
              activeOpacity={0.8}
              onPress={() => onSelectPlace(place)}
              style={styles.card}
              accessibilityRole="button"
              accessibilityLabel={`Select ${place.name}, ${place.address}`}
            >
              <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                {icon}
              </View>
              <Text style={styles.placeName} numberOfLines={1}>
                {place.name}
              </Text>
              <Text style={styles.placeAddress} numberOfLines={1}>
                {place.address}
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
    marginTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: TransitColors.textMuted,
    letterSpacing: 0.6,
  },
  manageText: {
    fontSize: 13,
    fontWeight: '700',
    color: TransitColors.trainBadge,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '800',
    color: TransitColors.textPrimary,
  },
  placeAddress: {
    fontSize: 11,
    color: TransitColors.textSecondary,
    marginTop: 2,
  },
});
