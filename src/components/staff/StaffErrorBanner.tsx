import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface StaffErrorBannerProps {
  message?: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const StaffErrorBanner: React.FC<StaffErrorBannerProps> = ({
  message,
  onDismiss,
  onRetry,
}) => {
  const displayMsg = message || 'Invalid Staff ID or password. Please verify credentials or contact MTA Dispatch.';

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Feather name="alert-triangle" size={18} color="#DC2626" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.bannerTitle}>Terminal Access Denied</Text>
          <Text style={styles.bannerMessage}>{displayMsg}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onDismiss}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dismiss error banner"
          >
            <Feather name="x" size={16} color="#991B1B" />
          </TouchableOpacity>
        )}
      </View>

      {onRetry && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={onRetry}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.retryBtnText}>Retry Authentication</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textWrap: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: -0.2,
  },
  bannerMessage: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 16,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
