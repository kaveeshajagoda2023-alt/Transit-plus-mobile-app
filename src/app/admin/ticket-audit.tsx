import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Search, AlertOctagon, CheckCircle2, XCircle, Filter, FileText, ChevronRight, X } from 'lucide-react-native';

export default function TicketAuditScreen() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const ticketAudits = [
    { ticketId: '#TK-9824-B01', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Elena Rosiera', scannedAt: '10:42 AM', conductorId: 'CND-77492', status: 'valid', anomalyReason: '' },
    { ticketId: '#TK-9827-C18', passType: 'Metro Rapid Monthly Pass', routeId: 'Route 18', fare: 680.00, passengerName: 'Kasun Wickrama', scannedAt: '10:38 AM', conductorId: 'CND-88201', status: 'valid', anomalyReason: '' },
    { ticketId: '#TK-9830-D42', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Unknown Commuter', scannedAt: '10:25 AM', conductorId: 'CND-77492', status: 'flagged', anomalyReason: 'Outdoor QR Glare / Low Contrast Scan Retry (UI-01)' },
    { ticketId: '#TK-9833-A05', passType: 'Day Pass (All Routes)', routeId: 'Route 105', fare: 250.00, passengerName: 'Dinuka Fernando', scannedAt: '10:15 AM', conductorId: 'CND-30112', status: 'invalid', anomalyReason: 'Expired Pass Timestamp (Expired 12 mins prior)' },
    { ticketId: '#TK-9838-B12', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Unknown Commuter', scannedAt: '09:55 AM', conductorId: 'CND-77492', status: 'flagged', anomalyReason: 'Duplicate Scan Verification Attempt' },
    { ticketId: '#TK-9842-C09', passType: 'Student Transit Pass', routeId: 'Route 18', fare: 40.00, passengerName: 'Saman Kumara', scannedAt: '09:40 AM', conductorId: 'CND-88201', status: 'valid', anomalyReason: '' }
  ];

  const filteredTickets = ticketAudits.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch = t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.anomalyReason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>US09 — Ticket Financial Audit</Text>
        <Text style={styles.headerTitle}>Ticket Audit Hub</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ticket ID, conductor, or anomaly..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Quick Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
        {[
          { id: 'all', label: 'All Transactions' },
          { id: 'flagged', label: '⚠️ Flagged Only' },
          { id: 'invalid', label: '❌ Invalid Scans' },
          { id: 'valid', label: '✓ Valid Scans' }
        ].map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.chip, filterStatus === c.id && styles.chipActive]}
            onPress={() => setFilterStatus(c.id)}
          >
            <Text style={[styles.chipText, filterStatus === c.id && styles.chipTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Vertically Scrollable Feed */}
      <ScrollView style={styles.feedScroll}>
        {filteredTickets.map((t) => (
          <TouchableOpacity
            key={t.ticketId}
            style={[
              styles.ticketCard,
              t.status === 'flagged' ? { borderLeftColor: '#f59e0b' } : t.status === 'invalid' ? { borderLeftColor: '#f43f5e' } : { borderLeftColor: '#10b981' }
            ]}
            onPress={() => setSelectedTicket(t)}
          >
            <View style={styles.ticketCardHeader}>
              <Text style={styles.ticketIdText}>{t.ticketId}</Text>
              <View style={[
                styles.statusBadge,
                t.status === 'flagged' ? { backgroundColor: 'rgba(245, 158, 11, 0.2)' } : t.status === 'invalid' ? { backgroundColor: 'rgba(244, 63, 94, 0.2)' } : { backgroundColor: 'rgba(16, 185, 129, 0.2)' }
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  t.status === 'flagged' ? { color: '#f59e0b' } : t.status === 'invalid' ? { color: '#f43f5e' } : { color: '#10b981' }
                ]}>
                  {t.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.ticketDetailsRow}>
              <Text style={styles.ticketSubtitle}>{t.passType} • {t.routeId}</Text>
              <Text style={styles.ticketFare}>Rs {t.fare.toFixed(2)}</Text>
            </View>

            {t.anomalyReason ? (
              <View style={styles.anomalyBox}>
                <Text style={styles.anomalyText}>⚠️ Anomaly: {t.anomalyReason}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Ticket Detail Modal */}
      <Modal visible={!!selectedTicket} transparent={true} animationType="fade">
        {selectedTicket && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ticket Audit Details</Text>
                <TouchableOpacity onPress={() => setSelectedTicket(null)}>
                  <X size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>Ticket Reference ID</Text>
                <Text style={styles.modalValueHigh}>{selectedTicket.ticketId}</Text>

                <View style={styles.modalDataList}>
                  <Text style={styles.modalDataText}><Text style={{ fontWeight: 'bold' }}>Passenger:</Text> {selectedTicket.passengerName}</Text>
                  <Text style={styles.modalDataText}><Text style={{ fontWeight: 'bold' }}>Route:</Text> {selectedTicket.routeId}</Text>
                  <Text style={styles.modalDataText}><Text style={{ fontWeight: 'bold' }}>Fare Paid:</Text> Rs {selectedTicket.fare.toFixed(2)}</Text>
                  <Text style={styles.modalDataText}><Text style={{ fontWeight: 'bold' }}>Scanned Time:</Text> {selectedTicket.scannedAt}</Text>
                  <Text style={styles.modalDataText}><Text style={{ fontWeight: 'bold' }}>Conductor Staff ID:</Text> {selectedTicket.conductorId}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.modalButton} onPress={() => setSelectedTicket(null)}>
                <Text style={styles.modalButtonText}>Dismiss Audit Window</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
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
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    marginTop: 2,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingLeft: 42,
    paddingRight: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
  },
  chipScroll: {
    maxHeight: 45,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  chip: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  feedScroll: {
    flex: 1,
  },
  ticketCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderLeftWidth: 4,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketIdText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ticketDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  ticketFare: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  anomalyBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  anomalyText: {
    fontSize: 11,
    color: '#f59e0b',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modalBody: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  modalValueHigh: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0ea5e9',
    marginBottom: 16,
    marginTop: 4,
  },
  modalDataList: {
    gap: 8,
  },
  modalDataText: {
    fontSize: 13,
    color: '#e2e8f0',
  },
  modalButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }
});
