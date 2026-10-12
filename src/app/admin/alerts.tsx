import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  AlertTriangle,
  Send,
  ShieldAlert,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Route,
  ChevronRight,
  X,
  Radio,
  SlidersHorizontal,
  Flame,
  RefreshCw,
} from 'lucide-react-native';
import { getAdminApiUrl } from '@/services/utils/adminApiUrl';
import { adminDataStorage } from '@/services/storage/adminDataStorage';

export interface DisruptionAlert {
  id: string;
  incidentType: string;
  affectedRoute: string;
  affectedTransportType?: string;
  delayMinutes: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  rerouteText?: string;
  broadcastAt: string;
  broadcastBy?: string;
  source?: 'Driver' | 'Coordinator';
  status: 'Active' | 'Resolved';
}

const INITIAL_ALERTS: DisruptionAlert[] = [
  {
    id: 'ALT-1092',
    incidentType: 'Major Track Maintenance & Water Main Burst',
    affectedRoute: 'Route 42 Eastbound (Central to University)',
    affectedTransportType: 'Bus & Train',
    delayMinutes: 20,
    severity: 'High',
    rerouteText: 'Reroute via Station Road Bypass. Expect 20-min delay.',
    broadcastAt: '10:15 AM Today',
    status: 'Active',
  },
  {
    id: 'ALT-1088',
    incidentType: 'Signal Tower Intermittent Power Cut',
    affectedRoute: 'Route 18 Express Rail Line',
    affectedTransportType: 'Train',
    delayMinutes: 10,
    severity: 'Medium',
    rerouteText: 'Single track operation in effect between Central and Junction 4.',
    broadcastAt: '08:30 AM Today',
    status: 'Active',
  },
  {
    id: 'ALT-1075',
    incidentType: 'Morning Rush Hour Road Traffic Cleared',
    affectedRoute: 'Route 105 BRT Corridor',
    affectedTransportType: 'Bus',
    delayMinutes: 0,
    severity: 'Low',
    rerouteText: 'Corridor cleared. Normal scheduled dispatch resumed.',
    broadcastAt: 'Yesterday 05:40 PM',
    status: 'Resolved',
  },
];

export default function DisruptionAlertScreen() {
  const [alerts, setAlerts] = useState<DisruptionAlert[]>(INITIAL_ALERTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChip, setFilterChip] = useState<'All' | 'Active' | 'Resolved' | 'High'>('All');

  // Modal states
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<DisruptionAlert | null>(null);

  // Form states
  const [incidentType, setIncidentType] = useState('Severe Congestion & Obstruction');
  const [affectedRoute, setAffectedRoute] = useState('Route 42 Eastbound');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [delayMinutes, setDelayMinutes] = useState('15');
  const [rerouteText, setRerouteText] = useState('Follow station supervisor instructions. Reroute via Bypass.');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load from persistent local storage on mount, then poll backend
  useEffect(() => {
    adminDataStorage.getAlerts(INITIAL_ALERTS).then((saved) => {
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setAlerts(saved);
      }
      fetchAlerts();
    });
    const pollInterval = setInterval(() => {
      fetchAlerts(true);
    }, 8000);
    return () => clearInterval(pollInterval);
  }, []);

  const fetchAlerts = async (silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);
      const res = await fetch(getAdminApiUrl('/api/admin/disruptions'));
      if (res.ok) {
        const data = await res.json();
        if (data?.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
          const formatted = data.alerts.map((a: any) => ({
            id: a.alertId || a.id || 'ALT-0000',
            incidentType: a.incidentType,
            affectedRoute: a.affectedRoute,
            delayMinutes: a.delayMinutes || 15,
            severity: a.severity || 'High',
            rerouteText: a.rerouteInstruction || a.rerouteText || 'Follow detour signage.',
            broadcastAt: a.broadcastedAt
              ? typeof a.broadcastedAt === 'string' && (a.broadcastedAt.includes('AM') || a.broadcastedAt.includes('PM'))
                ? a.broadcastedAt
                : new Date(a.broadcastedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Just Now',
            broadcastBy: a.broadcastBy || 'Admin Ops',
            source: a.source || (a.broadcastBy?.includes('Operator') ? 'Driver' : 'Coordinator'),
            status: a.status || 'Active',
          }));
          setAlerts(formatted);
          adminDataStorage.saveAlerts(formatted);
        }
      }
    } catch {
      // Offline fallback: keep local alerts
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Preset Template Helper
  const applyPreset = (title: string, route: string, sev: 'Low' | 'Medium' | 'High' | 'Critical', mins: string, advice: string) => {
    setIncidentType(title);
    setAffectedRoute(route);
    setSeverity(sev);
    setDelayMinutes(mins);
    setRerouteText(advice);
  };

  // ================= CRUD 1: CREATE (BROADCAST) =================
  const handleOpenCompose = () => {
    setIncidentType('Road Obstruction & Maintenance');
    setAffectedRoute('Route 42 Eastbound');
    setSeverity('High');
    setDelayMinutes('15');
    setRerouteText('Reroute via Station Road Bypass. Expect delays.');
    setShowComposeModal(true);
  };

  const handleTriggerBroadcastConfirm = () => {
    if (!incidentType.trim() || !affectedRoute.trim()) {
      Alert.alert('Missing Field', 'Please provide an incident title and affected route.');
      return;
    }
    setShowComposeModal(false);
    setShowConfirmModal(true);
  };

  const handleBroadcastConfirmed = async () => {
    const newAlert: DisruptionAlert = {
      id: 'ALT-' + Math.floor(1000 + Math.random() * 9000),
      incidentType: incidentType.trim(),
      affectedRoute: affectedRoute.trim(),
      delayMinutes: parseInt(delayMinutes) || 15,
      severity,
      rerouteText: rerouteText.trim(),
      broadcastAt: 'Just Now',
      broadcastBy: 'Admin (IT23762572)',
      source: 'Coordinator',
      status: 'Active',
    };

    setAlerts((prev) => {
      const list = [newAlert, ...prev];
      adminDataStorage.saveAlerts(list);
      return list;
    });
    setShowConfirmModal(false);

    try {
      await fetch(getAdminApiUrl('/api/admin/disruptions/broadcast'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: newAlert.id,
          incidentType: newAlert.incidentType,
          affectedRoute: newAlert.affectedRoute,
          severity: newAlert.severity,
          delayMinutes: newAlert.delayMinutes,
          rerouteInstruction: newAlert.rerouteText,
          status: 'Active',
        }),
      });
    } catch {}
  };

  // ================= CRUD 2: UPDATE =================
  const handleOpenEdit = (a: DisruptionAlert) => {
    setSelectedAlert(a);
    setIncidentType(a.incidentType);
    setAffectedRoute(a.affectedRoute);
    setSeverity(a.severity);
    setDelayMinutes(String(a.delayMinutes));
    setRerouteText(a.rerouteText || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAlert) return;
    const updated: DisruptionAlert = {
      ...selectedAlert,
      incidentType: incidentType.trim(),
      affectedRoute: affectedRoute.trim(),
      severity,
      delayMinutes: parseInt(delayMinutes) || selectedAlert.delayMinutes,
      rerouteText: rerouteText.trim(),
    };

    setAlerts((prev) => {
      const list = prev.map((a) => (a.id === selectedAlert.id ? updated : a));
      adminDataStorage.saveAlerts(list);
      return list;
    });
    setShowEditModal(false);

    try {
      await fetch(getAdminApiUrl('/api/admin/disruptions/update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: selectedAlert.id,
          incidentType: updated.incidentType,
          affectedRoute: updated.affectedRoute,
          severity: updated.severity,
          delayMinutes: updated.delayMinutes,
          rerouteInstruction: updated.rerouteText,
          status: updated.status,
        }),
      });
    } catch {}
  };

  const handleToggleResolveStatus = async (a: DisruptionAlert) => {
    const nextStatus: 'Active' | 'Resolved' = a.status === 'Active' ? 'Resolved' : 'Active';
    const updated: DisruptionAlert = {
      ...a,
      status: nextStatus,
      delayMinutes: nextStatus === 'Resolved' ? 0 : a.delayMinutes || 10,
    };

    setAlerts((prev) => {
      const list = prev.map((item) => (item.id === a.id ? updated : item));
      adminDataStorage.saveAlerts(list);
      return list;
    });

    try {
      await fetch(getAdminApiUrl('/api/admin/disruptions/update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: a.id,
          status: nextStatus,
          delayMinutes: updated.delayMinutes,
        }),
      });
    } catch {}
  };

  // ================= CRUD 3: DELETE (WITHDRAW) =================
  const handleConfirmDelete = async () => {
    if (!selectedAlert) return;
    const targetId = selectedAlert.id;
    setAlerts((prev) => {
      const list = prev.filter((a) => a.id !== targetId);
      adminDataStorage.saveAlerts(list);
      return list;
    });
    setShowDeleteModal(false);

    try {
      await fetch(getAdminApiUrl('/api/admin/disruptions/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: targetId }),
      });
    } catch {}
  };

  // Filtered feed
  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.incidentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.affectedRoute.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterChip === 'All') return true;
    if (filterChip === 'Active') return a.status === 'Active';
    if (filterChip === 'Resolved') return a.status === 'Resolved';
    if (filterChip === 'High') return a.severity === 'High' || a.severity === 'Critical';
    return true;
  });

  const totalCount = alerts.length;
  const activeCount = alerts.filter((a) => a.status === 'Active').length;
  const resolvedCount = alerts.filter((a) => a.status === 'Resolved').length;

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return '#f43f5e';
      case 'High':
        return '#fb923c';
      case 'Medium':
        return '#f59e0b';
      case 'Low':
        return '#10b981';
      default:
        return '#94a3b8';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>CRUD 2 — Disruption Operations</Text>
          <Text style={styles.headerTitle}>Disruption Alert Hub</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={styles.refreshIconBtn}
            onPress={() => fetchAlerts(false)}
            disabled={isRefreshing}
            accessibilityLabel="Refresh Alerts"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#0F2942" />
            ) : (
              <RefreshCw size={16} color="#0F2942" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.composeButton}
            onPress={handleOpenCompose}
            accessibilityLabel="Broadcast New Service Alert"
          >
            <Send size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.composeButtonText}>New Broadcast</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3-Stat Operations Ribbon */}
      <View style={styles.ribbonContainer}>
        <View style={styles.ribbonCard}>
          <Text style={styles.ribbonLabel}>Total Broadcasts</Text>
          <Text style={[styles.ribbonVal, { color: '#0ea5e9' }]}>{totalCount}</Text>
        </View>
        <View style={styles.ribbonCard}>
          <Text style={styles.ribbonLabel}>Active On-Air</Text>
          <Text style={[styles.ribbonVal, { color: '#f43f5e' }]}>{activeCount}</Text>
        </View>
        <View style={styles.ribbonCard}>
          <Text style={styles.ribbonLabel}>Cleared / Resolved</Text>
          <Text style={[styles.ribbonVal, { color: '#10b981' }]}>{resolvedCount}</Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color="#94a3b8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by incident, route, or alert ID..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        {(['All', 'Active', 'Resolved', 'High'] as const).map((chip) => (
          <TouchableOpacity
            key={chip}
            style={[styles.chip, filterChip === chip && styles.chipActive]}
            onPress={() => setFilterChip(chip)}
          >
            <Text style={[styles.chipText, filterChip === chip && styles.chipTextActive]}>
              {chip === 'All' ? 'All Broadcasts' : chip === 'Active' ? '🚨 Active Now' : chip === 'Resolved' ? '✓ Resolved' : '🔥 High Severity'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed List (READ) */}
      <ScrollView style={styles.feedScroll} contentContainerStyle={{ paddingBottom: 28 }}>
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertTriangle size={40} color="#475569" />
            <Text style={styles.emptyTitle}>No matching alerts found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filter chip or search criteria.</Text>
          </View>
        ) : (
          filteredAlerts.map((a) => {
            const sevColor = getSeverityColor(a.severity);
            const isResolved = a.status === 'Resolved';

            return (
              <View
                key={a.id}
                style={[
                  styles.alertCard,
                  isResolved ? styles.alertCardResolved : { borderLeftColor: sevColor, borderLeftWidth: 4 },
                ]}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                      <Text style={styles.alertIdText}>#{a.id}</Text>
                      <View style={[styles.sevBadge, { backgroundColor: `${sevColor}22`, borderColor: `${sevColor}55` }]}>
                        <Text style={[styles.sevBadgeText, { color: sevColor }]}>{a.severity.toUpperCase()}</Text>
                      </View>
                      {a.source === 'Driver' && (
                        <View style={styles.driverTagPill}>
                          <Text style={styles.driverTagText}>🚨 DRIVER REPORT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.incidentTitleText}>{a.incidentType}</Text>
                  </View>

                  {/* 1-Tap Resolve Status Switcher */}
                  <TouchableOpacity
                    style={[
                      styles.statusToggleBtn,
                      isResolved ? styles.statusToggleBtnResolved : styles.statusToggleBtnActive,
                    ]}
                    onPress={() => handleToggleResolveStatus(a)}
                    accessibilityLabel={`Toggle resolution for ${a.id}`}
                  >
                    {isResolved ? (
                      <>
                        <CheckCircle2 size={12} color="#10b981" style={{ marginRight: 4 }} />
                        <Text style={styles.statusToggleTextResolved}>Resolved</Text>
                      </>
                    ) : (
                      <>
                        <Radio size={12} color="#f43f5e" style={{ marginRight: 4 }} />
                        <Text style={styles.statusToggleTextActive}>Active Broadcast</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Route & Delay Details */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Route size={14} color="#94a3b8" style={{ marginRight: 4 }} />
                    <Text style={styles.detailText} numberOfLines={1}>{a.affectedRoute}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Clock size={14} color="#94a3b8" style={{ marginRight: 4 }} />
                    <Text style={[styles.detailText, { color: a.delayMinutes > 0 ? '#f59e0b' : '#10b981', fontWeight: '700' }]}>
                      {a.delayMinutes > 0 ? `+${a.delayMinutes} mins delay` : 'No delay'}
                    </Text>
                  </View>
                </View>

                {/* Reroute advice preview */}
                {Boolean(a.rerouteText) && (
                  <View style={styles.adviceBox}>
                    <Text style={styles.adviceText}>💬 Advice: {a.rerouteText}</Text>
                  </View>
                )}

                {/* Footer with Timestamp and Action Buttons */}
                <View style={styles.cardFooter}>
                  <Text style={styles.timestampText}>
                    Dispatched: {a.broadcastAt}{a.broadcastBy ? ` • ${a.broadcastBy}` : ''}
                  </Text>

                  <View style={styles.actionsGroup}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleOpenEdit(a)}
                      accessibilityLabel="Edit alert details"
                    >
                      <Edit3 size={14} color="#94a3b8" />
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: 'rgba(244, 63, 94, 0.3)' }]}
                      onPress={() => {
                        setSelectedAlert(a);
                        setShowDeleteModal(true);
                      }}
                      accessibilityLabel="Withdraw alert"
                    >
                      <Trash2 size={14} color="#f43f5e" />
                      <Text style={[styles.actionBtnText, { color: '#f43f5e' }]}>Withdraw</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ================= MODAL 1: COMPOSE NEW ALERT ================= */}
      <Modal visible={showComposeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSub}>Emergency Operations</Text>
                <Text style={styles.modalTitle}>Compose Disruption Alert</Text>
              </View>
              <TouchableOpacity onPress={() => setShowComposeModal(false)}>
                <X size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              {/* Presets Row for Fast Admin Response */}
              <Text style={styles.inputLabel}>Quick Incident Presets</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {[
                  { label: '🚧 Road Obstruction', title: 'Major Road Obstruction & Work', route: 'Route 42 Eastbound', sev: 'High' as const, mins: '20', advice: 'Station Road Bypass in effect.' },
                  { label: '⚡ Signal Power Loss', title: 'Intermittent Signal Fault', route: 'Route 18 Express', sev: 'Medium' as const, mins: '15', advice: 'Trains running at reduced speed.' },
                  { label: '🌧️ Heavy Rain Delay', title: 'Monsoon Flash Flood Delay', route: 'Route 105 BRT Corridor', sev: 'High' as const, mins: '25', advice: 'Expect widespread delays.' },
                  { label: '🔧 Bus Breakdown', title: 'Mechanical Vehicle Defect', route: 'Route 42 Westbound', sev: 'Low' as const, mins: '10', advice: 'Backup bus dispatched.' },
                ].map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetChip}
                    onPress={() => applyPreset(preset.title, preset.route, preset.sev, preset.mins, preset.advice)}
                  >
                    <Text style={styles.presetChipText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Incident Reason / Title</Text>
              <TextInput
                style={styles.modalInput}
                value={incidentType}
                onChangeText={setIncidentType}
                placeholder="e.g. Broken Track or Flooding"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Affected Transport Route</Text>
              <View style={styles.segmentedRow}>
                {['Route 42', 'Route 18', 'Route 105'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.segmentBtn, affectedRoute.includes(r) && styles.segmentBtnActive]}
                    onPress={() => setAffectedRoute(`${r} Main Line`)}
                  >
                    <Text style={[styles.segmentBtnText, affectedRoute.includes(r) && styles.segmentBtnTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Severity Level</Text>
                  <View style={styles.segmentedRow}>
                    {(['Medium', 'High', 'Critical'] as const).map((sev) => (
                      <TouchableOpacity
                        key={sev}
                        style={[styles.segmentBtn, severity === sev && styles.segmentBtnActive]}
                        onPress={() => setSeverity(sev)}
                      >
                        <Text style={[styles.segmentBtnText, severity === sev && styles.segmentBtnTextActive]}>{sev}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ width: 90 }}>
                  <Text style={styles.inputLabel}>Delay (+m)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={delayMinutes}
                    onChangeText={setDelayMinutes}
                    keyboardType="numeric"
                    placeholder="15"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Alternative Commuter Advice</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={rerouteText}
                onChangeText={setRerouteText}
                multiline
                numberOfLines={3}
                placeholder="Reroute instructions..."
                placeholderTextColor="#64748b"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowComposeModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleTriggerBroadcastConfirm}>
                <Send size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.confirmBtnText}>Preview & Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 2: TWO-STEP ERROR PREVENTION CONFIRMATION (HCI H5) ================= */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ alignItems: 'center', marginBottom: 14 }}>
              <ShieldAlert size={42} color="#f43f5e" style={{ marginBottom: 10 }} />
              <Text style={styles.modalTitle}>Confirm Broadcast Push?</Text>
              <Text style={styles.modalDesc}>
                HCI Rule (H5 - Error Prevention): Commuter push alerts will immediately display on all passenger and conductor screens.
              </Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryRow}><Text style={{ color: '#94a3b8' }}>Incident:</Text> {incidentType}</Text>
              <Text style={styles.summaryRow}><Text style={{ color: '#94a3b8' }}>Affected Route:</Text> {affectedRoute}</Text>
              <Text style={styles.summaryRow}><Text style={{ color: '#94a3b8' }}>Delay Expected:</Text> +{delayMinutes} minutes</Text>
              <Text style={styles.summaryRow}><Text style={{ color: '#94a3b8' }}>Severity Tier:</Text> <Text style={{ color: '#f43f5e', fontWeight: '800' }}>{severity}</Text></Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.cancelBtnText}>Back to Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#f43f5e' }]} onPress={handleBroadcastConfirmed}>
                <Send size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.confirmBtnText}>Broadcast Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 3: EDIT BROADCAST (UPDATE) ================= */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSub}>Update Active Broadcast</Text>
                <Text style={styles.modalTitle}>Edit #{selectedAlert?.id}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.inputLabel}>Incident Title</Text>
              <TextInput
                style={styles.modalInput}
                value={incidentType}
                onChangeText={setIncidentType}
              />

              <Text style={styles.inputLabel}>Affected Route</Text>
              <TextInput
                style={styles.modalInput}
                value={affectedRoute}
                onChangeText={setAffectedRoute}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Severity Level</Text>
                  <View style={styles.segmentedRow}>
                    {(['Medium', 'High', 'Critical'] as const).map((sev) => (
                      <TouchableOpacity
                        key={sev}
                        style={[styles.segmentBtn, severity === sev && styles.segmentBtnActive]}
                        onPress={() => setSeverity(sev)}
                      >
                        <Text style={[styles.segmentBtnText, severity === sev && styles.segmentBtnTextActive]}>{sev}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ width: 90 }}>
                  <Text style={styles.inputLabel}>Delay (+m)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={delayMinutes}
                    onChangeText={setDelayMinutes}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Reroute Instructions</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={rerouteText}
                onChangeText={setRerouteText}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveEdit}>
                <CheckCircle2 size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.confirmBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 4: WITHDRAW / DELETE ALERT ================= */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: '#f43f5e' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShieldAlert size={22} color="#f43f5e" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: '#f43f5e' }]}>Withdraw Broadcast?</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <X size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#e2e8f0', fontSize: 14, marginVertical: 14, lineHeight: 20 }}>
              Are you sure you want to withdraw <Text style={{ fontWeight: '700', color: '#fff' }}>#{selectedAlert?.id}</Text> ({selectedAlert?.incidentType})?
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 18 }}>
              This alert will be permanently removed from all passenger alert hubs and notification centers.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelBtnText}>Keep Active</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#f43f5e' }]} onPress={handleConfirmDelete}>
                <Trash2 size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.confirmBtnText}>Confirm Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  composeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2942',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#0F2942',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  composeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  refreshIconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  ribbonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ribbonCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  ribbonLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  ribbonVal: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    padding: 0,
  },
  chipScroll: {
    maxHeight: 38,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  chipText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  feedScroll: {
    flex: 1,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  alertCardResolved: {
    opacity: 0.75,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertIdText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  sevBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  sevBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  driverTagPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  driverTagText: {
    color: '#B45309',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  incidentTitleText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusToggleBtnActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECDD3',
  },
  statusToggleBtnResolved: {
    backgroundColor: '#DCFCE7',
    borderColor: '#A7F3D0',
  },
  statusToggleTextActive: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  statusToggleTextResolved: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '500',
  },
  adviceBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  adviceText: {
    color: '#0369A1',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  timestampText: {
    color: '#64748B',
    fontSize: 10,
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySubtext: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: '90%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalSub: {
    fontSize: 11,
    color: '#0284C7',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '800',
    marginTop: 2,
  },
  modalDesc: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },
  presetChip: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  presetChipText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    color: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  segmentBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  segmentBtnTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    color: '#0F172A',
    fontSize: 13,
    marginBottom: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  confirmBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2942',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
