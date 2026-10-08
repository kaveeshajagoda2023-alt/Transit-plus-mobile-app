import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TicketActivityItem } from '@/types/trip';

interface RecentActivityFeedProps {
  activity: TicketActivityItem[];
  onViewAll?: () => void;
  onItemPress?: (item: TicketActivityItem) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activity,
  onViewAll,
  onItemPress,
}) => {
  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Feather name="clock" size={16} color="#0F172A" />
          <Text style={styles.titleText}>Recent Activity</Text>
        </View>

        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.feedBadgeText}>Real-time Feed</Text>
        </TouchableOpacity>
      </View>

      {/* List of activity items */}
      <View style={styles.itemsList}>
        {activity.slice(0, 5).map((item) => {
          const isPass = item.result === 'PASS';
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, !isPass && styles.itemCardReject]}
              onPress={() => onItemPress && onItemPress(item)}
              activeOpacity={0.8}
            >
              {/* Left Icon Circle */}
              <View
                style={[
                  styles.statusCircle,
                  isPass ? styles.statusCirclePass : styles.statusCircleReject,
                ]}
              >
                {isPass ? (
                  <Ionicons name="checkmark" size={14} color="#059669" />
                ) : (
                  <Ionicons name="close" size={14} color="#DC2626" />
                )}
              </View>

              {/* Middle Ticket Info */}
              <View style={styles.itemMiddle}>
                <Text
                  style={[
                    styles.ticketIdText,
                    !isPass && styles.ticketIdTextReject,
                  ]}
                >
                  Ticket #{item.ticketId}
                </Text>
                <Text style={styles.eventText} numberOfLines={1}>
                  {item.ticketTypeLabel} • {item.eventText}
                </Text>
              </View>

              {/* Right Result Badge */}
              <View
                style={[
                  styles.resultBadge,
                  isPass ? styles.resultBadgePass : styles.resultBadgeReject,
                ]}
              >
                <Text
                  style={[
                    styles.resultBadgeText,
                    isPass ? styles.resultBadgeTextPass : styles.resultBadgeTextReject,
                  ]}
                >
                  {item.result}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {activity.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No recent ticket scans recorded.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  feedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488', // Teal Real-time Feed badge
  },
  itemsList: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF', // Soft blue matching screenshot
    borderWidth: 1,
    borderColor: '#E0F2FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  itemCardReject: {
    backgroundColor: '#FEF2F2', // Soft red
    borderColor: '#FEE2E2',
  },
  statusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCirclePass: {
    backgroundColor: '#D1FAE5',
  },
  statusCircleReject: {
    backgroundColor: '#FEE2E2',
  },
  itemMiddle: {
    flex: 1,
  },
  ticketIdText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  ticketIdTextReject: {
    color: '#B91C1C',
  },
  eventText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resultBadgePass: {
    backgroundColor: '#A7F3D0', // Mint green PASS pill
  },
  resultBadgeReject: {
    backgroundColor: '#B91C1C', // Dark red REJECT pill
  },
  resultBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  resultBadgeTextPass: {
    color: '#047857',
  },
  resultBadgeTextReject: {
    color: '#FFFFFF',
  },
  emptyWrap: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
