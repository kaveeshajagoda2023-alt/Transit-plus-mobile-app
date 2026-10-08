import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { TerminalStatus } from '@/types/staff';
import { TransitColors } from '@/constants/transitTheme';

interface StaffTerminalHeaderProps {
  status: TerminalStatus;
  onRefresh?: () => Promise<void> | void;
  onToggleOffline?: () => void;
}

export const StaffTerminalHeader: React.FC<StaffTerminalHeaderProps> = ({
  status,
  onRefresh,
  onToggleOffline,
}) => {
  const [spinValue] = useState(new Animated.Value(0));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    Animated.timing(spinValue, {
      toValue: 1,
      duration: 600,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0);
      setIsRefreshing(false);
    });

    if (onRefresh) {
      await onRefresh();
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isConnected = status.connectionStatus === 'CONNECTED';

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {/* Square dark blue badge icon with ID card */}
        <View style={styles.badgeSquare}>
          <MaterialCommunityIcons name="badge-account-outline" size={20} color="#FFFFFF" />
        </View>

        {/* Title & Authority metadata */}
        <View style={styles.titleColumn}>
          <Text style={styles.titleText}>TransitOps • {status.vehicleNumber}</Text>
          <Text style={styles.subtitleText}>{status.transitAuthority}</Text>
        </View>
      </View>

      {/* Right sync/refresh button */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          onLongPress={onToggleOffline}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Refresh terminal telemetry"
          accessibilityHint="Refreshes connection status. Long press toggles offline test mode."
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons
              name="sync"
              size={20}
              color={isConnected ? TransitColors.primary : '#DC2626'}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeSquare: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#0F2942',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2942',
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
});
