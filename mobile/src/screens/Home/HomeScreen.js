import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { listTickets } from '../../services/ticketService';
import TicketCard from '../../components/TicketCard';
import AppButton from '../../components/AppButton';
import Icon from '../../components/Icon';
import { Banner, SkeletonCard } from '../../components/Feedback';
import { greeting, formatTime, isSameDay, passengerTypeLabel } from '../../utils/format';
import { EXTERNAL_QUICK_ACTIONS } from '../../navigation/ExternalModules';
import { goToTab } from '../../navigation/navHelpers';

const QUICK_ACTIONS = [
  { key: 'buy', label: 'Buy ticket', icon: 'plus-circle', go: (n) => goToTab(n, 'BuyTicket') },
  { key: 'tickets', label: 'My tickets', icon: 'ticket', go: (n) => goToTab(n, 'Tickets') },
  { key: 'scan', label: 'Scan QR', icon: 'scan', go: (n) => goToTab(n, 'Scan') },
  { key: 'payments', label: 'Payments', icon: 'receipt', go: (n) => n.navigate('PaymentHistory') },
  ...EXTERNAL_QUICK_ACTIONS.map((a) => ({ ...a, go: (n) => n.navigate(a.screen) })),
];

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTicket, setActiveTicket] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const [active, latest] = await Promise.all([
        listTickets({ status: 'ACTIVE', limit: 20 }),
        listTickets({ limit: 3 }),
      ]);
      // The next trip is the active ticket with the earliest departure
      const next = [...active.items].sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate))[0] || null;
      setActiveTicket(next);
      setRecent(latest.items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const firstName = (user?.name || 'Passenger').split(' ')[0];
  const openDetails = (t) => navigation.navigate('TicketDetails', { ticketId: t._id });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.tealCyan]} />}
    >
      <View style={styles.hero}>
        <Text style={styles.greeting}>{greeting()},</Text>
        <Text style={styles.name} accessibilityRole="header">
          {firstName}
        </Text>
        <View style={styles.typePill}>
          <Icon name="user" size={13} color={colors.activeCyan} />
          <Text style={styles.typeText}>{passengerTypeLabel(user?.passengerType)} passenger</Text>
        </View>
      </View>

      {error ? <Banner type="error" message={error} actionLabel="Retry" onAction={() => load()} /> : null}

      <Text style={styles.sectionTitle}>Your next trip</Text>
      {loading ? (
        <SkeletonCard />
      ) : activeTicket ? (
        <View>
          <TicketCard ticket={activeTicket} compact onViewDetails={openDetails} />
          <AppButton
            title={`Show QR pass${isSameDay(activeTicket.travelDate, new Date()) ? ` · departs ${formatTime(activeTicket.travelDate)}` : ''}`}
            icon="qr"
            onPress={() => navigation.navigate('DigitalQRPass', { ticketId: activeTicket._id })}
            style={styles.qrButton}
          />
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Icon name="ticket" size={28} color={colors.tealText} />
          <View style={styles.emptyText}>
            <Text style={styles.emptyTitle}>No active ticket</Text>
            <Text style={styles.emptySub}>Buy a ticket and your QR pass will appear here.</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.key}
            style={styles.action}
            onPress={() => a.go(navigation)}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            activeOpacity={0.8}
          >
            <View style={styles.actionIcon}>
              <Icon name={a.icon} size={22} color={colors.tealText} />
            </View>
            <Text style={styles.actionLabel} numberOfLines={2}>
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recent tickets</Text>
        <AppButton title="See all" variant="ghost" compact onPress={() => goToTab(navigation, 'Tickets')} accessibilityLabel="See all tickets" />
      </View>
      {loading ? (
        <SkeletonCard />
      ) : recent.length === 0 ? (
        <Text style={styles.emptySub}>Your purchases will show up here.</Text>
      ) : (
        recent.map((t) => <TicketCard key={t._id} ticket={t} compact onViewDetails={openDetails} />)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: colors.primaryDarkNavy,
    borderRadius: theme.borderRadius.card,
    padding: 18,
    marginBottom: 18,
  },
  greeting: {
    color: '#C6D6E2',
    fontSize: 14,
  },
  name: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryNavy,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  typeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  qrButton: {
    marginTop: -4,
    marginBottom: 18,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 18,
  },
  emptyText: {
    marginLeft: 12,
    flex: 1,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
  },
  emptySub: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 10,
  },
  action: {
    width: '33.33%',
    padding: 5,
  },
  actionIcon: {
    height: 52,
    borderRadius: theme.borderRadius.button,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'center',
    marginTop: 6,
    minHeight: 30,
  },
});

export default HomeScreen;
