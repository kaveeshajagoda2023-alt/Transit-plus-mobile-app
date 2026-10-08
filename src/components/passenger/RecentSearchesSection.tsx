import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RecentSearch } from '@/types/location';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface RecentSearchesSectionProps {
  recentSearches: RecentSearch[];
  onSelectSearch: (search: RecentSearch) => void;
  onDeleteSearch: (id: string) => void;
  onClearAll: () => void;
}

export const RecentSearchesSection: React.FC<RecentSearchesSectionProps> = ({
  recentSearches,
  onSelectSearch,
  onDeleteSearch,
  onClearAll,
}) => {
  const handleClearHistoryConfirm = () => {
    if (recentSearches.length === 0) return;

    Alert.alert(
      'Clear Search History',
      'Are you sure you want to remove all recent searches?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: onClearAll },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
        {recentSearches.length > 0 && (
          <TouchableOpacity
            onPress={handleClearHistoryConfirm}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Clear all search history"
          >
            <Text style={styles.clearHistoryText}>Clear History</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Card Container */}
      <View style={styles.cardContainer}>
        {recentSearches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="clock" size={24} color={TransitColors.textMuted} />
            <Text style={styles.emptyText}>No recent searches</Text>
          </View>
        ) : (
          recentSearches.map((item, index) => {
            const isLast = index === recentSearches.length - 1;
            const isTrain = item.serviceType === 'train';
            const badgeBg = isTrain ? TransitColors.primary : TransitColors.trainBadge;

            return (
              <View key={item.id}>
                <View style={styles.searchItemRow}>
                  {/* Selectable item area */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => onSelectSearch(item)}
                    style={styles.searchItemContent}
                    accessibilityRole="button"
                    accessibilityLabel={`Search route to ${item.destination}`}
                  >
                    {/* Clock Icon Circle */}
                    <View style={styles.clockCircle}>
                      <Feather
                        name="clock"
                        size={16}
                        color={TransitColors.textSecondary}
                      />
                    </View>

                    {/* Text Details */}
                    <View style={styles.detailsColumn}>
                      <Text style={styles.destinationTitle} numberOfLines={1}>
                        {item.destination}
                      </Text>
                      <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                          <Text style={styles.badgeText}>{item.serviceBadge}</Text>
                        </View>
                        <Text style={styles.summaryText}>{item.serviceSummary}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Delete Item Button (separate sibling button, not nested) */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDeleteSearch(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete search ${item.destination}`}
                  >
                    <Feather name="x" size={16} color={TransitColors.textMuted} />
                  </TouchableOpacity>
                </View>

                {!isLast && <View style={styles.divider} />}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
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
  clearHistoryText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  searchItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 8,
  },
  searchItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  clockCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsColumn: {
    flex: 1,
  },
  destinationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TransitColors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  summaryText: {
    fontSize: 12,
    color: TransitColors.textSecondary,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
  },
  emptyContainer: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    color: TransitColors.textMuted,
    fontWeight: '600',
  },
});
