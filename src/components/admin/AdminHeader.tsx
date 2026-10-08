import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Bell } from 'lucide-react-native';

export default function AdminHeader({ activeAlertsCount = 1 }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <ShieldCheck size={20} color="#fff" />
        </View>
        <View>
          <Text style={styles.title}>
            Transit<Text style={styles.titleHighlight}>Plus</Text> Ops
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Live WebSocket Online</Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.bellContainer}>
          <Bell size={18} color="#e2e8f0" />
          {activeAlertsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeAlertsCount}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50, // For safe area on iOS
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  titleHighlight: {
    color: '#0ea5e9',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellContainer: {
    position: 'relative',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f43f5e',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  }
});
