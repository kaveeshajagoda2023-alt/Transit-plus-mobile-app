import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { colors, theme } from '../../theme';
import { listScanLogs } from '../../services/validationService';
import StatusBadge from '../../components/StatusBadge';
import { EmptyState, ErrorState, SkeletonList } from '../../components/Feedback';
import { formatDateTime } from '../../utils/format';

// Read-only list of the current user's scans (ScanLog collection)
const ScanHistoryScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
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
      const res = await listScanLogs({ page: pageToLoad, limit: 20 });
      setLogs((prev) => (pageToLoad === 1 ? res.items : [...prev, ...res.items]));
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
      <View style={styles.container}>
        <View style={styles.list}>
          <SkeletonList count={4} />
        </View>
      </View>
    );
  }
  if (error && logs.length === 0) return <ErrorState message={error} onRetry={() => load()} />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[styles.list, logs.length === 0 && styles.grow]}
      data={logs}
      keyExtractor={(item) => item._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(1, 'refresh')} colors={[colors.tealCyan]} />}
      onEndReached={() => {
        if (!loadingMore && page < totalPages) load(page + 1, 'more');
      }}
      onEndReachedThreshold={0.4}
      ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.tealCyan} style={styles.spinner} /> : null}
      ListEmptyComponent={
        <EmptyState
          icon="scan"
          title="No scans yet"
          message="Every ticket you scan is recorded here with the result."
          actionLabel="Scan a ticket"
          onAction={() => navigation.goBack()}
        />
      }
      renderItem={({ item }) => (
        <View style={styles.row} accessible accessibilityLabel={`${item.result}, ${item.message}, ${formatDateTime(item.scannedAt)}`}>
          <View style={styles.rowHeader}>
            <StatusBadge kind="scan" status={item.result} />
            <Text style={styles.time}>{formatDateTime(item.scannedAt)}</Text>
          </View>
          <Text style={styles.ticket}>
            {item.ticket ? `${item.ticket.ticketNumber} · ${item.ticket.fromStop} → ${item.ticket.toStop}` : 'Unknown ticket'}
          </Text>
          <Text style={styles.message}>{item.message}</Text>
        </View>
      )}
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
  spinner: {
    marginVertical: 16,
  },
  row: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  ticket: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
    marginTop: 8,
  },
  message: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 2,
  },
});

export default ScanHistoryScreen;
