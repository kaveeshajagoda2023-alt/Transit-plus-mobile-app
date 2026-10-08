import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SystemStatusType } from '@/types/systemState';
import { TransitColors } from '@/constants/transitTheme';

interface StatusBadgeProps {
  label: string;
  statusType?: SystemStatusType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  statusType = 'active-query',
}) => {
  let bgColor = '#EFF6FF';
  let textColor = '#1D4ED8';

  switch (statusType) {
    case 'active-query':
    case 'loading':
      bgColor = '#EFF6FF';
      textColor = '#1D4ED8';
      break;
    case 'gps-lock':
    case 'ready':
      bgColor = '#DCFCE7';
      textColor = '#15803D';
      break;
    case 'error':
    case 'gps-lost':
      bgColor = '#FEE2E2';
      textColor = '#DC2626';
      break;
    case 'empty':
    case 'offline':
      bgColor = '#F1F5F9';
      textColor = '#64748B';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
