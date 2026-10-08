import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ServiceStatus } from '@/types/vehicle';
import { TransitColors } from '@/constants/transitTheme';

interface ETABadgeProps {
  etaMinutes: number;
}

export const ETABadge: React.FC<ETABadgeProps> = ({ etaMinutes }) => {
  const isUrgent = etaMinutes <= 5;
  const bgColor: string = isUrgent ? TransitColors.etaPeachBg : TransitColors.etaNeutralBg;
  const textColor: string = isUrgent ? TransitColors.etaPeachText : TransitColors.etaNeutralText;

  return (
    <View style={[styles.etaContainer, { backgroundColor: bgColor }]}>
      <Text style={[styles.etaText, { color: textColor }]}>
        {etaMinutes} min
      </Text>
    </View>
  );
};

interface StatusBadgeProps {
  status: ServiceStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bgColor: string = TransitColors.onTimeBg;
  let textColor: string = TransitColors.onTimeText;
  let label = 'ON TIME';

  switch (status) {
    case 'arriving':
      bgColor = TransitColors.arrivingBg;
      textColor = TransitColors.arrivingText;
      label = 'ARRIVING';
      break;
    case 'on-time':
      bgColor = TransitColors.onTimeBg;
      textColor = TransitColors.onTimeText;
      label = 'ON TIME';
      break;
    case 'delayed':
      bgColor = TransitColors.delayedBg;
      textColor = TransitColors.delayedText;
      label = 'DELAYED';
      break;
    case 'offline':
      bgColor = TransitColors.offlineBg;
      textColor = TransitColors.offlineText;
      label = 'OFFLINE';
      break;
  }

  return (
    <View style={[styles.statusContainer, { backgroundColor: bgColor }]}>
      <Text style={[styles.statusText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  etaContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
  },
  etaText: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusContainer: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
