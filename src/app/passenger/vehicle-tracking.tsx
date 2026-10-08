import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';

import { Feather, Ionicons } from '@expo/vector-icons';

import { TrackingHeader } from '@/components/passenger/TrackingHeader';
import { TrackingETACard } from '@/components/passenger/TrackingETACard';
import { LiveTrackingMap, LiveTrackingMapRef } from '@/components/passenger/LiveTrackingMap';
import { TrackingBottomSheet } from '@/components/passenger/TrackingBottomSheet';

import { vehicleTrackingService } from '@/services/vehicles/vehicleTrackingService';
import { routeDetailsService } from '@/services/routes/routeDetailsService';
import { routeApi } from '@/services/api/routeApi';
import { useVehicleTracking } from '@/hooks/useVehicleTracking';
import { useUserLocation } from '@/hooks/useUserLocation';
import { Vehicle } from '@/types/vehicle';
import { TransitRoute } from '@/types/route';
import { TransitColors } from '@/constants/transitTheme';

export default function VehicleTrackingScreen() {
  const params = useLocalSearchParams<{ vehicleId?: string; routeId?: string }>();
  const mapRef = useRef<LiveTrackingMapRef | null>(null);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [route, setRoute] = useState<TransitRoute | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // User GPS Location
  const { location: userLocation } = useUserLocation();

  // Load initial vehicle and route metadata
  const loadTrackingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [vehData, routeDetails] = await Promise.all([
        vehicleTrackingService.getVehicleById(params.vehicleId || 'veh-bus-42'),
        routeDetailsService.getRouteDetails(params.routeId || 'route-bus-42'),
      ]);

      setVehicle(vehData);
      setRoute({
        id: routeDetails.id,
        routeNumber: routeDetails.routeNumber,
        name: routeDetails.serviceName,
        type: routeDetails.serviceType,
        color: routeDetails.serviceType === 'bus' ? '#0F2942' : '#0D9488',
        coordinates: routeDetails.coordinates,
        stops: routeDetails.stops,
      });
    } catch (error) {
      console.error('Error loading vehicle tracking data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params.vehicleId, params.routeId]);

  useEffect(() => {
    loadTrackingData();
  }, [loadTrackingData]);

  // Live Vehicle Tracking Hook (coordinates, speed, dynamic ETA, stops away, free seats)
  const {
    isTracking,
    trackingStatus,
    vehiclePosition,
    speedKmh,
    etaMinutes,
    delayMinutes,
    stopsAway,
    nextStopName,
    nextStopDistanceMeters,
    freeSeats,
    arrivalAlertEnabled,
    setArrivalAlertEnabled,
    stopTracking,
    resumeTracking,
  } = useVehicleTracking(vehicle, route, true);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/passenger/route-details' as any);
    }
  };

  const handleToggleArrivalAlert = (val: boolean) => {
    setArrivalAlertEnabled(val);
    if (val) {
      Alert.alert(
        'Arrival Alert Enabled',
        `You will receive sound and vibration alerts 5 minutes before ${vehicle?.routeNumber || 'your vehicle'} arrives at ${nextStopName}.`
      );
    }
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
      Alert.alert('Tracking Paused', 'Live GPS position updates have been stopped.');
    } else {
      resumeTracking();
    }
  };

  const handleGetDirections = () => {
    mapRef.current?.centerOnUser();
    Alert.alert(
      'Walking Directions',
      `Walk 180m East along Market St toward ${nextStopName}. Estimated walking time: 2 mins.`
    );
  };

  const handleCenterMap = () => {
    mapRef.current?.centerOnVehicle();
  };

  const [gpsUpdateToast, setGpsUpdateToast] = useState<string | null>(null);

  // U – UPDATE: Simulate vehicle movement along route & automatically recalculate dynamic ETA
  const handleSimulateMove = async () => {
    if (!vehicle) return;
    const newLat = vehiclePosition.latitude + 0.0015;
    const newLng = vehiclePosition.longitude + 0.0015;
    const newSpeed = 38;

    try {
      const res = await routeApi.updateBusLocation(
        vehicle.id,
        { latitude: newLat, longitude: newLng },
        newSpeed,
        50,
        'on-time'
      );
      const updatedEta = res?.etaMinutes ?? Math.max(1, etaMinutes - 1);
      setGpsUpdateToast(
        `⚡ Bus GPS Updated: Moved towards next stop • Live ETA: ${updatedEta} mins!`
      );
      setTimeout(() => setGpsUpdateToast(null), 3600);
    } catch {
      setGpsUpdateToast(`⚡ Bus location updated! Live ETA: ${Math.max(1, etaMinutes - 1)} mins`);
      setTimeout(() => setGpsUpdateToast(null), 3600);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {isLoading || !vehicle ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TransitColors.primary} />
          <Text style={styles.loadingText}>Connecting to Live GPS Stream...</Text>
        </View>
      ) : (
        <View style={styles.contentWrap}>
          {/* Full-Screen Live Interactive Map */}
          <LiveTrackingMap
            ref={mapRef}
            vehicle={vehicle}
            route={route}
            vehiclePosition={vehiclePosition}
            vehicleSpeed={speedKmh}
            userLocation={userLocation}
            nextStopName={nextStopName}
            nextStopDistanceMeters={nextStopDistanceMeters}
            onCenterPress={handleCenterMap}
          />

          {/* Floating Tracking Top Header */}
          <TrackingHeader
            routeNumber={vehicle.routeNumber}
            serviceType={vehicle.type}
            speedKmh={speedKmh}
            trackingStatus={trackingStatus}
            destination={vehicle.destination}
            etaMinutes={etaMinutes}
            onBackPress={handleBack}
          />

          {/* Floating Live ETA & Delay Card */}
          <TrackingETACard
            etaMinutes={etaMinutes}
            delayMinutes={delayMinutes}
            stopsAway={stopsAway}
          />

          {/* Floating Bottom Vehicle Information Sheet */}
          <TrackingBottomSheet
            vehicle={vehicle}
            isTracking={isTracking}
            trackingStatus={trackingStatus}
            freeSeats={freeSeats}
            etaMinutes={etaMinutes}
            arrivalAlertEnabled={arrivalAlertEnabled}
            onToggleArrivalAlert={handleToggleArrivalAlert}
            onStopTrackingPress={handleToggleTracking}
            onGetDirectionsPress={handleGetDirections}
            onSimulateMovePress={handleSimulateMove}
          />

          {/* GPS Update / ETA recalculation Banner */}
          {gpsUpdateToast && (
            <View style={styles.gpsToastBanner}>
              <Ionicons name="flash" size={17} color="#38BDF8" />
              <Text style={styles.gpsToastText}>{gpsUpdateToast}</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentWrap: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: TransitColors.textSecondary,
  },
  gpsToastBanner: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 40,
  },
  gpsToastText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
