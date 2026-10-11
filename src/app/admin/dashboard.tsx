import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Bus, Route, Ticket, AlertTriangle, ChevronRight, Activity, Zap, Sparkles } from 'lucide-react-native';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

export default function DashboardOverviewScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Section Header */}
      <View style={styles.header}>
        <View style={styles.pillBadge}>
          <Sparkles size={12} color="#4338CA" style={{ marginRight: 5 }} />
          <Text style={styles.pillBadgeText}>Member 4 • Operations Center</Text>
        </View>
        <Text style={styles.headerTitle}>Fleet Status Overview</Text>
        <Text style={styles.headerSubtitle}>Real-time telemetry, active transit lines & incident feed</Text>
      </View>

      {/* 2x2 Operational Metrics Grid (Light Theme with Pastel Accents) */}
      <View style={styles.metricsGrid}>
        {/* Metric 1: Active Fleet (Sky Blue Accent) */}
        <TouchableOpacity 
          style={[styles.metricCard, styles.skyCard]}
          onPress={() => router.push('/admin/vehicles')}
          activeOpacity={0.75}
          accessibilityLabel="View Fleet Vehicle Inventory"
        >
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Active Fleet</Text>
            <View style={[styles.metricIconWrap, { backgroundColor: '#E0F2FE' }]}>
              <Bus size={17} color="#0284C7" />
            </View>
          </View>
          <Text style={[styles.metricVal, { color: '#0369A1' }]}>142</Text>
          <View style={styles.metricSubRow}>
            <Text style={[styles.metricSubtext, { color: '#0284C7' }]}>Manage Fleet →</Text>
          </View>
        </TouchableOpacity>

        {/* Metric 2: Active Routes (Mint Green Accent) */}
        <View style={[styles.metricCard, styles.mintCard]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Active Routes</Text>
            <View style={[styles.metricIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Route size={17} color="#059669" />
            </View>
          </View>
          <Text style={[styles.metricVal, { color: '#047857' }]}>24</Text>
          <View style={styles.metricSubRow}>
            <Text style={styles.metricSubtextNeutral}>Bus, BRT & Rail</Text>
          </View>
        </View>

        {/* Metric 3: Passes Issued (Peach / Amber Accent) */}
        <View style={[styles.metricCard, styles.peachCard]}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Passes Issued</Text>
            <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ticket size={17} color="#D97706" />
            </View>
          </View>
          <Text style={[styles.metricVal, { color: '#B45309' }]}>18.4K</Text>
          <View style={styles.metricSubRow}>
            <Text style={[styles.metricSubtextNeutral, { color: '#92400E' }]}>LKR 520,400 Today</Text>
          </View>
        </View>

        {/* Metric 4: Flagged Anomalies (Rose Accent) */}
        <TouchableOpacity 
          style={[styles.metricCard, styles.roseCard]} 
          onPress={() => router.push('/admin/ticket-audit')}
          activeOpacity={0.75}
          accessibilityLabel="Audit Flagged Anomalies"
        >
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Flagged Audit</Text>
            <View style={[styles.metricIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <AlertTriangle size={17} color="#E11D48" />
            </View>
          </View>
          <Text style={[styles.metricVal, { color: '#BE123C' }]}>23</Text>
          <View style={styles.metricSubRow}>
            <Text style={[styles.metricSubtextNeutral, { color: '#E11D48' }]}>Audit Hub →</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionHeading}>Operations & Dispatch Center</Text>

      {/* Quick Action Card 1: Vehicle Management */}
      <TouchableOpacity 
        style={styles.actionCard} 
        onPress={() => router.push('/admin/vehicles')}
        activeOpacity={0.75}
      >
        <View style={[styles.actionIconContainer, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
          <Bus size={22} color="#059669" />
        </View>
        <View style={styles.actionTextContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.actionTitle}>Vehicle & Fleet Management</Text>
            <View style={[styles.actionTag, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.actionTagText, { color: '#15803D' }]}>CRUD 1</Text>
            </View>
          </View>
          <Text style={styles.actionSubtitle}>Add, edit, assign drivers, schedule service & toggle status</Text>
        </View>
        <ChevronRight size={18} color="#94A3B8" />
      </TouchableOpacity>

      {/* Quick Action Card 2: Live Fleet Telemetry Radar */}
      <TouchableOpacity 
        style={styles.actionCard} 
        onPress={() => router.push('/admin/fleet-radar')}
        activeOpacity={0.75}
      >
        <View style={[styles.actionIconContainer, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
          <Zap size={22} color="#0284C7" />
        </View>
        <View style={styles.actionTextContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.actionTitle}>Live Fleet Telemetry Radar</Text>
            <View style={[styles.actionTag, { backgroundColor: '#E0F2FE' }]}>
              <Text style={[styles.actionTagText, { color: '#0369A1' }]}>US08</Text>
            </View>
          </View>
          <Text style={styles.actionSubtitle}>Interactive spatial vector map with live telemetry sheet</Text>
        </View>
        <ChevronRight size={18} color="#94A3B8" />
      </TouchableOpacity>

      {/* Quick Action Card 3: Emergency Disruption Alert */}
      <TouchableOpacity 
        style={styles.actionCard} 
        onPress={() => router.push('/admin/alerts')}
        activeOpacity={0.75}
      >
        <View style={[styles.actionIconContainer, { backgroundColor: '#FEE2E2', borderColor: '#FECDD3' }]}>
          <AlertTriangle size={22} color="#DC2626" />
        </View>
        <View style={styles.actionTextContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.actionTitle}>Emergency Disruption Alert</Text>
            <View style={[styles.actionTag, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.actionTagText, { color: '#DC2626' }]}>CRUD 2</Text>
            </View>
          </View>
          <Text style={styles.actionSubtitle}>Compose and broadcast service notifications with defensive modal</Text>
        </View>
        <ChevronRight size={18} color="#94A3B8" />
      </TouchableOpacity>

      {/* Operational Logs Stream Card */}
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={[styles.logIconWrap, { backgroundColor: '#EEF2FF' }]}>
            <Activity size={15} color="#4338CA" />
          </View>
          <Text style={styles.logHeaderText}>Live Operations Log Stream</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Streaming</Text>
          </View>
        </View>

        <View style={styles.logList}>
          {/* Log 1: Delayed */}
          <View style={styles.logItem}>
            <View style={styles.logItemLeft}>
              <Text style={styles.logItemBold}>#TN-0824</Text>
              <Text style={styles.logItemNormal}> • Route 42 Eastbound</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              <Text style={[styles.statusPillText, { color: '#B45309' }]}>Delayed (+15m)</Text>
            </View>
          </View>

          {/* Log 2: Flagged Anomaly */}
          <View style={styles.logItem}>
            <View style={styles.logItemLeft}>
              <Text style={styles.logItemBold}>#TK-9830</Text>
              <Text style={styles.logItemNormal}> • Conductor CND-77492</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#FEE2E2', borderColor: '#FECDD3' }]}>
              <Text style={[styles.statusPillText, { color: '#DC2626' }]}>Flagged Anomaly</Text>
            </View>
          </View>

          {/* Log 3: On Time */}
          <View style={[styles.logItem, { borderBottomWidth: 0 }]}>
            <View style={styles.logItemLeft}>
              <Text style={styles.logItemBold}>#TN-0830</Text>
              <Text style={styles.logItemNormal}> • Route 18 Express Train</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#DCFCE7', borderColor: '#A7F3D0' }]}>
              <Text style={[styles.statusPillText, { color: '#15803D' }]}>On Time (65km/h)</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 18,
    marginTop: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  pillBadgeText: {
    color: '#4338CA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  skyCard: {
    borderColor: '#BAE6FD',
  },
  mintCard: {
    borderColor: '#A7F3D0',
  },
  peachCard: {
    borderColor: '#FDE68A',
  },
  roseCard: {
    borderColor: '#FECDD3',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  metricSubRow: {
    marginTop: 2,
  },
  metricSubtext: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricSubtextNeutral: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
    marginTop: 6,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionTag: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  actionTagText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 15,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
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
    borderBottomColor: '#F1F5F9',
  },
  logItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  logItemBold: {
    color: '#0F2942',
    fontWeight: '700',
    fontSize: 12,
  },
  logItemNormal: {
    color: '#64748B',
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
