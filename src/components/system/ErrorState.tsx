import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';

interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  isRetrying?: boolean;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load routes',
  description = 'Something went wrong while retrieving live transit data.',
  retryLabel = 'Try Again',
  isRetrying = false,
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      {/* Icon Circle */}
      <View style={styles.iconCircle}>
        <Feather name="alert-triangle" size={24} color="#DC2626" />
      </View>

      {/* Text Details */}
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.descText}>{description}</Text>

      {/* Retry Button */}
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          disabled={isRetrying}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.retryInner}>
              <Feather name="rotate-cw" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.retryButtonText}>{retryLabel}</Text>
            </View>
          )}
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
    backgroundColor: '#FEF2F2',
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
  retryButton: {
    backgroundColor: TransitColors.primary,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
