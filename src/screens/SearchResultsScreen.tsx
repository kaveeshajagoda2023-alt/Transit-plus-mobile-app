import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

import { JourneySummaryCard } from '@/components/passenger/JourneySummaryCard';
import { SortChipBar } from '@/components/passenger/SortChipBar';
import { LiveDeparturesHeader } from '@/components/passenger/LiveDeparturesHeader';
import { RouteResultCard } from '@/components/passenger/RouteResultCard';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

import { routeSearchService } from '@/services/routes/routeSearchService';
import { routeApi } from '@/services/api/routeApi';
import {
  RouteSearchResult,
  RouteSortOption,
  TransportModeOption,
  DepartureOption,
} from '@/types/journey';
import { TransitColors } from '@/constants/transitTheme';

export function SearchResultsScreen() {
  const params = useLocalSearchParams<{
    originName?: string;
    destinationName?: string;
    transportMode?: TransportModeOption;
    departureOption?: DepartureOption;
    departureTime?: string;
  }>();

  const origin = params.originName || 'Market Square';
  const destination = params.destinationName || 'University Malabe Campus';
  const transportMode = (params.transportMode as TransportModeOption) || 'both';
  const departureOption = (params.departureOption as DepartureOption) || 'leave-now';
  const departureTime = params.departureTime || '09:45 AM';

  const [routes, setRoutes] = useState<RouteSearchResult[]>([]);
  const [selectedSort, setSelectedSort] = useState<RouteSortOption>('fastest');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [savedRouteIds, setSavedRouteIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved favourite routes on mount
  useEffect(() => {
    routeApi
      .getSavedRoutes()
      .then((saved) => {
        setSavedRouteIds(new Set(saved.map((s) => s.routeId)));
      })
      .catch(() => {});
  }, []);

  // C – Create / D – Delete: Toggle save favourite trip
  const handleSaveRoute = async (routeItem: RouteSearchResult) => {
    const isCurrentlySaved = savedRouteIds.has(routeItem.id);
    if (isCurrentlySaved) {
      setSavedRouteIds((prev) => {
        const next = new Set(prev);
        next.delete(routeItem.id);
        return next;
      });
      await routeApi.deleteSavedRoute(routeItem.id);
      setToastMessage(`Removed ${routeItem.routeNumber} from saved favourites.`);
    } else {
      setSavedRouteIds((prev) => new Set(prev).add(routeItem.id));
      await routeApi.saveRoute({
        routeId: routeItem.id,
        origin: routeItem.originName,
        destination: routeItem.destinationName,
        customName: `${routeItem.routeNumber}: ${routeItem.originName} → ${routeItem.destinationName}`,
        isStarred: true,
      });
      setToastMessage(`Saved ${routeItem.routeNumber} to favourite trips! (Live ETA: ${routeItem.etaMinutes}m)`);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Load route search results
  const fetchRoutes = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await routeSearchService.searchRoutes({
        originName: origin,
        destinationName: destination,
        transportMode,
        departureOption,
        departureTime,
        sortBy: selectedSort,
      });
      setRoutes(data);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination, transportMode, departureOption, departureTime, selectedSort]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Handle live ETA update simulation
  useEffect(() => {
    if (routes.length === 0 || isLoading) return;

    const timer = setInterval(() => {
      setRoutes((prev) =>
        prev.map((r) => {
          if (r.etaMinutes > 1) {
            return { ...r, etaMinutes: r.etaMinutes - 1 };
          }
          return r;
        })
      );
    }, 15000);

    return () => clearInterval(timer);
  }, [isLoading, routes.length]);

  // Handle sort change
  const handleSortChange = (newSort: RouteSortOption) => {
    setSelectedSort(newSort);
    setRoutes((prev) => routeSearchService.sortRoutes(prev, newSort));
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/passenger/route-search' as any);
    }
  };

  const handleEditJourney = () => {
    router.push({
      pathname: '/passenger/route-search' as any,
      params: {
        originName: origin,
        destinationName: destination,
      },
    });
  };

  const handleFilterSettings = () => {
    Alert.alert(
      'Route Preferences',
      'Filter by max walking distance, transfer preferences, and accessibility options.'
    );
  };

  const handleRouteSelect = (route: RouteSearchResult) => {
    router.push({
      pathname: '/passenger/route-details' as any,
      params: {
        routeId: route.id,
        routeNumber: route.routeNumber,
        serviceName: route.serviceName,
        originName: origin,
        destinationName: destination,
      },
    });
  };

  const departureLabel =
    departureOption === 'leave-now'
      ? 'Leave now'
      : departureOption === 'depart-at'
      ? `Depart at ${departureTime}`
      : `Arrive by ${departureTime}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header matching screenshot */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color={TransitColors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>TransitPulse</Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={handleFilterSettings}
          accessibilityRole="button"
          accessibilityLabel="Filter preferences"
        >
          <Feather name="sliders" size={20} color={TransitColors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* Journey Summary Box */}
        <View style={styles.summaryBoxWrap}>
          <JourneySummaryCard
            originName={origin}
            destinationName={destination}
            departureLabel={departureLabel}
            onEditPress={handleEditJourney}
          />
        </View>

        {/* Sort Chips Bar */}
        <SortChipBar
          selectedSort={selectedSort}
          onSelectSort={handleSortChange}
        />

        {/* Results List */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={TransitColors.primary} />
            <Text style={styles.loadingText}>Finding best route options...</Text>
          </View>
        ) : hasError ? (
          <View style={styles.centerContainer}>
            <Feather name="alert-triangle" size={36} color="#DC2626" />
            <Text style={styles.errorTitle}>Unable to load routes</Text>
            <Text style={styles.errorSubtitle}>
              Please check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchRoutes}>
              <Text style={styles.retryButtonText}>Retry Search</Text>
            </TouchableOpacity>
          </View>
        ) : routes.length === 0 ? (
          <View style={styles.centerContainer}>
            <Feather name="map-pin" size={36} color={TransitColors.textMuted} />
            <Text style={styles.emptyTitle}>No routes found</Text>
            <Text style={styles.emptySubtitle}>
              Try modifying your journey or transport mode.
            </Text>
            <TouchableOpacity
              style={styles.modifyButton}
              onPress={handleEditJourney}
            >
              <Text style={styles.modifyButtonText}>Modify Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={routes}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={<LiveDeparturesHeader />}
            renderItem={({ item }) => (
              <RouteResultCard
                route={item}
                onPress={handleRouteSelect}
                onSavePress={handleSaveRoute}
                isSaved={savedRouteIds.has(item.id)}
              />
            )}
          />
        )}

        {/* Live Feedback Toast */}
        {toastMessage && (
          <View style={styles.toastBanner}>
            <Ionicons name="bookmark" size={17} color="#0284C7" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TransitColors.primary,
    letterSpacing: -0.3,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  summaryBoxWrap: {
    marginBottom: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: TransitColors.textSecondary,
    fontWeight: '600',
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 13,
    color: TransitColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: TransitColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: TransitColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  modifyButton: {
    marginTop: 16,
    backgroundColor: TransitColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  modifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  toastBanner: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
