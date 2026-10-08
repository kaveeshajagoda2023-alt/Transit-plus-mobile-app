import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, theme } from '../theme';

const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
        return {
          bg: '#E6F4EA',
          text: '#137333',
        };
      case 'used':
      case 'expired':
        return {
          bg: '#F1F3F4',
          text: '#5F6368',
        };
      case 'cancelled':
      case 'failed':
        return {
          bg: '#FCE8E6',
          text: '#C5221F',
        };
      case 'pending':
      default:
        return {
          bg: '#FEF7E0',
          text: '#B06000',
        };
    }
  };

  const styleConfig = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: styleConfig.bg }]}>
      <Text style={[styles.badgeText, { color: styleConfig.text }]}>
        {status || 'Active'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.badge,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default StatusBadge;
