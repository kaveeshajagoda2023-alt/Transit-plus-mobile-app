import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { INITIAL_SAVED_PLACES } from '@/services/mock/savedPlaces';
import { routeApi } from '@/services/api/routeApi';
import { SavedPlace } from '@/types/location';
import { SavedRouteRecord } from '@/types/route';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

export default function SavedPlacesScreen() {
  const [activeTab, setActiveTab] = useState<'routes' | 'places'>('routes');
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteRecord[]>([]);
  const [places, setPlaces] = useState<SavedPlace[]>(INITIAL_SAVED_PLACES);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Delete Route Modal State (Explicit Modal for cross-platform web reliability)
  const [routeToDelete, setRouteToDelete] = useState<SavedRouteRecord | null>(null);

  // Add Route Modal State (CRUD: Create)
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newOrigin, setNewOrigin] = useState<string>('Jaffna Central Bus Stand');
  const [newDestination, setNewDestination] = useState<string>('Nallur Kandaswamy Kovil');
  const [newRouteNumber, setNewRouteNumber] = useState<string>('LINE 765');
  const [newRouteName, setNewRouteName] = useState<string>('Jaffna - Nallur Express Link');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // R – Read: Load saved routes from backend / storage
  const loadSavedRoutes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await routeApi.getSavedRoutes();
      setSavedRoutes(data);
    } catch (err) {
      console.error('Failed to load saved routes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedRoutes();
  }, [loadSavedRoutes]);

  // D – Delete: Remove saved route
  const handleConfirmDeleteRoute = async () => {
    if (!routeToDelete) return;
    const targetId = routeToDelete.id;
    const targetRouteNumber = routeToDelete.routeNumber;

    // Optimistically update
    setSavedRoutes((prev) => prev.filter((r) => r.id !== targetId));
    setRouteToDelete(null);

    try {
      await routeApi.deleteSavedRoute(targetId);
      showToast(`Removed ${targetRouteNumber} from saved favourites.`);
    } catch {
      showToast('Error removing route.');
      loadSavedRoutes();
    }
  };

  // C – Create: Add new saved route / trip search
  const handleCreateSavedRoute = async () => {
    if (!newOrigin.trim() || !newDestination.trim()) {
      showToast('Origin and Destination are required.');
      return;
    }

    try {
      const saved = await routeApi.saveRoute({
        routeId: newRouteNumber.toLowerCase().includes('765')
          ? 'route-jaffna-nallur'
          : `route-${Date.now()}`,
        origin: newOrigin.trim(),
        destination: newDestination.trim(),
        customName: newRouteName.trim() || `${newRouteNumber}: ${newOrigin} → ${newDestination}`,
        isStarred: true,
      });

      setSavedRoutes((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
      setShowAddModal(false);
      showToast(`Saved trip: ${newOrigin} → ${newDestination}!`);
    } catch {
      showToast('Error saving trip.');
    }
  };

  const handleDeletePlace = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
    showToast('Removed saved place.');
  };

  const handleTrackLive = (route: SavedRouteRecord) => {
    if (route.routeId.includes('jaffna') || route.routeNumber.includes('765')) {
      router.push({
        pathname: '/passenger/vehicle-tracking' as any,
        params: {
          vehicleId: 'veh-bus-jaffna-765',
          routeId: 'route-jaffna-nallur',
        },
      });
    } else {
      router.push({
        pathname: '/passenger/route-details' as any,
        params: { routeId: route.routeId },
      });
    }
  };

  const getPlaceIcon = (type: SavedPlace['type']) => {
    switch (type) {
      case 'home':
        return <Ionicons name="home" size={20} color="#0284C7" />;
      case 'university':
        return <Ionicons name="school" size={20} color="#0D9488" />;
      case 'work':
        return <Ionicons name="briefcase" size={20} color="#EA580C" />;
      default:
        return <Feather name="map-pin" size={20} color={TransitColors.primary} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color={TransitColors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Trips & Places</Text>
        <TouchableOpacity
          onPress={() => {
            if (activeTab === 'routes') {
              setShowAddModal(true);
            } else {
              showToast('Saved Places editing is available in places manager.');
            }
          }}
          style={styles.addButton}
          accessibilityRole="button"
          accessibilityLabel="Add new saved item"
        >
          <Feather name="plus" size={22} color="#0284C7" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control: Saved Routes vs Saved Places */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'routes' && styles.tabButtonActive]}
          onPress={() => setActiveTab('routes')}
        >
          <Ionicons
            name="git-commit-outline"
            size={18}
            color={activeTab === 'routes' ? '#0284C7' : '#64748B'}
          />
          <Text style={[styles.tabButtonText, activeTab === 'routes' && styles.tabButtonTextActive]}>
            Saved Routes ({savedRoutes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'places' && styles.tabButtonActive]}
          onPress={() => setActiveTab('places')}
        >
          <Feather
            name="map-pin"
            size={16}
            color={activeTab === 'places' ? '#0284C7' : '#64748B'}
          />
          <Text style={[styles.tabButtonText, activeTab === 'places' && styles.tabButtonTextActive]}>
            Saved Places ({places.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {activeTab === 'routes' ? (
        isLoading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#0284C7" />
            <Text style={styles.loadingText}>Loading favourite routes & live ETAs...</Text>
          </View>
        ) : (
          <FlatList
            data={savedRoutes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="bookmark-outline" size={42} color={TransitColors.textMuted} />
                <Text style={styles.emptyTitle}>No saved routes yet</Text>
                <Text style={styles.emptySubtitle}>
                  Save your daily commute trips (like Jaffna → Nallur) to monitor live bus GPS and ETAs.
                </Text>
                <TouchableOpacity
                  style={styles.primaryAddBtn}
                  onPress={() => setShowAddModal(true)}
                >
                  <Feather name="plus" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryAddBtnText}>Save Jaffna → Nallur Trip</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.routeCard}>
                {/* Top Badge Row */}
                <View style={styles.routeCardHeader}>
                  <View style={styles.badgeGroup}>
                    <View style={styles.routeNumberBadge}>
                      <Ionicons name="bus" size={13} color="#FFFFFF" />
                      <Text style={styles.routeNumberText}>{item.routeNumber}</Text>
                    </View>
                    <View style={styles.etaBadge}>
                      <View style={styles.etaDot} />
                      <Text style={styles.etaText}>
                        ETA: {item.etaMinutes || 8} mins
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteIconButton}
                    onPress={() => setRouteToDelete(item)}
                    accessibilityLabel={`Remove ${item.routeNumber}`}
                  >
                    <Feather name="trash-2" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {/* Route Name & Terminus */}
                <Text style={styles.routeName}>{item.routeName}</Text>
                <View style={styles.journeyPathRow}>
                  <View style={styles.pathDotOrigin} />
                  <Text style={styles.pathText} numberOfLines={1}>
                    {item.origin}
                  </Text>
                  <Feather name="arrow-right" size={14} color="#94A3B8" />
                  <View style={styles.pathDotDest} />
                  <Text style={styles.pathText} numberOfLines={1}>
                    {item.destination}
                  </Text>
                </View>

                {/* Bottom Actions Row */}
                <View style={styles.routeCardFooter}>
                  <View style={styles.statusLivePill}>
                    <Text style={styles.statusLivePillText}>LIVE GPS TRACKED</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.trackLiveBtn}
                    onPress={() => handleTrackLive(item)}
                  >
                    <Text style={styles.trackLiveBtnText}>Track Live Bus</Text>
                    <Feather name="arrow-right" size={15} color="#0284C7" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="map-pin" size={32} color={TransitColors.textMuted} />
              <Text style={styles.emptyTitle}>No saved places</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.placeCard}>
              <View style={styles.iconCircle}>{getPlaceIcon(item.type)}</View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeTitle}>{item.name}</Text>
                <Text style={styles.placeAddress}>{item.address}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeletePlace(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="trash-2" size={18} color={TransitColors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#38BDF8" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Delete Confirmation Modal (D - Delete) */}
      <Modal
        visible={Boolean(routeToDelete)}
        transparent
        animationType="fade"
        onRequestClose={() => setRouteToDelete(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <Feather name="trash-2" size={24} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Remove Saved Route?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove {routeToDelete?.routeNumber} (
              {routeToDelete?.origin} → {routeToDelete?.destination}) from your favourites?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRouteToDelete(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={handleConfirmDeleteRoute}
              >
                <Text style={styles.modalDeleteText}>Remove Route</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Saved Route Modal (C - Create) */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Save New Route / Trip</Text>
            <Text style={styles.modalSubtitle}>
              Save your favourite trip to monitor live bus GPS location and ETA.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Origin Terminus</Text>
              <TextInput
                style={styles.inputField}
                value={newOrigin}
                onChangeText={setNewOrigin}
                placeholder="e.g. Jaffna Central Bus Stand"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Destination</Text>
              <TextInput
                style={styles.inputField}
                value={newDestination}
                onChangeText={setNewDestination}
                placeholder="e.g. Nallur Kandaswamy Kovil"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Route / Bus Number</Text>
              <TextInput
                style={styles.inputField}
                value={newRouteNumber}
                onChangeText={setNewRouteNumber}
                placeholder="e.g. LINE 765"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleCreateSavedRoute}
              >
                <Text style={styles.modalSaveText}>Save Trip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavigation currentTab="routes" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TransitColors.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#E0F2FE',
  },
  tabButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  routeNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  etaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  etaText: {
    color: '#15803D',
    fontSize: 12.5,
    fontWeight: '800',
  },
  deleteIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  journeyPathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  pathDotOrigin: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0284C7',
  },
  pathDotDest: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  pathText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    flexShrink: 1,
  },
  routeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusLivePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusLivePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  trackLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackLiveBtnText: {
    color: '#0284C7',
    fontSize: 13.5,
    fontWeight: '800',
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TransitColors.textPrimary,
  },
  placeAddress: {
    fontSize: 12.5,
    color: TransitColors.textSecondary,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  emptyContainer: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  primaryAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
  },
  primaryAddBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  toastBanner: {
    position: 'absolute',
    bottom: 80,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalMessage: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  modalDeleteBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDeleteText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
