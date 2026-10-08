import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBadge } from './StatusBadge';
import { SystemStatusType } from '@/types/systemState';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface StateCardProps {
  icon?: React.ReactNode;
  stateNumber: string;
  stateLabel: string;
  statusBadgeLabel: string;
  statusBadgeType?: SystemStatusType;
  children: React.ReactNode;
}

export const StateCard: React.FC<StateCardProps> = ({
  icon,
  stateNumber,
  stateLabel,
  statusBadgeLabel,
  statusBadgeType = 'active-query',
  children,
}) => {
  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {icon ? (
            <View style={styles.iconWrap}>{icon}</View>
          ) : (
            <View style={styles.dotIcon} />
          )}
          <Text style={styles.headerTitle}>
            {stateNumber} • {stateLabel}
          </Text>
        </View>

        <StatusBadge label={statusBadgeLabel} statusType={statusBadgeType} />
      </View>

      {/* Card Content Slot */}
      <View style={styles.contentWrap}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...TransitShadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotIcon: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0F2942',
  },
  headerTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    letterSpacing: 0.4,
  },
  contentWrap: {
    marginTop: 2,
  },
});
