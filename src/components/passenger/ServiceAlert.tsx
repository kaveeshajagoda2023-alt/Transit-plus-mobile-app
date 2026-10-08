import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { ServiceAlert as ServiceAlertType } from '@/types/route';

interface ServiceAlertProps {
  alert?: ServiceAlertType | null;
}

export const ServiceAlert: React.FC<ServiceAlertProps> = ({ alert }) => {
  if (!alert) return null;

  const isCritical = alert.severity === 'critical';
  const isWarning = alert.severity === 'warning';

  const bgColor = isCritical ? '#FEF2F2' : isWarning ? '#FFF7ED' : '#F0FDF4';
  const borderColor = isCritical ? '#FECACA' : isWarning ? '#FFEDD5' : '#DCFCE7';
  const iconColor = isCritical ? '#DC2626' : isWarning ? '#EA580C' : '#16A34A';
  const textColor = isCritical ? '#991B1B' : isWarning ? '#9A3412' : '#166534';

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <View style={[styles.iconWrap, { backgroundColor: borderColor }]}>
        <Feather name="alert-triangle" size={16} color={iconColor} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.alertMessage, { color: textColor }]}>
          {alert.message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 10,
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
