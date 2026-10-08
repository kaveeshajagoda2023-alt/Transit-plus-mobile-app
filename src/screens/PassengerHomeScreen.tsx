import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Header } from '@/components/passenger/Header';
import { SearchBar } from '@/components/passenger/SearchBar';
import { TransportFilter } from '@/components/passenger/TransportFilter';
import { MapControls } from '@/components/passenger/MapControls';
import { NearbyServices } from '@/components/passenger/NearbyServices';
import { SelectedVehicleSheet } from '@/components/passenger/SelectedVehicleSheet';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { TransitMap, TransitMapRef } from '@/components/map/TransitMap';

import { useUserLocation } from '@/hooks/useUserLocation';
import { useLiveVehicles } from '@/hooks/useLiveVehicles';
import { useNearbyServices } from '@/hooks/useNearbyServices';
import { Vehicle } from '@/types/vehicle';
import { NearbyService } from '@/types/nearbyService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function PassengerHomeScreen() {
  const mapRef = useRef<TransitMapRef>(null);

  // GPS User Location
  const { location: userLocation, refreshLocation } = useUserLocation();

  // Real-time Vehicle Tracking and Live Simulation
  const {
    vehicles,
    filteredVehicles,
    routes,
    filteredRoutes,
    selectedVehicle,
    setSelectedVehicle,
    filter,
    setFilter,
    lastUpdatedText,
    isLoading: isVehiclesLoading,
    refresh: refreshVehicles,
  } = useLiveVehicles(true);

  // Synchronized Nearby Services
  const {
    filteredServices,
    isLoading: isServicesLoading,
    refresh: refreshServices,
  } = useNearbyServices(vehicles, filter);

  // Map Controls callbacks
  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleCenterUser = () => {
    mapRef.current?.centerOnUser();
  };

  const handleSelectVehicle = (vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
    if (vehicle) {
      mapRef.current?.animateToVehicle(vehicle);
    }
  };

  const handleSearchPress = () => {
    router.push('/passenger/route-search' as any);
  };

  const handleServiceCardPress = (service: NearbyService) => {
    if (service.vehicleId) {
      router.push({
        pathname: '/passenger/vehicle-tracking' as any,
        params: { vehicleId: service.vehicleId },
      });
    } else if (service.routeId) {
      router.push({
        pathname: '/passenger/route-details' as any,
        params: { routeId: service.routeId },
      });
    }
  };

  const handleTrackLiveVehicle = (vehicle: Vehicle) => {
    router.push({
      pathname: '/passenger/vehicle-tracking' as any,
      params: { vehicleId: vehicle.id },
    });
  };

  const handleRefreshAll = async () => {
    await Promise.all([refreshLocation(), refreshVehicles(), refreshServices()]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TransitPulse Header */}
      <Header
        onMenuPress={() => {
          Alert.alert(
            'TransitPulse Menu',
            'Choose a transit portal or action:',
            [
              {
                text: 'Staff & Conductor Portal (Bus #4028)',
                onPress: () => router.push('/staff/login' as any),
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
        }}
        onSearchPress={handleSearchPress}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Map Viewport Area */}
        <View style={styles.mapSection}>
          {/* Live Map with Markers and Routes */}
          <TransitMap
            ref={mapRef}
            userLocation={userLocation}
            vehicles={filteredVehicles}
            routes={filteredRoutes}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={handleSelectVehicle}
          />

          {/* Floating Search Bar and Filters over Map */}
          <View style={styles.topFloatingOverlay}>
            <SearchBar onSearchPress={handleSearchPress} />
            <TransportFilter
              activeFilter={filter}
              onFilterChange={(newFilter) => setFilter(newFilter)}
            />
          </View>

          {/* Floating Map Zoom and Camera Controls */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onCenterLocation={handleCenterUser}
          />

          {/* Marker Detail Sheet overlay (shown when marker is tapped) */}
          <SelectedVehicleSheet
            vehicle={selectedVehicle}
            onClose={() => setSelectedVehicle(null)}
            onTrackPress={handleTrackLiveVehicle}
          />
        </View>

        {/* Nearby Services Bottom Sheet Card */}
        <View style={styles.bottomSheetWrapper}>
          <NearbyServices
            services={filteredServices}
            isLoading={isVehiclesLoading || isServicesLoading}
            lastUpdatedText={lastUpdatedText}
            onServicePress={handleServiceCardPress}
            onResetFilter={() => setFilter('all')}
            onRefresh={handleRefreshAll}
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation currentTab="home" hasUnreadAlerts={true} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  mapSection: {
    height: Math.max(SCREEN_HEIGHT * 0.46, 340),
    width: '100%',
    position: 'relative',
    backgroundColor: '#E0F2FE',
  },
  topFloatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
  },
  bottomSheetWrapper: {
    marginTop: -20,
    zIndex: 20,
  },
});
