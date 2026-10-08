import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { TripData } from '@/types/trip';

interface DashboardHeaderProps {
  trip: TripData;
  onRefresh?: () => Promise<void> | void;
  onProfilePress?: () => void;
  isConnected?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  trip,
  onRefresh,
  onProfilePress,
  isConnected = true,
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.leftSection}
        onPress={onProfilePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Driver Profile"
      >
        {/* TransitOps square badge */}
        <View style={styles.badgeSquare}>
          <MaterialCommunityIcons name="badge-account-outline" size={20} color="#FFFFFF" />
        </View>

        {/* Title & Driver details */}
        <View style={styles.titleColumn}>
          <Text style={styles.titleText}>TransitOps • {trip.busNumber}</Text>
          <Text style={styles.subtitleText}>
            {trip.driverName} • {trip.routeName}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Right telemetry/sync button */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={handleRefresh}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Refresh telemetry"
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons
              name="sync"
              size={20}
              color={isConnected ? '#0F2942' : '#DC2626'}
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
    flex: 1,
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
    flex: 1,
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
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
