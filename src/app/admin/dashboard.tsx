import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Bus, Route, Ticket, AlertTriangle, ChevronRight, Activity, Zap, Sparkles, RefreshCw, Radio } from 'lucide-react-native';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';
import { getAdminApiUrl } from '@/services/utils/adminApiUrl';
import { adminDataStorage } from '@/services/storage/adminDataStorage';

interface DashboardMetrics {
  activeFleetCount: number;
  totalFleetCount: number;
  delayedFleetCount: number;
  maintenanceFleetCount: number;
  activeRoutesCount: number;
  passesIssuedCount: number;
  totalFareCollectedLKR: number;
  flaggedAnomaliesCount: number;
  activeDisruptionsCount: number;
  onTimePerformancePercentage: number;
  dbStatus: string;
}

interface OperationLog {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  borderColor: string;
  timestamp: string;
}

const INITIAL_METRICS: DashboardMetrics = {
  activeFleetCount: 4,
  totalFleetCount: 6,
  delayedFleetCount: 1,
  maintenanceFleetCount: 1,
  activeRoutesCount: 3,
  passesIssuedCount: 6,
  totalFareCollectedLKR: 1165,
  flaggedAnomaliesCount: 2,
  activeDisruptionsCount: 2,
  onTimePerformancePercentage: 83,
  dbStatus: 'MongoDB Datastore Sync Active',
};

export default function DashboardOverviewScreen() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics>(INITIAL_METRICS);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just Now');

  const fetchDashboardData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);
      const res = await fetch(getAdminApiUrl('/api/admin/metrics'));
      if (res.ok) {
        const data = await res.json();
        if (data?.metrics) {
          setMetrics(data.metrics);
        }
        if (data?.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch {
      // Offline fallback: dynamically aggregate from client-side persistent storage
      try {
        const localVehicles = await adminDataStorage.getVehicles([]);
        const localAlerts = await adminDataStorage.getAlerts([]);
        const localAudits = await adminDataStorage.getTicketAudits([]);
        if (localVehicles.length > 0 || localAlerts.length > 0 || localAudits.length > 0) {
          const activeV = localVehicles.filter((v: any) => v.status === 'Active').length;
          const delayedV = localVehicles.filter((v: any) => v.status === 'Delayed').length;
          const activeA = localAlerts.filter((a: any) => a.status === 'Active').length;
          const flaggedT = localAudits.filter((t: any) => t.status === 'flagged').length;
          const totalFare = localAudits.reduce((sum: number, t: any) => sum + (Number(t.fare) || 0), 0);
          const uniqueR = Array.from(new Set(localVehicles.map((v: any) => v.routeId).filter(Boolean))).length;
          setMetrics((prev) => ({
            ...prev,
            activeFleetCount: activeV || prev.activeFleetCount,
            totalFleetCount: localVehicles.length || prev.totalFleetCount,
            delayedFleetCount: delayedV || prev.delayedFleetCount,
            activeDisruptionsCount: activeA || prev.activeDisruptionsCount,
            activeRoutesCount: uniqueR || prev.activeRoutesCount,
            passesIssuedCount: localAudits.length || prev.passesIssuedCount,
            totalFareCollectedLKR: totalFare || prev.totalFareCollectedLKR,
            flaggedAnomaliesCount: flaggedT || prev.flaggedAnomaliesCount,
          }));
        }
      } catch {}
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Real-time auto polling every 6 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchDashboardData(false)} colors={['#0284C7']} />
      }
    >
      {/* Top Section Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.pillBadge}>
            <Sparkles size={12} color="#4338CA" style={{ marginRight: 5 }} />
            <Text style={styles.pillBadgeText}>Operations Control Center</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerRefreshBtn}
            onPress={() => fetchDashboardData(false)}
            disabled={isRefreshing}
            accessibilityLabel="Refresh real-time operations data"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#0284C7" />
            ) : (
              <RefreshCw size={14} color="#64748B" />
            )}
            <Text style={styles.headerRefreshText}>{lastSyncedTime}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>Fleet Status Overview</Text>
        <Text style={styles.headerSubtitle}>Real-time telemetry, active transit lines & incident feed</Text>
      </View>

      {/* 2x2 Operational Metrics Grid (Real-Time Live Data) */}
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
          <Text style={[styles.metricVal, { color: '#0369A1' }]}>
            {metrics.activeFleetCount}
          </Text>
          <View style={styles.metricSubRow}>
            <Text style={[styles.metricSubtext, { color: '#0284C7' }]}>
              {metrics.totalFleetCount} in Fleet ({metrics.onTimePerformancePercentage}% On-Time) →
            </Text>
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
          <Text style={[styles.metricVal, { color: '#047857' }]}>
            {metrics.activeRoutesCount}
          </Text>
          <View style={styles.metricSubRow}>
            <Text style={styles.metricSubtextNeutral}>Bus, BRT & Rail Lines</Text>
          </View>
        </View>

        {/* Metric 3: Audited Passes (Peach / Amber Accent) */}
        <TouchableOpacity 
          style={[styles.metricCard, styles.peachCard]}
          onPress={() => router.push('/admin/ticket-audit')}
          activeOpacity={0.75}
          accessibilityLabel="View Ticket Audits"
        >
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Audited Passes</Text>
            <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ticket size={17} color="#D97706" />
            </View>
          </View>
          <Text style={[styles.metricVal, { color: '#B45309' }]}>
            {metrics.passesIssuedCount >= 1000 
              ? `${(metrics.passesIssuedCount / 1000).toFixed(1)}K` 
              : metrics.passesIssuedCount}
          </Text>
          <View style={styles.metricSubRow}>
            <Text style={[styles.metricSubtextNeutral, { color: '#92400E' }]}>
              LKR {metrics.totalFareCollectedLKR.toLocaleString()} Verified →
            </Text>
          </View>
        </TouchableOpacity>

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
          <Text style={[styles.metricVal, { color: '#BE123C' }]}>
            {metrics.flaggedAnomaliesCount}
          </Text>
          <View style={styles.metricSubRow}>
            <Text style={[styles.metricSubtextNeutral, { color: '#E11D48' }]}>
              {metrics.activeDisruptionsCount > 0 ? `${metrics.activeDisruptionsCount} Active Alerts • Hub →` : 'Audit Hub →'}
            </Text>
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
              <Text style={[styles.actionTagText, { color: '#15803D' }]}>FLEET OPS</Text>
            </View>
          </View>
          <Text style={styles.actionSubtitle}>
            {metrics.totalFleetCount} vehicles • {metrics.delayedFleetCount > 0 ? `${metrics.delayedFleetCount} delayed` : 'all nominal'} • schedule service & diagnostics
          </Text>
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
              <Text style={[styles.actionTagText, { color: '#0369A1' }]}>LIVE GPS</Text>
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
              <Text style={[styles.actionTagText, { color: '#DC2626' }]}>
                {metrics.activeDisruptionsCount > 0 ? `${metrics.activeDisruptionsCount} ACTIVE` : 'BROADCAST'}
              </Text>
            </View>
          </View>
          <Text style={styles.actionSubtitle}>Compose and broadcast service notifications with defensive modal</Text>
        </View>
        <ChevronRight size={18} color="#94A3B8" />
      </TouchableOpacity>

      {/* Operational Logs Stream Card (Live Real-Time Stream) */}
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={[styles.logIconWrap, { backgroundColor: '#EEF2FF' }]}>
            <Activity size={15} color="#4338CA" />
          </View>
          <Text style={styles.logHeaderText}>Live Operations Log Stream</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Real-Time</Text>
          </View>
        </View>

        <View style={styles.logList}>
          {logs.length === 0 ? (
            <View style={{ paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#64748B' }}>Connecting to operations telemetry stream...</Text>
            </View>
          ) : (
            logs.map((item, index) => (
              <View 
                key={item.id || index} 
                style={[styles.logItem, index === logs.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={styles.logItemLeft}>
                  <Text style={styles.logItemBold}>{item.title}</Text>
                  <Text style={styles.logItemNormal} numberOfLines={1}>{item.subtitle}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: item.tagBg, borderColor: item.borderColor }]}>
                  <Text style={[styles.statusPillText, { color: item.tagColor }]}>{item.tag}</Text>
                </View>
              </View>
            ))
          )}
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
  headerRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  headerRefreshText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
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
