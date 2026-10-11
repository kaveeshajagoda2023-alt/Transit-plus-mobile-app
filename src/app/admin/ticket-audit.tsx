import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { Search, AlertOctagon, CheckCircle2, XCircle, Filter, FileText, ChevronRight, X } from 'lucide-react-native';

export default function TicketAuditScreen() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

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
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  header: {
    marginBottom: 14,
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '800',
    marginTop: 2,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingLeft: 42,
    paddingRight: 16,
    paddingVertical: 10,
    color: '#0F172A',
    fontSize: 13.5,
  },
  chipScroll: {
    maxHeight: 42,
    marginBottom: 14,
  },
  chipRow: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  chipText: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  feedScroll: {
    flex: 1,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketIdText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingVertical: 3,
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
    color: '#64748B',
    fontWeight: '500',
  },
  ticketFare: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  anomalyBox: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  anomalyText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalValueHigh: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2942',
    marginBottom: 14,
    marginTop: 4,
  },
  modalDataList: {
    gap: 8,
  },
  modalDataText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  modalButton: {
    backgroundColor: '#0F2942',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
