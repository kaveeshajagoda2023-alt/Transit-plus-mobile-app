import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';

interface EmptyStateProps {
  iconName?: keyof typeof Feather.glyphMap;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = 'map-pin',
  title = 'No routes found',
  description = 'Try changing your destination or transport mode.',
  actionLabel = 'Modify Search',
  onAction,
}) => {
  return (
    <View style={styles.container}>
      {/* Icon Circle */}
      <View style={styles.iconCircle}>
        <Feather name={iconName} size={24} color={TransitColors.textMuted} />
      </View>

      {/* Text Details */}
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.descText}>{description}</Text>

      {/* Action Button */}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    textAlign: 'center',
  },
  descText: {
    fontSize: 13,
    color: TransitColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
    maxWidth: 280,
  },
  actionButton: {
    backgroundColor: TransitColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
