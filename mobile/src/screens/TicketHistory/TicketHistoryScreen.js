import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import TicketCard from '../../components/TicketCard';
import ScreenHeader from '../../components/ScreenHeader';
import TextField from '../../components/TextField';
import Chip from '../../components/Chip';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Banner, EmptyState, ErrorState, SkeletonList } from '../../components/Feedback';
import { useToast } from '../../context/ToastContext';
import { listTickets, hideTicket, rebookTicket } from '../../services/ticketService';
import { TICKET_FILTERS } from '../../utils/constants';
import { goToTab } from '../../navigation/navHelpers';

const PAGE_SIZE = 10;

const EMPTY_TEXT = {
  ALL: ['No tickets yet', "You haven't bought any tickets yet. Buy one and your QR pass will appear here."],
  ACTIVE: ['No active tickets', 'Tickets you can travel with right now will show here.'],
  USED: ['No used tickets', 'Tickets scanned on a bus appear here.'],
  CANCELLED: ['No cancelled tickets', 'Cancelled and refunded tickets appear here.'],
  EXPIRED: ['No expired tickets', 'Tickets whose travel window passed appear here.'],
};

const TicketHistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [moreError, setMoreError] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: 'hide' | 'rebook', ticket }
  const [acting, setActing] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchHistory = useCallback(
    async (mode = 'initial', pageToLoad = 1) => {
      // Ignore responses from older requests (e.g. when the filter changes quickly)
      const id = ++requestId.current;
      if (mode === 'refresh') setRefreshing(true);
      else if (mode === 'more') setLoadingMore(true);
      else setLoading(true);
      if (mode !== 'more') setError(null);
      setMoreError(null);

      try {
        const status = TICKET_FILTERS.find((f) => f.key === filter)?.status;
        const res = await listTickets({
          page: pageToLoad,
          limit: PAGE_SIZE,
          ...(status ? { status } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        });
        if (id !== requestId.current) return;
        setTickets((prev) => (pageToLoad === 1 ? res.items : [...prev, ...res.items]));
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (err) {
        if (id !== requestId.current) return;
        if (mode === 'more') setMoreError(err.message);
        else setError(err.message || 'Unable to connect to TransitPulse server.');
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [filter, debouncedSearch]
  );

  useEffect(() => {
    fetchHistory('initial', 1);
  }, [fetchHistory]);

  // Refresh silently when coming back from details / checkout
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      fetchHistory('refresh', 1);
    }, [fetchHistory])
  );

  const loadMore = () => {
    if (loading || loadingMore || refreshing || page >= totalPages || moreError) return;
    fetchHistory('more', page + 1);
  };

  const handleViewQR = (selectedTicket) => {
    navigation.navigate('DigitalQRPass', { ticketId: selectedTicket._id });
  };

  const handleViewDetails = (selectedTicket) => {
    navigation.navigate('TicketDetails', { ticketId: selectedTicket._id });
  };

  const handlePay = (selectedTicket) => navigation.navigate('PassengerCheckout', { ticket: selectedTicket });

  const runConfirmed = async () => {
    const { type, ticket } = confirm;
    setActing(true);
    try {
      if (type === 'hide') {
        const res = await hideTicket(ticket._id);
        setTickets((prev) => prev.filter((t) => t._id !== ticket._id));
        toast.show(res.message, 'success');
      } else {
        const res = await rebookTicket(ticket._id);
        toast.show(res.message, 'info');
        navigation.navigate('PassengerCheckout', { ticket: res.data });
      }
      setConfirm(null);
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setActing(false);
    }
  };

  const [emptyTitle, emptyMessage] = debouncedSearch
    ? ['No matching tickets', `Nothing found for "${debouncedSearch}". Try a ticket number, stop or route.`]
    : EMPTY_TEXT[filter];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="My Tickets" subtitle="Purchase history, QR passes and refunds" style={styles.header} />
        <TextField
          icon="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Search ticket no., stop or route"
          accessibilityLabel="Search tickets"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.search}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist">
          {TICKET_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              selected={filter === f.key}
              onPress={() => setFilter(f.key)}
              accessibilityLabel={`Show ${f.label.toLowerCase()} tickets`}
            />
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.listContent}>
          <SkeletonList />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchHistory('initial', 1)} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TicketCard
              ticket={item}
              onViewQR={handleViewQR}
              onViewDetails={handleViewDetails}
              onPay={handlePay}
              onHide={(t) => setConfirm({ type: 'hide', ticket: t })}
              onRebook={(t) => setConfirm({ type: 'rebook', ticket: t })}
            />
          )}
          contentContainerStyle={[styles.listContent, tickets.length === 0 && styles.flexGrow]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchHistory('refresh', 1)} colors={[colors.tealCyan]} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.tealCyan} style={styles.footerSpinner} />
            ) : moreError ? (
              <Banner type="error" message={moreError} actionLabel="Retry" onAction={() => fetchHistory('more', page + 1)} />
            ) : tickets.length > 0 && page >= totalPages ? (
              <Text style={styles.endText}>You've reached the end of your history</Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="ticket"
              title={emptyTitle}
              message={emptyMessage}
              actionLabel={filter === 'ALL' && !debouncedSearch ? 'Buy a ticket' : undefined}
              onAction={() => goToTab(navigation, 'BuyTicket')}
            />
          }
        />
      )}

      <ConfirmDialog
        visible={!!confirm}
        title={confirm?.type === 'hide' ? 'Remove from history?' : 'Rebook this trip?'}
        message={
          confirm?.type === 'hide'
            ? `Ticket ${confirm?.ticket.ticketNumber} will be hidden from your history. Receipts stay in Payment History.`
            : `A new ticket from ${confirm?.ticket.fromStop} to ${confirm?.ticket.toStop} will be created for now. You can change the time before paying.`
        }
        confirmLabel={confirm?.type === 'hide' ? 'Remove' : 'Rebook'}
        icon={confirm?.type === 'hide' ? 'eye-off' : 'refresh'}
        destructive={confirm?.type === 'hide'}
        loading={acting}
        onConfirm={runConfirmed}
        onCancel={() => setConfirm(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  headerContainer: {
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 12,
  },
  search: {
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  flexGrow: {
    flexGrow: 1,
  },
  footerSpinner: {
    marginVertical: 16,
  },
  endText: {
    textAlign: 'center',
    color: colors.secondaryText,
    fontSize: 12,
    marginVertical: 12,
  },
});

export default TicketHistoryScreen;
