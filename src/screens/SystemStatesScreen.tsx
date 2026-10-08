import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';

import { Header } from '@/components/passenger/Header';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { StateCard } from '@/components/system/StateCard';
import { LoadingState } from '@/components/system/LoadingState';
import { TelemetryState } from '@/components/system/TelemetryState';
import { EmptyState } from '@/components/system/EmptyState';
import { ErrorState } from '@/components/system/ErrorState';

import { StateFilter } from '@/types/systemState';
import { systemStateService } from '@/services/system/systemStateService';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

export function SystemStatesScreen() {
  const [selectedFilter, setSelectedFilter] = useState<StateFilter>('all');
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const filterTabs: { key: StateFilter; label: string }[] = [
    { key: 'all', label: 'All States' },
    { key: 'loading', label: 'Loading' },
    { key: 'empty', label: 'Empty' },
    { key: 'error', label: 'Error' },
  ];

  const handleMenuPress = () => {
    Alert.alert(
      'TransitPulse Design System',
      'Design System Specification v2.4\nComponent & System States for Passenger and Telemetry Tracking.'
    );
  };

  const handleSearchPress = () => {
    router.push('/passenger/route-search' as any);
  };

  const handleRetryError = async () => {
    setIsRetrying(true);
    try {
      await systemStateService.retryOperation();
      Alert.alert('Query Successful', 'Transit connection data reloaded successfully.');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleModifySearch = () => {
    router.push('/passenger/route-search' as any);
  };

  const showLoading = selectedFilter === 'all' || selectedFilter === 'loading';
  const showTelemetry = selectedFilter === 'all' || selectedFilter === 'loading';
  const showEmpty = selectedFilter === 'all' || selectedFilter === 'empty';
  const showError = selectedFilter === 'all' || selectedFilter === 'error';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Screen Header */}
      <Header onMenuPress={handleMenuPress} onSearchPress={handleSearchPress} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Spec Label & Subheading */}
        <View style={styles.specRow}>
          <View style={styles.specBadge}>
            <Text style={styles.specBadgeText}>DESIGN SYSTEM</Text>
          </View>
          <Text style={styles.specVersionText}>v2.4 Spec</Text>
        </View>

        {/* Screen Title & Subtitle */}
        <Text style={styles.pageTitle}>System & Component States</Text>
        <Text style={styles.pageDescription}>
          Edge cases, loading flows, and exception handling for TransitPulse
        </Text>

        {/* State Filter Tabs Bar */}
        <View style={styles.filterTabsContainer}>
          {filterTabs.map((tab) => {
            const isSelected = selectedFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => setSelectedFilter(tab.key)}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Filter by ${tab.label}`}
              >
                <Text
                  style={[styles.tabText, isSelected && styles.tabTextActive]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* STATE 01: LOADING */}
        {showLoading && (
          <StateCard
            stateNumber="STATE 01"
            stateLabel="LOADING"
            statusBadgeLabel="Active Query"
            statusBadgeType="active-query"
          >
            <LoadingState
              title="Searching optimal bus and train connections..."
              description="Evaluating 18 multimodal combinations in real time"
              showSkeletons={true}
              skeletonCount={2}
            />
          </StateCard>
        )}

        {/* STATE 02: TELEMETRY */}
        {showTelemetry && (
          <StateCard
            icon={<MaterialCommunityIcons name="satellite-variant" size={14} color="#0F2942" />}
            stateNumber="STATE 02"
            stateLabel="TELEMETRY"
            statusBadgeLabel="Live GPS Lock"
            statusBadgeType="gps-lock"
          >
            <TelemetryState />
          </StateCard>
        )}

        {/* STATE 03: EMPTY STATE */}
        {showEmpty && (
          <StateCard
            icon={<Feather name="map-pin" size={14} color="#0F2942" />}
            stateNumber="STATE 03"
            stateLabel="EMPTY STATE"
            statusBadgeLabel="0 Results"
            statusBadgeType="empty"
          >
            <EmptyState
              title="No routes found"
              description="Try changing your destination or transport mode."
              actionLabel="Modify Search"
              onAction={handleModifySearch}
            />
          </StateCard>
        )}

        {/* STATE 04: ERROR & RETRY */}
        {showError && (
          <StateCard
            icon={<Feather name="alert-triangle" size={14} color="#DC2626" />}
            stateNumber="STATE 04"
            stateLabel="ERROR & RETRY"
            statusBadgeLabel="Network Timeout"
            statusBadgeType="error"
          >
            <ErrorState
              title="Unable to load routes"
              description="Something went wrong while retrieving live transit data."
              retryLabel="Try Again"
              isRetrying={isRetrying}
              onRetry={handleRetryError}
            />
          </StateCard>
        )}
      </ScrollView>

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
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  specBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  specBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  specVersionText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: TransitColors.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  pageDescription: {
    fontSize: 13,
    color: TransitColors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  filterTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    ...TransitShadows.card,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: TransitColors.textSecondary,
  },
  tabTextActive: {
    color: TransitColors.textPrimary,
    fontWeight: '800',
  },
});
