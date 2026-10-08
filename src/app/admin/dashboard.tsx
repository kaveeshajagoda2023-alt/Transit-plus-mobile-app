import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Bus, Route, Ticket, AlertTriangle, ChevronRight, Activity, Zap } from 'lucide-react-native';

export default function DashboardOverviewScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Operations Center Dashboard</Text>
        <Text style={styles.headerTitle}>Fleet Status Overview</Text>
      </View>

      {/* 2x2 Operational Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Active Fleet</Text>
            <Bus size={18} color="#0ea5e9" />
          </View>
          <Text style={styles.metricVal}>142</Text>
          <Text style={styles.metricSubtext}>↑ 94.2% On-Time</Text>
        </View>

        <View style={[styles.metricCard, styles.emeraldCard]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Active Routes</Text>
            <Route size={18} color="#10b981" />
          </View>
          <Text style={[styles.metricVal, { color: '#10b981' }]}>24</Text>
          <Text style={styles.metricSubtextNeutral}>Bus & BRT & Rail</Text>
        </View>

        <View style={[styles.metricCard, styles.amberCard]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Passes Issued</Text>
            <Ticket size={18} color="#f59e0b" />
          </View>
          <Text style={[styles.metricVal, { color: '#f59e0b' }]}>18.4K</Text>
          <Text style={[styles.metricSubtextNeutral, { color: '#f59e0b' }]}>Rs 520,400 Today</Text>
        </View>

        <TouchableOpacity 
          style={[styles.metricCard, styles.roseCard]} 
          onPress={() => router.push('/admin/ticket-audit')}
        >
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Flagged Anomalies</Text>
            <AlertTriangle size={18} color="#f43f5e" />
          </View>
          <Text style={[styles.metricVal, { color: '#f43f5e' }]}>23</Text>
          <Text style={[styles.metricSubtextNeutral, { color: '#f43f5e' }]}>Tap to Audit Hub →</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Cards */}
      <TouchableOpacity 
        style={styles.actionCard} 
        onPress={() => router.push('/admin/fleet-radar')}
      >
        <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
          <Zap size={22} color="#0ea5e9" />
        </View>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>Live Fleet Telemetry Radar</Text>
          <Text style={styles.actionSubtitle}>Track 45 active buses/trains with pull-up bottom sheet</Text>
        </View>
        <ChevronRight size={20} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionCard} 
        onPress={() => router.push('/admin/alerts')}
      >
        <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
          <AlertTriangle size={22} color="#f43f5e" />
        </View>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>Emergency Disruption Alert</Text>
          <Text style={styles.actionSubtitle}>Broadcast service alerts with error-prevention modal</Text>
        </View>
        <ChevronRight size={20} color="#94a3b8" />
      </TouchableOpacity>

      {/* Operational Logs Stream */}
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <Activity size={16} color="#0ea5e9" />
          <Text style={styles.logHeaderText}>Live Operations Log Stream</Text>
        </View>

        <View style={styles.logList}>
          <View style={styles.logItem}>
            <View style={styles.logItemLeft}>
              <Text style={styles.logItemBold}>#TN-0824</Text>
              <Text style={styles.logItemNormal}> • Route 42 Eastbound</Text>
            </View>
            <Text style={styles.logItemWarning}>Delayed (+15m)</Text>
          </View>

          <View style={styles.logItem}>
            <View style={styles.logItemLeft}>
              <Text style={styles.logItemBold}>#TK-9830</Text>
              <Text style={styles.logItemNormal}> • Conductor CND-77492</Text>
            </View>
            <Text style={styles.logItemDanger}>Flagged Anomaly</Text>
          </View>

          <View style={[styles.logItem, { borderBottomWidth: 0 }]}>
            <View style={styles.logItemLeft}>
              <Text style={styles.logItemBold}>#TN-0830</Text>
              <Text style={styles.logItemNormal}> • Route 18 Express Train</Text>
            </View>
            <Text style={styles.logItemSuccess}>On Time (65km/h)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  header: {
    marginBottom: 16,
    marginTop: 40,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emeraldCard: { borderColor: 'rgba(16, 185, 129, 0.2)' },
  amberCard: { borderColor: 'rgba(245, 158, 11, 0.2)' },
  roseCard: { borderColor: 'rgba(244, 63, 94, 0.2)' },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  metricSubtextNeutral: {
    fontSize: 11,
    color: '#94a3b8',
  },
  actionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  logCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  logList: {
    flexDirection: 'column',
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  logItemLeft: {
    flexDirection: 'row',
  },
  logItemBold: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 12,
  },
  logItemNormal: {
    color: '#94a3b8',
    fontSize: 12,
  },
  logItemWarning: {
    color: '#f59e0b',
    fontWeight: '600',
    fontSize: 12,
  },
  logItemDanger: {
    color: '#f43f5e',
    fontWeight: '600',
    fontSize: 12,
  },
  logItemSuccess: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 12,
  },
});
