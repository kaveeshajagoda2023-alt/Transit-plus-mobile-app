import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export const FederalNoticeCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Feather name="shield" size={18} color="#1D4ED8" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Federal & State Compliance</Text>
        <Text style={styles.bodyText}>
          <Text style={styles.boldNotice}>Notice: </Text>
          Unauthorized access to public transit operational terminals is prohibited and monitored under Public Transportation Safety Act Sec. 402. All sessions and GPS geofences are logged with dispatch telemetry.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 18,
    marginBottom: 24,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  bodyText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  boldNotice: {
    fontWeight: '800',
    color: '#1E293B',
  },
});
