import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, theme } from '../../theme';
import { listPayments } from '../../services/paymentService';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';
import { EmptyState, ErrorState, SkeletonList } from '../../components/Feedback';
import { PAYMENT_METHOD_LABEL } from '../../utils/constants';
import { formatDateTime, formatLKR } from '../../utils/format';
import { goToTab } from '../../navigation/navHelpers';

const METHOD_ICON = { CARD: 'card', WALLET: 'wallet', CASH_ON_BOARD: 'cash' };

const PaymentHistoryScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (pageToLoad = 1, mode = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    if (mode === 'more') setLoadingMore(true);
    setError(null);
    try {
      const res = await listPayments({ page: pageToLoad, limit: 15 });
      setPayments((prev) => (pageToLoad === 1 ? res.items : [...prev, ...res.items]));
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.container, styles.list]}>
        <SkeletonList count={3} />
      </View>
    );
  }
  if (error && payments.length === 0) return <ErrorState message={error} onRetry={() => load()} />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[styles.list, payments.length === 0 && styles.grow]}
      data={payments}
      keyExtractor={(p) => p._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(1, 'refresh')} colors={[colors.tealCyan]} />}
      onEndReached={() => {
        if (!loadingMore && page < totalPages) load(page + 1, 'more');
      }}
      onEndReachedThreshold={0.4}
      ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.tealCyan} style={styles.spinner} /> : null}
      ListEmptyComponent={
        <EmptyState
          icon="receipt"
          title="No payments yet"
          message="Receipts for your ticket purchases will appear here."
          actionLabel="Buy a ticket"
          onAction={() => goToTab(navigation, 'BuyTicket')}
        />
      }
      renderItem={({ item: p }) => {
        const method = p.method === 'CARD' && p.cardLast4 ? `${p.cardBrand} •••• ${p.cardLast4}` : PAYMENT_METHOD_LABEL[p.method];
        return (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('PaymentReceipt', { paymentId: p._id })}
            accessibilityRole="button"
            accessibilityLabel={`${formatLKR(p.amount)} on ${formatDateTime(p.createdAt)}, ${p.status}. Open receipt`}
          >
            <View style={styles.iconBox}>
              <Icon name={METHOD_ICON[p.method] || 'card'} size={20} color={colors.secondaryNavy} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.title}>{p.ticket?.ticketNumber || 'Ticket removed'}</Text>
              <Text style={styles.sub}>
                {method} · {formatDateTime(p.createdAt)}
              </Text>
              <View style={styles.badge}>
                <StatusBadge kind="payment" status={p.status} />
              </View>
            </View>
            <View style={styles.amountBox}>
              <Text style={styles.amount}>{formatLKR(p.amount)}</Text>
              {p.refundAmount > 0 ? <Text style={styles.refund}>-{formatLKR(p.refundAmount)}</Text> : null}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  list: {
    padding: 16,
  },
  grow: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  spinner: {
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.lightBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
  },
  sub: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  badge: {
    marginTop: 6,
  },
  amountBox: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDarkNavy,
  },
  refund: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B21B6',
    marginTop: 2,
  },
});

export default PaymentHistoryScreen;
