import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { AlertTriangle, Send, ShieldAlert } from 'lucide-react-native';

export default function DisruptionAlertScreen() {
  const [incidentType, setIncidentType] = useState('Major Track Maintenance & Road Obstruction');
  const [affectedRoute, setAffectedRoute] = useState('Route 42 Eastbound (Central to University)');
  const [severity, setSeverity] = useState('High');
  const [delayMinutes, setDelayMinutes] = useState('15');
  const [rerouteText, setRerouteText] = useState('Reroute via Station Road Bypass. Expect 15-min delay.');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 'ALT-1092',
      incidentType: 'Major Track Maintenance & Water Main Burst',
      affectedRoute: 'Route 42 Eastbound (Central to University)',
      delayMinutes: 15,
      severity: 'High',
      broadcastAt: '10:15 AM'
    }
  ]);

  const handleBroadcastConfirmed = () => {
    const newAlert = {
      id: 'ALT-' + Math.floor(1000 + Math.random() * 9000),
      incidentType,
      affectedRoute,
      delayMinutes: parseInt(delayMinutes),
      severity,
      broadcastAt: 'Just Now'
    };
    setActiveAlerts([newAlert, ...activeAlerts]);
    setShowConfirmModal(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>FR6, FR7, FR8 — Emergency Operations</Text>
        <Text style={styles.headerTitle}>Disruption Alert Composer</Text>
      </View>

      {/* Emergency Incident Form */}
      <View style={styles.formCard}>
        <View style={styles.formHeaderRow}>
          <AlertTriangle size={18} color="#f43f5e" />
          <Text style={styles.formHeaderText}>Compose System Push Notification</Text>
        </View>

        <Text style={styles.label}>Incident Title / Reason</Text>
        <TextInput
          style={styles.input}
          value={incidentType}
          onChangeText={setIncidentType}
          placeholder="Enter incident title..."
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Affected Transport Route</Text>
        <TextInput
          style={styles.input}
          value={affectedRoute}
          onChangeText={setAffectedRoute}
          placeholder="e.g. Route 42 Eastbound"
          placeholderTextColor="#64748b"
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Severity Level</Text>
            <TextInput
              style={styles.input}
              value={severity}
              onChangeText={setSeverity}
              placeholder="Low, Medium, High"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={styles.flex1}>
            <Text style={styles.label}>Delay (+mins)</Text>
            <TextInput
              style={styles.input}
              value={delayMinutes}
              onChangeText={setDelayMinutes}
              keyboardType="number-pad"
              placeholder="e.g. 15"
              placeholderTextColor="#64748b"
            />
          </View>
        </View>

        <Text style={styles.label}>Alternative Reroute Instructions</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={rerouteText}
          onChangeText={setRerouteText}
          multiline
          numberOfLines={3}
          placeholder="Enter instructions..."
          placeholderTextColor="#64748b"
        />

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={() => setShowConfirmModal(true)}
        >
          <Send size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.submitButtonText}>Broadcast System Disruption Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Active Broadcasts Feed */}
      <View style={styles.alertsContainer}>
        <Text style={styles.alertsTitle}>Active Broadcasted Alerts ({activeAlerts.length})</Text>

        {activeAlerts.map((a) => (
          <View key={a.id} style={styles.alertCard}>
            <View style={styles.alertCardHeader}>
              <Text style={styles.alertCardTitle}>{a.id} • {a.incidentType}</Text>
              <Text style={styles.alertCardTime}>{a.broadcastAt}</Text>
            </View>
            <Text style={styles.alertCardDesc}>
              Route: {a.affectedRoute} (+{a.delayMinutes} mins delay)
            </Text>
          </View>
        ))}
      </View>

      {/* Two-Step Error Prevention Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderCenter}>
              <ShieldAlert size={44} color="#f43f5e" style={{ marginBottom: 12 }} />
              <Text style={styles.modalTitle}>Confirm Push Broadcast?</Text>
              <Text style={styles.modalDesc}>
                HCI Error Prevention (H5): Please verify broadcast parameters before dispatching push notifications to all commuters.
              </Text>
            </View>

            <View style={styles.modalDataBox}>
              <Text style={styles.modalDataRow}><Text style={{ fontWeight: 'bold' }}>Incident:</Text> {incidentType}</Text>
              <Text style={styles.modalDataRow}><Text style={{ fontWeight: 'bold' }}>Route:</Text> {affectedRoute}</Text>
              <Text style={styles.modalDataRow}><Text style={{ fontWeight: 'bold' }}>Expected Delay:</Text> +{delayMinutes} minutes</Text>
              <Text style={styles.modalDataRow}><Text style={{ fontWeight: 'bold' }}>Severity:</Text> <Text style={{ color: '#f43f5e', fontWeight: 'bold' }}>{severity}</Text></Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleBroadcastConfirmed}>
                <Text style={styles.confirmBtnText}>Yes, Broadcast</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
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
    marginTop: 40,
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formHeaderText: {
    color: '#f43f5e',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#e11d48',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  alertsContainer: {
    marginTop: 24,
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  alertCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f43f5e',
    flex: 1,
  },
  alertCardTime: {
    fontSize: 10,
    color: '#94a3b8',
    marginLeft: 12,
  },
  alertCardDesc: {
    fontSize: 12,
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderCenter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  modalDataBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  modalDataRow: {
    fontSize: 13,
    color: '#e2e8f0',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#f43f5e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }
});
