/**
 * Member 2 — My Tickets (Tickets tab)
 * Active tickets and ticket history, with entry points to buy a ticket and
 * view payment history.
 */
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '@/components/passenger/Header';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';
import { ticketingApi } from '@/services/api/ticketingApi';
import { PassengerTicket } from '@/types/ticketing';
import { usePassengerIdentity } from '@/hooks/usePassengerIdentity';
import { TicketCard } from '@/components/ticketing/TicketCard';
import { ErrorBanner, OfflineBanner, PrimaryButton } from '@/components/ticketing/TicketingUI';
import { formatLKR } from '@/services/ticketing/format';

type View_ = 'active' | 'history';

export function MyTicketsScreen() {
  const { passengerId } = usePassengerIdentity();
  const [tab, setTab] = useState<View_>('active');
  const [tickets, setTickets] = useState<PassengerTicket[]>([]);
  const [wallet, setWallet] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (which: View_, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const [list, balance] = await Promise.all([
          ticketingApi.listTickets(passengerId, which),
          ticketingApi.getWalletBalance(passengerId).catch(() => null),
        ]);
        setTickets(list);
        setWallet(balance);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load your tickets.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [passengerId]
  );

  useFocusEffect(
    useCallback(() => {
      load(tab);
    }, [load, tab])
  );

  const activeCount = tab === 'active' ? tickets.filter((t) => t.status === 'ACTIVE').length : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header onMenuPress={() => {}} onSearchPress={() => router.push('/passenger/route-search' as any)} />
      <OfflineBanner />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(tab, true)} />}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>My Tickets</Text>
            <Text style={styles.subtitle}>
              {activeCount !== null && activeCount > 0
                ? `${activeCount} active ticket${activeCount > 1 ? 's' : ''} ready to scan`
                : 'Buy and manage your digital tickets'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => router.push('/tickets/payments' as any)}
            accessibilityRole="button"
            accessibilityLabel="Payment history"
          >
            <Feather name="file-text" size={18} color={TransitColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Buy ticket hero */}
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Where to next?</Text>
            <Text style={styles.heroText}>Book a seat in seconds and board with a QR code.</Text>
            {wallet !== null ? (
              <View style={styles.walletChip}>
                <MaterialCommunityIcons name="wallet-outline" size={14} color="#FFFFFF" />
                <Text style={styles.walletText}>MetroPay {formatLKR(wallet)}</Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/tickets/buy' as any)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Buy a ticket"
          >
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color={TransitColors.primary} />
            <Text style={styles.heroButtonText}>Buy ticket</Text>
          </TouchableOpacity>
        </View>

        {/* Segmented control */}
        <View style={styles.segment} accessibilityRole="tablist">
          {(['active', 'history'] as View_[]).map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.segmentItem, tab === key && styles.segmentItemActive]}
              onPress={() => setTab(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === key }}
            >
              <Text style={[styles.segmentText, tab === key && styles.segmentTextActive]}>
                {key === 'active' ? 'Upcoming' : 'History'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <ErrorBanner message={error} /> : null}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} color={TransitColors.primary} />
        ) : tickets.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name={tab === 'active' ? 'ticket-outline' : 'history'}
              size={48}
              color={TransitColors.textMuted}
            />
            <Text style={styles.emptyTitle}>{tab === 'active' ? 'No upcoming tickets' : 'No past tickets yet'}</Text>
            <Text style={styles.emptyText}>
              {tab === 'active'
                ? 'Tickets you buy appear here with a QR code for the conductor.'
                : 'Used, expired and cancelled tickets will be listed here.'}
            </Text>
            {tab === 'active' ? (
              <View style={{ marginTop: 16, alignSelf: 'stretch' }}>
                <PrimaryButton label="Buy your first ticket" icon="plus" onPress={() => router.push('/tickets/buy' as any)} />
              </View>
            ) : null}
          </View>
        ) : (
          tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} onPress={() => router.push(`/tickets/${t.id}` as any)} />
          ))
        )}
      </ScrollView>

      <BottomNavigation currentTab="tickets" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TransitColors.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 14 },
  title: { fontSize: 24, fontWeight: '800', color: TransitColors.primary },
  subtitle: { fontSize: 13, color: TransitColors.textSecondary, marginTop: 2 },
  historyBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: TransitColors.cardBackground,
    borderWidth: 1,
    borderColor: TransitColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TransitColors.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    gap: 12,
    ...TransitShadows.floating,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  heroText: { color: '#CBD5E1', fontSize: 12, marginTop: 4, lineHeight: 17 },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: TransitColors.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  walletText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  heroButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  heroButtonText: { fontSize: 12, fontWeight: '800', color: TransitColors.primary },
  segment: {
    flexDirection: 'row',
    backgroundColor: TransitColors.borderLight,
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  segmentItemActive: { backgroundColor: TransitColors.cardBackground, ...TransitShadows.card },
  segmentText: { fontSize: 13, fontWeight: '700', color: TransitColors.textSecondary },
  segmentTextActive: { color: TransitColors.primary },
  empty: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: TransitColors.primary, marginTop: 12 },
  emptyText: { fontSize: 13, color: TransitColors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 18 },
});
