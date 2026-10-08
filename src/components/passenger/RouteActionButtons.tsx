import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface RouteActionButtonsProps {
  isNotificationEnabled: boolean;
  onToggleNotification: () => void;
  onTrackService: () => void;
}

export const RouteActionButtons: React.FC<RouteActionButtonsProps> = ({
  isNotificationEnabled,
  onToggleNotification,
  onTrackService,
}) => {
  return (
    <View style={styles.container}>
      {/* Notify 5m Before Button */}
      <TouchableOpacity
        style={[
          styles.notifyButton,
          isNotificationEnabled && styles.notifyButtonActive,
        ]}
        onPress={onToggleNotification}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={
          isNotificationEnabled
            ? 'Disable 5 minute arrival reminder'
            : 'Enable 5 minute arrival reminder'
        }
      >
        <Feather
          name="bell"
          size={16}
          color={isNotificationEnabled ? '#0F2942' : TransitColors.primary}
        />
        <Text
          style={[
            styles.notifyText,
            isNotificationEnabled && styles.notifyTextActive,
          ]}
        >
          {isNotificationEnabled ? 'Notify Active (5m)' : 'Notify 5m Before'}
        </Text>
      </TouchableOpacity>

      {/* Track Service Primary Button */}
      <TouchableOpacity
        style={styles.trackButton}
        onPress={onTrackService}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Track live vehicle location and progress"
      >
        <MaterialCommunityIcons name="radar" size={18} color="#FFFFFF" />
        <Text style={styles.trackText}>Track Service</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  notifyButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...TransitShadows.card,
  },
  notifyButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  notifyText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: TransitColors.primary,
  },
  notifyTextActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  trackButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: TransitColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...TransitShadows.floating,
  },
  trackText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
