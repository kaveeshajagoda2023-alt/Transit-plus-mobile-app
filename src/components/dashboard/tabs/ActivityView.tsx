import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TicketActivityItem } from '@/types/trip';

interface ActivityViewProps {
  activity: TicketActivityItem[];
}

type FilterType = 'ALL' | 'PASS' | 'REJECT' | 'CASH' | 'QR';

export const ActivityView: React.FC<ActivityViewProps> = ({ activity }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');

  const filtered = activity.filter((item) => {
    if (filter === 'PASS' && item.result !== 'PASS') return false;
    if (filter === 'REJECT' && item.result !== 'REJECT') return false;
    if (filter === 'CASH' && item.method !== 'CASH') return false;
    if (filter === 'QR' && item.method !== 'QR') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.ticketId.toLowerCase().includes(q) ||
        item.ticketTypeLabel.toLowerCase().includes(q) ||
        (item.passengerName && item.passengerName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Shift Activity History</Text>
      <Text style={styles.headerSubtitle}>
        Cryptographic logs of all passenger tickets and fares
      </Text>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['ALL', 'PASS', 'REJECT', 'QR', 'CASH'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[styles.filterText, filter === f && styles.filterTextActive]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by Ticket ID or passenger..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <View style={styles.list}>
        {filtered.map((item) => {
          const isPass = item.result === 'PASS';
          return (
            <View
              key={item.id}
              style={[styles.itemCard, !isPass && styles.itemCardReject]}
            >
              <View
                style={[
                  styles.circle,
                  isPass ? styles.circlePass : styles.circleReject,
                ]}
              >
                {isPass ? (
                  <Ionicons name="checkmark" size={14} color="#059669" />
                ) : (
                  <Ionicons name="close" size={14} color="#DC2626" />
                )}
              </View>

              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text
                    style={[styles.ticketId, !isPass && styles.ticketIdReject]}
                  >
                    Ticket #{item.ticketId}
                  </Text>
                  {item.fareAmount > 0 && (
                    <Text style={styles.fareAmount}>
                      RS {item.fareAmount.toFixed(2)}
                    </Text>
                  )}
                </View>

                <Text style={styles.details}>
                  {item.ticketTypeLabel} • Method: {item.method}
                </Text>
                <Text style={styles.event}>{item.eventText}</Text>
                {item.reason && (
                  <Text style={styles.reason}>Reason: {item.reason}</Text>
                )}
              </View>

              <View
                style={[
                  styles.badge,
                  isPass ? styles.badgePass : styles.badgeReject,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isPass ? styles.badgeTextPass : styles.badgeTextReject,
                  ]}
                >
                  {item.result}
                </Text>
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && (
          <Text style={styles.empty}>No matching activities found.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  filterText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
  },
  list: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  itemCardReject: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePass: {
    backgroundColor: '#D1FAE5',
  },
  circleReject: {
    backgroundColor: '#FEE2E2',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  ticketIdReject: {
    color: '#DC2626',
  },
  fareAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
  },
  details: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  event: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  reason: {
    fontSize: 10.5,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePass: {
    backgroundColor: '#A7F3D0',
  },
  badgeReject: {
    backgroundColor: '#DC2626',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '900',
  },
  badgeTextPass: {
    color: '#047857',
  },
  badgeTextReject: {
    color: '#FFFFFF',
  },
  empty: {
    textAlign: 'center',
    color: '#94A3B8',
    paddingVertical: 20,
  },
});
