import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { RouteDetailsHeader } from '@/components/passenger/RouteDetailsHeader';
import { RouteDetailsCard } from '@/components/passenger/RouteDetailsCard';
import { RouteDetailsMap } from '@/components/passenger/RouteDetailsMap';
import { RouteActionButtons } from '@/components/passenger/RouteActionButtons';
import { JourneyRouteSection } from '@/components/passenger/JourneyRouteSection';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

import { routeDetailsService } from '@/services/routes/routeDetailsService';
import { useLiveETA } from '@/hooks/useLiveETA';
import { useLiveVehicle } from '@/hooks/useLiveVehicle';
import { useUserLocation } from '@/hooks/useUserLocation';
import { RouteDetails } from '@/types/route';
import { TransitColors } from '@/constants/transitTheme';

export default function RouteDetailsScreen() {
  const params = useLocalSearchParams<{
    routeId?: string;
    originName?: string;
    destinationName?: string;
  }>();

  const [route, setRoute] = useState<RouteDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState<boolean>(false);

  // User GPS Location
  const { location: userLocation } = useUserLocation();

  // Load Route Details Data
  const loadRouteDetails = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await routeDetailsService.getRouteDetails(
        params.routeId,
        params.originName,
        params.destinationName
      );
      setRoute(data);
      setIsBookmarked(!!data.isBookmarked);
    } catch (err) {
      console.error('Failed to load route details:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [params.routeId, params.originName, params.destinationName]);

  useEffect(() => {
    loadRouteDetails();
  }, [loadRouteDetails]);

  // Dynamic Live ETA and Vehicle distance hooks
  const {
    etaMinutes,
    distanceKm,
    stopsAway,
    speedKmh: liveSpeed,
    liveStatus,
  } = useLiveETA(route, true);

  // Smooth realistic vehicle movement along waypoints
  const { vehiclePosition, speedKmh: movingSpeed } = useLiveVehicle(
    route?.coordinates || [],
    route?.speedKmh || 24,
    true
  );

  // Navigation handlers
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/passenger/search-results' as any);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!route) return;
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    await routeDetailsService.toggleBookmark(route.id, {
      origin: route.origin,
      destination: route.destination,
      customName: `${route.routeNumber}: ${route.origin} → ${route.destination}`,
    });
  };

  const handleNotificationToggle = () => {
    const nextState = !isNotificationEnabled;
    setIsNotificationEnabled(nextState);
    if (nextState) {
      Alert.alert(
        'Arrival Reminder Set',
        `You will be notified 5 minutes before ${route?.routeNumber || 'your vehicle'} arrives at ${route?.boardingStop.name || 'your stop'}.`
      );
    }
  };

  const handleTrackService = () => {
    if (!route) return;
    router.push({
      pathname: '/passenger/vehicle-tracking' as any,
      params: {
        vehicleId: route.vehicleId,
        routeId: route.id,
      },
    });
  };

  const handleExpandMap = () => {
    if (!route) return;
    router.push({
      pathname: '/passenger/vehicle-tracking' as any,
      params: {
        vehicleId: route.vehicleId,
        routeId: route.id,
      },
    });
  };

  const handleCenterMap = () => {
    // Map centered smoothly by RouteDetailsMap
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Screen Header */}
      <RouteDetailsHeader
        title="Route Details"
        routeNumber={route?.routeNumber || 'Bus 42'}
        destination={route?.destination || 'University Malabe Campus'}
        etaMinutes={etaMinutes}
        isBookmarked={isBookmarked}
        onBackPress={handleBack}
        onBookmarkToggle={handleBookmarkToggle}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={TransitColors.primary} />
          <Text style={styles.loadingText}>Loading route details & live ETA...</Text>
        </View>
      ) : hasError || !route ? (
        <View style={styles.centerContainer}>
          <Feather name="alert-triangle" size={40} color="#DC2626" />
          <Text style={styles.errorTitle}>Unable to load route details</Text>
          <Text style={styles.errorSubtitle}>
            Please check your connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadRouteDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Route Information Card with Live ETA, Status, and Occupancy */}
          <RouteDetailsCard
            route={route}
            dynamicEtaMinutes={etaMinutes}
            dynamicDistanceKm={distanceKm}
            dynamicStopsAway={stopsAway}
            liveStatus={liveStatus}
          />

          {/* Interactive Live Map */}
          <RouteDetailsMap
            route={route}
            vehiclePosition={vehiclePosition}
            vehicleSpeed={movingSpeed || liveSpeed}
            userLocation={userLocation}
            onExpandMap={handleExpandMap}
            onCenterMap={handleCenterMap}
          />

          {/* Action Buttons: Notify 5m Before & Track Service */}
          <RouteActionButtons
            isNotificationEnabled={isNotificationEnabled}
            onToggleNotification={handleNotificationToggle}
            onTrackService={handleTrackService}
          />

          {/* Journey Route Stops Progression */}
          <JourneyRouteSection
            stops={route.stops}
            baseEtaMinutes={etaMinutes}
          />
        </ScrollView>
      )}

      {/* Persistent Bottom Navigation */}
      <BottomNavigation currentTab="routes" hasUnreadAlerts={true} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
    color: TransitColors.textSecondary,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    marginTop: 14,
  },
  errorSubtitle: {
    fontSize: 13,
    color: TransitColors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 18,
    backgroundColor: TransitColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
