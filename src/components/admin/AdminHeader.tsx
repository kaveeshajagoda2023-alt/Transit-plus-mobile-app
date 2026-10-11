import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShieldCheck, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

export default function AdminHeader({ activeAlertsCount = 1 }) {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.leftSection}
        onPress={() => router.push('/admin/dashboard')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Admin Dashboard"
      >
        <View style={styles.iconContainer}>
          <ShieldCheck size={20} color={TransitColors.primary} />
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
      </TouchableOpacity>

      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={styles.bellContainer}
          onPress={() => router.push('/admin/alerts')}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="View Active Disruption Alerts"
        >
          <Bell size={18} color={TransitColors.primary} />
          {activeAlertsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeAlertsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50, // For safe area on iOS
    ...TransitShadows.card,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  titleHighlight: {
    color: TransitColors.primary,
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
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellContainer: {
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 11,
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
