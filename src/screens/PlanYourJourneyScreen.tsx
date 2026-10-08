import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { RouteSearchHeader } from '@/components/passenger/RouteSearchHeader';
import { JourneyPlannerCard } from '@/components/passenger/JourneyPlannerCard';
import { DestinationSuggestions } from '@/components/passenger/DestinationSuggestions';
import { ValidationBanner } from '@/components/passenger/ValidationBanner';
import { TransportModeSelector } from '@/components/passenger/TransportModeSelector';
import { SavedPlacesSection } from '@/components/passenger/SavedPlacesSection';
import { RecentSearchesSection } from '@/components/passenger/RecentSearchesSection';
import { DepartureSelectorModal } from '@/components/passenger/DepartureSelectorModal';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

import { useJourneySearch } from '@/hooks/useJourneySearch';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

export function PlanYourJourneyScreen() {
  const {
    origin,
    destination,
    destinationText,
    departureOption,
    departureTime,
    transportMode,
    suggestions,
    savedPlaces,
    recentSearches,
    validationError,
    setDepartureOption,
    setDepartureTime,
    setTransportMode,
    handleDestinationTextChange,
    selectLocationSuggestion,
    selectSavedPlace,
    selectRecentSearch,
    clearOrigin,
    clearDestination,
    swapLocations,
    resetJourney,
    deleteRecentSearch,
    clearAllRecentSearches,
    validateSearch,
  } = useJourneySearch();

  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/' as any);
    }
  };

  const handleManageSavedPlaces = () => {
    router.push('/passenger/saved-places' as any);
  };

  const handleFindRoutes = () => {
    const criteria = validateSearch();
    if (!criteria) return;

    router.push({
      pathname: '/passenger/search-results' as any,
      params: {
        originId: criteria.originId,
        originName: criteria.originName,
        destinationId: criteria.destinationId,
        destinationName: criteria.destinationName,
        transportMode: criteria.transportMode,
        departureOption: criteria.departureOption,
        departureTime: criteria.departureTime,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <RouteSearchHeader
        onBack={handleBack}
        onReset={resetJourney}
        title="Plan Your Journey"
      />

      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Journey Planner Input Card */}
          <JourneyPlannerCard
            origin={origin}
            destination={destination}
            destinationText={destinationText}
            departureOption={departureOption}
            departureTime={departureTime}
            onDestinationTextChange={handleDestinationTextChange}
            onClearOrigin={clearOrigin}
            onClearDestination={clearDestination}
            onSwap={swapLocations}
            onOpenDepartureModal={() => setIsTimeModalVisible(true)}
            onSelectDepartureOption={setDepartureOption}
          />

          {/* Autocomplete Suggestions Dropdown */}
          <DestinationSuggestions
            suggestions={suggestions}
            onSelectSuggestion={selectLocationSuggestion}
          />

          {/* Validation Banner */}
          <ValidationBanner message={validationError} />

          {/* Transport Mode Selector (Both, Bus Only, Train Only) */}
          <TransportModeSelector
            selectedMode={transportMode}
            onSelectMode={setTransportMode}
          />

          {/* Saved Places Section (Home, University, Work) */}
          <SavedPlacesSection
            savedPlaces={savedPlaces}
            onSelectPlace={selectSavedPlace}
            onManagePress={handleManageSavedPlaces}
          />

          {/* Recent Searches Section */}
          <RecentSearchesSection
            recentSearches={recentSearches}
            onSelectSearch={selectRecentSearch}
            onDeleteSearch={deleteRecentSearch}
            onClearAll={clearAllRecentSearches}
          />

          {/* Find Routes Primary Action Button */}
          <TouchableOpacity
            style={[
              styles.findRoutesBtn,
              !destination && !destinationText.trim() && styles.findRoutesBtnDisabled,
            ]}
            onPress={handleFindRoutes}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Find transit routes"
          >
            <Feather name="search" size={18} color="#FFFFFF" style={styles.searchIcon} />
            <Text style={styles.findRoutesBtnText}>Find Available Routes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Time & Departure Selector Modal */}
      <DepartureSelectorModal
        visible={isTimeModalVisible}
        currentOption={departureOption}
        currentTime={departureTime}
        onClose={() => setIsTimeModalVisible(false)}
        onSelect={(option, time) => {
          setDepartureOption(option);
          setDepartureTime(time);
        }}
      />

      {/* Persistent Bottom Navigation with Routes Tab Active */}
      <BottomNavigation currentTab="routes" hasUnreadAlerts={true} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  findRoutesBtn: {
    backgroundColor: TransitColors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    ...TransitShadows.card,
  },
  findRoutesBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  searchIcon: {
    marginRight: 8,
  },
  findRoutesBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
