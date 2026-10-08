import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, theme } from '../../theme';
import TicketCard from '../../components/TicketCard';
import { getUserTickets } from '../../services/api';

const DEFAULT_USER_ID = 'USR-PASSENGER-101';

const TicketHistoryScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (isRefreshed = false) => {
    try {
      if (isRefreshed) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await getUserTickets(DEFAULT_USER_ID);

      if (res && res.success) {
        setTickets(res.tickets || []);
      } else {
        setError(res?.message || 'Failed to load ticket purchase history');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to TransitPulse server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchHistory(true);
    });

    return unsubscribe;
  }, [fetchHistory, navigation]);

  const handleViewQR = (selectedTicket) => {
    navigation.navigate('DigitalQRPass', { ticket: selectedTicket });
  };

  const handleViewDetails = (selectedTicket) => {
    navigation.navigate('TicketDetails', { ticket: selectedTicket });
  };

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Ticket Purchase History</Text>
        <Text style={styles.screenSubtitle}>
          View all past purchases and access dynamic QR passes
        </Text>
      </View>

      {/* Loading State */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tealCyan} />
          <Text style={styles.loadingText}>Loading ticket history...</Text>
        </View>
      ) : error ? (
        /* Error State */
        <View style={styles.centerContainer}>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchHistory()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Tickets List / Empty State */
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.ticketId || item._id}
          renderItem={({ item }) => (
            <TicketCard
              ticket={item}
              onViewQR={handleViewQR}
              onViewDetails={handleViewDetails}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchHistory(true)}
              colors={[colors.tealCyan]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎫</Text>
              <Text style={styles.emptyTitle}>No Tickets Found</Text>
              <Text style={styles.emptySubtitle}>
                You haven't purchased any transit tickets yet. Complete a checkout to view your dynamic pass here!
              </Text>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => navigation.navigate('PassengerCheckout')}
                activeOpacity={0.8}
              >
                <Text style={styles.checkoutButtonText}>Purchase a Ticket</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: colors.secondaryText,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#FCE8E6',
    borderWidth: 1,
    borderColor: '#F5C6CB',
    borderRadius: theme.borderRadius.card,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    color: '#C5221F',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: colors.primaryDarkNavy,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.button,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  checkoutButton: {
    backgroundColor: colors.tealCyan,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.button,
    ...theme.shadows.button,
  },
  checkoutButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default TicketHistoryScreen;
