import { useState, useCallback, useEffect } from 'react';
import { TransitLocation, SavedPlace, RecentSearch } from '@/types/location';
import {
  DepartureOption,
  TransportModeOption,
  RouteSearchCriteria,
} from '@/types/journey';
import { CURRENT_LOCATION_DEFAULT, MOCK_LOCATIONS } from '@/services/mock/locations';
import { INITIAL_SAVED_PLACES } from '@/services/mock/savedPlaces';
import { INITIAL_RECENT_SEARCHES } from '@/services/mock/recentSearches';
import { routeSearchService } from '@/services/routes/routeSearchService';

export interface UseJourneySearchReturn {
  origin: TransitLocation | null;
  destination: TransitLocation | null;
  destinationText: string;
  departureOption: DepartureOption;
  departureTime: string;
  transportMode: TransportModeOption;
  suggestions: TransitLocation[];
  savedPlaces: SavedPlace[];
  recentSearches: RecentSearch[];
  validationError: string | null;
  setOrigin: (origin: TransitLocation | null) => void;
  setDestination: (destination: TransitLocation | null) => void;
  setDepartureOption: (option: DepartureOption) => void;
  setDepartureTime: (time: string) => void;
  setTransportMode: (mode: TransportModeOption) => void;
  handleDestinationTextChange: (text: string) => void;
  selectLocationSuggestion: (location: TransitLocation) => void;
  selectSavedPlace: (place: SavedPlace) => void;
  selectRecentSearch: (recent: RecentSearch) => void;
  clearOrigin: () => void;
  clearDestination: () => void;
  swapLocations: () => void;
  resetJourney: () => void;
  deleteRecentSearch: (id: string) => void;
  clearAllRecentSearches: () => void;
  validateSearch: () => RouteSearchCriteria | null;
}

export function useJourneySearch(): UseJourneySearchReturn {
  const [origin, setOrigin] = useState<TransitLocation | null>(CURRENT_LOCATION_DEFAULT);
  const [destination, setDestination] = useState<TransitLocation | null>(null);
  const [destinationText, setDestinationText] = useState<string>('');
  const [departureOption, setDepartureOption] = useState<DepartureOption>('leave-now');
  const [departureTime, setDepartureTime] = useState<string>('09:45 AM');
  const [transportMode, setTransportMode] = useState<TransportModeOption>('both');
  const [suggestions, setSuggestions] = useState<TransitLocation[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(INITIAL_SAVED_PLACES);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(INITIAL_RECENT_SEARCHES);
  const [validationError, setValidationError] = useState<string | null>(
    'Please select a valid destination to find routes'
  );

  // Live autocomplete search
  const handleDestinationTextChange = useCallback(async (text: string) => {
    setDestinationText(text);
    if (!text.trim()) {
      setSuggestions([]);
      setDestination(null);
      setValidationError('Please select a valid destination to find routes');
      return;
    }

    try {
      const results = await routeSearchService.searchLocations(text);
      setSuggestions(results);
    } catch (e) {
      setSuggestions([]);
    }
  }, []);

  const selectLocationSuggestion = useCallback((location: TransitLocation) => {
    setDestination(location);
    setDestinationText(location.name);
    setSuggestions([]);
    setValidationError(null);
  }, []);

  const selectSavedPlace = useCallback((place: SavedPlace) => {
    const matchedLoc: TransitLocation = {
      id: place.id,
      name: place.name,
      subtitle: place.address,
      category: 'landmark',
      latitude: place.latitude,
      longitude: place.longitude,
    };
    setDestination(matchedLoc);
    setDestinationText(place.name);
    setSuggestions([]);
    setValidationError(null);
  }, []);

  const selectRecentSearch = useCallback((recent: RecentSearch) => {
    const matched =
      MOCK_LOCATIONS.find((l) => l.id === recent.destinationId) || {
        id: recent.destinationId,
        name: recent.destination,
        subtitle: recent.serviceSummary,
        category: 'station',
      };

    setDestination(matched);
    setDestinationText(recent.destination);
    setSuggestions([]);
    setValidationError(null);
  }, []);

  const clearOrigin = useCallback(() => {
    setOrigin(null);
    setValidationError('Please select a starting point');
  }, []);

  const clearDestination = useCallback(() => {
    setDestination(null);
    setDestinationText('');
    setSuggestions([]);
    setValidationError('Please select a valid destination to find routes');
  }, []);

  const swapLocations = useCallback(() => {
    const prevOrigin = origin;
    const prevDest = destination;

    setOrigin(prevDest);
    setDestination(prevOrigin);
    setDestinationText(prevOrigin ? prevOrigin.name : '');
    setSuggestions([]);

    if (!prevOrigin) {
      setValidationError('Please select a valid destination to find routes');
    } else {
      setValidationError(null);
    }
  }, [origin, destination]);

  const resetJourney = useCallback(() => {
    setOrigin(CURRENT_LOCATION_DEFAULT);
    setDestination(null);
    setDestinationText('');
    setDepartureOption('leave-now');
    setDepartureTime('09:45 AM');
    setTransportMode('both');
    setSuggestions([]);
    setValidationError('Please select a valid destination to find routes');
  }, []);

  const deleteRecentSearch = useCallback((id: string) => {
    setRecentSearches((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAllRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const validateSearch = useCallback((): RouteSearchCriteria | null => {
    if (!origin) {
      setValidationError('Please select a valid starting point');
      return null;
    }
    if (!destination && !destinationText.trim()) {
      setValidationError('Please select a valid destination to find routes');
      return null;
    }

    setValidationError(null);

    const destTitle = destination ? destination.name : destinationText.trim();
    const destId = destination ? destination.id : 'custom-dest';

    return {
      originId: origin.id,
      originName: origin.name,
      destinationId: destId,
      destinationName: destTitle,
      transportMode,
      departureOption,
      departureTime,
    };
  }, [origin, destination, destinationText, transportMode, departureOption, departureTime]);

  return {
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
    setOrigin,
    setDestination,
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
  };
}
