import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { NearbyService } from '@/types/nearbyService';
import { NearbyServiceCard } from './NearbyServiceCard';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface NearbyServicesProps {
  services: NearbyService[];
  isLoading?: boolean;
  lastUpdatedText?: string;
  onServicePress?: (service: NearbyService) => void;
  onResetFilter?: () => void;
  onRefresh?: () => void;
}

export const NearbyServices: React.FC<NearbyServicesProps> = ({
  services,
  isLoading = false,
  lastUpdatedText = 'Updated just now',
  onServicePress,
  onResetFilter,
  onRefresh,
}) => {
  return (
    <View style={styles.sheetContainer}>
      {/* Top Drag Handle */}
      <View style={styles.handleBarContainer}>
        <View style={styles.handleBar} />
      </View>

      {/* Sheet Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithLiveDot}>
          <View style={styles.livePulseDot} />
          <Text style={styles.sheetTitle}>Nearby Services</Text>
        </View>

        <TouchableOpacity
          style={styles.updatedRow}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <Feather
            name="rotate-cw"
            size={12}
            color={TransitColors.textSecondary}
            style={styles.refreshIcon}
          />
          <Text style={styles.updatedText}>{lastUpdatedText}</Text>
        </TouchableOpacity>
      </View>

      {/* Services Content */}
      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={TransitColors.primary} />
            <Text style={styles.loadingText}>Fetching nearby live services...</Text>
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="bus-outline"
              size={36}
              color={TransitColors.textMuted}
            />
            <Text style={styles.emptyTitle}>No matching services found</Text>
            <Text style={styles.emptySubtitle}>
              Try selecting "All" or expanding your filter.
            </Text>
            {onResetFilter && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={onResetFilter}
                activeOpacity={0.8}
              >
                <Text style={styles.resetButtonText}>Show All Services</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          services.map((service) => (
            <NearbyServiceCard
              key={service.id}
              service={service}
              onPress={onServicePress}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.bottomSheet,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  titleWithLiveDot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulseDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: TransitColors.liveGreen,
    marginRight: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    letterSpacing: -0.3,
  },
  updatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  refreshIcon: {
    marginRight: 4,
  },
  updatedText: {
    fontSize: 11,
    fontWeight: '500',
    color: TransitColors.textSecondary,
    fontStyle: 'italic',
  },
  contentContainer: {
    marginTop: 4,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: TransitColors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: TransitColors.textPrimary,
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: TransitColors.textSecondary,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 14,
    backgroundColor: TransitColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
