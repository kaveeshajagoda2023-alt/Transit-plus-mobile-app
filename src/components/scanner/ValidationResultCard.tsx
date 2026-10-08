import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScanValidationResponse } from '@/types/trip';

interface ValidationResultCardProps {
  response: ScanValidationResponse | null;
  onDismiss: () => void;
  onEnterManual?: () => void;
  isOfflineQueued?: boolean;
}

export const ValidationResultCard: React.FC<ValidationResultCardProps> = ({
  response,
  onDismiss,
  onEnterManual,
  isOfflineQueued = false,
}) => {
  if (!response) return null;

  const { valid, result, reason, ticketId, ticketTypeLabel, fareAmount, passengerName, activityItem } = response;
  const isUsed = reason?.toLowerCase().includes('already') || reason?.toLowerCase().includes('duplicate') || ticketTypeLabel?.toLowerCase().includes('redeemed');
  const isExpired = reason?.toLowerCase().includes('expired') || ticketTypeLabel?.toLowerCase().includes('expired');

  // Valid / Pass State
  if (valid && result === 'PASS') {
    return (
      <View style={[styles.card, styles.validCard]}>
        <View style={styles.topStatusRow}>
          <View style={styles.validBadge}>
            <Feather name="check-circle" size={20} color="#059669" />
            <Text style={styles.validBadgeText}>Ticket Valid</Text>
          </View>
          <Text style={styles.fareAmountText}>+${fareAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>TICKET ID</Text>
            <Text style={styles.detailValueBold}>{ticketId}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>PASSENGER</Text>
            <Text style={styles.detailValue}>{passengerName || 'Digital Cardholder'}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>TYPE</Text>
            <Text style={styles.detailValue}>{ticketTypeLabel}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>STATUS</Text>
            <Text style={[styles.detailValue, { color: '#10B981' }]}>
              {isOfflineQueued ? 'Active • Offline Queued' : 'Active • Onboarded'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={onDismiss}>
          <Text style={styles.continueBtnText}>Continue Scanning</Text>
          <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    );
  }

  // Already Used State
  if (isUsed) {
    return (
      <View style={[styles.card, styles.usedCard]}>
        <View style={styles.topStatusRow}>
          <View style={styles.usedBadge}>
            <Feather name="alert-triangle" size={20} color="#D97706" />
            <Text style={styles.usedBadgeText}>Ticket Already Used</Text>
          </View>
          <Text style={styles.codePill}>{ticketId}</Text>
        </View>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonText}>
            {reason || 'This ticket was already redeemed earlier on this vehicle.'}
          </Text>
          <Text style={styles.metaSubText}>
            Previous Scan: Today, {new Date(activityItem?.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Device: TERM-4028
          </Text>
        </View>

        <TouchableOpacity style={[styles.continueBtn, styles.usedActionBtn]} onPress={onDismiss}>
          <Text style={styles.continueBtnText}>Acknowledge & Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Expired State
  if (isExpired) {
    return (
      <View style={[styles.card, styles.expiredCard]}>
        <View style={styles.topStatusRow}>
          <View style={styles.expiredBadge}>
            <Feather name="clock" size={20} color="#DC2626" />
            <Text style={styles.expiredBadgeText}>Ticket Expired</Text>
          </View>
          <Text style={styles.codePill}>{ticketId}</Text>
        </View>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonText}>
            {reason || 'This ticket has expired. Passenger must purchase a new fare.'}
          </Text>
        </View>

        <View style={styles.dualActionsRow}>
          {onEnterManual && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={onEnterManual}>
              <Text style={styles.secondaryBtnText}>Enter Manually</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.continueBtn, { flex: 1 }]} onPress={onDismiss}>
            <Text style={styles.continueBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // General Invalid State
  return (
    <View style={[styles.card, styles.invalidCard]}>
      <View style={styles.topStatusRow}>
        <View style={styles.invalidBadge}>
          <Feather name="x-circle" size={20} color="#DC2626" />
          <Text style={styles.invalidBadgeText}>Invalid Ticket</Text>
        </View>
        <Text style={styles.codePill}>{ticketId || 'UNKNOWN'}</Text>
      </View>

      <View style={styles.reasonBox}>
        <Text style={styles.reasonText}>
          {reason || 'Ticket code is not recognized in the Metro Transit database.'}
        </Text>
      </View>

      <View style={styles.dualActionsRow}>
        {onEnterManual && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={onEnterManual}>
            <Text style={styles.secondaryBtnText}>Enter Manually</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.continueBtn, { flex: 1 }]} onPress={onDismiss}>
          <Text style={styles.continueBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F1E33',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  validCard: {
    borderColor: '#10B981',
    backgroundColor: '#0B2228',
  },
  usedCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#261C10',
  },
  expiredCard: {
    borderColor: '#EF4444',
    backgroundColor: '#271216',
  },
  invalidCard: {
    borderColor: '#EF4444',
    backgroundColor: '#241318',
  },
  topStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validBadgeText: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '800',
  },
  usedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usedBadgeText: {
    color: '#FBBF24',
    fontSize: 16,
    fontWeight: '800',
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expiredBadgeText: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: '800',
  },
  invalidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invalidBadgeText: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: '800',
  },
  fareAmountText: {
    color: '#10B981',
    fontSize: 17,
    fontWeight: '800',
  },
  codePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 12,
  },
  detailItem: {
    width: '46%',
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  detailValue: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '600',
  },
  detailValueBold: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '800',
  },
  reasonBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  reasonText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  metaSubText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 6,
  },
  continueBtn: {
    backgroundColor: '#059669',
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usedActionBtn: {
    backgroundColor: '#D97706',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  dualActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
});
