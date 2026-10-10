import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { PAYMENT_STATUS, SCAN_RESULT, TICKET_STATUS } from '../utils/constants';
import Icon from './Icon';

const MAPS = { ticket: TICKET_STATUS, payment: PAYMENT_STATUS, scan: SCAN_RESULT };

// Fallback for the old lowercase statuses ('Active', 'Completed', ...)
const LEGACY = {
  active: 'ACTIVE',
  completed: 'ACTIVE',
  used: 'USED',
  expired: 'EXPIRED',
  cancelled: 'CANCELLED',
  failed: 'CANCELLED',
  pending: 'PENDING_PAYMENT',
};

// Status is shown with colour + icon + text so it never relies on colour alone
const StatusBadge = ({ status, kind = 'ticket', large = false }) => {
  const map = MAPS[kind] || TICKET_STATUS;
  const key = map[status] ? status : LEGACY[String(status || '').toLowerCase()];
  const config = map[key] || { label: status || 'Unknown', icon: 'info', fg: '#475467', bg: '#F2F4F7' };

  return (
    <View
      style={[styles.badge, large && styles.large, { backgroundColor: config.bg }]}
      accessible
      accessibilityLabel={`Status: ${config.label}`}
    >
      <Icon name={config.icon} size={large ? 16 : 13} color={config.fg} strokeWidth={2.5} />
      <Text style={[styles.badgeText, large && styles.largeText, { color: config.fg }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.badge,
    alignSelf: 'flex-start',
  },
  large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  largeText: {
    fontSize: 13,
  },
});

export default StatusBadge;
