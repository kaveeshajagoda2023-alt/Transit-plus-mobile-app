import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { Search, AlertOctagon, CheckCircle2, XCircle, Filter, FileText, ChevronRight, X, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { getAdminApiUrl } from '@/services/utils/adminApiUrl';

export interface TicketAuditItem {
  ticketId: string;
  passType: string;
  routeId: string;
  fare: number;
  passengerName: string;
  scannedAt: string;
  conductorId: string;
  status: 'valid' | 'flagged' | 'invalid';
  anomalyReason: string;
}

const INITIAL_TICKET_AUDITS: TicketAuditItem[] = [
  { ticketId: '#TK-9824-B01', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Elena Rosiera', scannedAt: '10:42 AM', conductorId: 'CND-77492', status: 'valid', anomalyReason: '' },
  { ticketId: '#TK-9827-C18', passType: 'Metro Rapid Monthly Pass', routeId: 'Route 18', fare: 680.00, passengerName: 'Kasun Wickrama', scannedAt: '10:38 AM', conductorId: 'CND-88201', status: 'valid', anomalyReason: '' },
  { ticketId: '#TK-9830-D42', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Unknown Commuter', scannedAt: '10:25 AM', conductorId: 'CND-77492', status: 'flagged', anomalyReason: 'Outdoor QR Glare / Low Contrast Scan Retry (UI-01)' },
  { ticketId: '#TK-9833-A05', passType: 'Day Pass (All Routes)', routeId: 'Route 105', fare: 250.00, passengerName: 'Dinuka Fernando', scannedAt: '10:15 AM', conductorId: 'CND-30112', status: 'invalid', anomalyReason: 'Expired Pass Timestamp (Expired 12 mins prior)' },
  { ticketId: '#TK-9838-B12', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Unknown Commuter', scannedAt: '09:55 AM', conductorId: 'CND-77492', status: 'flagged', anomalyReason: 'Duplicate Scan Verification Attempt' },
  { ticketId: '#TK-9842-C09', passType: 'Student Transit Pass', routeId: 'Route 18', fare: 40.00, passengerName: 'Saman Kumara', scannedAt: '09:40 AM', conductorId: 'CND-88201', status: 'valid', anomalyReason: '' },
];

export default function TicketAuditScreen() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketAuditItem | null>(null);
  const [tickets, setTickets] = useState<TicketAuditItem[]>(INITIAL_TICKET_AUDITS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(getAdminApiUrl('/api/admin/audit/tickets'));
      if (res.ok) {
        const data = await res.json();
        if (data?.tickets && Array.isArray(data.tickets) && data.tickets.length > 0) {
          const formatted: TicketAuditItem[] = data.tickets.map((t: any) => ({
            ticketId: t.ticketId || '#TK-0000',
            passType: t.passType || 'Single Journey Pass',
            routeId: t.routeId || 'Route 42',
            fare: typeof t.fare === 'number' ? t.fare : 65.0,
            passengerName: t.passengerName || 'Commuter',
            scannedAt: t.scannedAt
              ? typeof t.scannedAt === 'string' && (t.scannedAt.includes('AM') || t.scannedAt.includes('PM'))
                ? t.scannedAt
                : new Date(t.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Just Now',
            conductorId: t.conductorId || 'CND-AUTO',
            status: t.status || 'valid',
            anomalyReason: t.anomalyReason || '',
          }));
          setTickets(formatted);
        }
      }
    } catch {
      // Offline fallback: keep local tickets
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateTicketStatus = async (
    targetId: string,
    newStatus: 'valid' | 'flagged' | 'invalid',
    note?: string
  ) => {
    const updatedList = tickets.map((t) =>
      t.ticketId === targetId
        ? { ...t, status: newStatus, anomalyReason: note ?? t.anomalyReason }
        : t
    );
    setTickets(updatedList);
    if (selectedTicket && selectedTicket.ticketId === targetId) {
      setSelectedTicket({
        ...selectedTicket,
        status: newStatus,
        anomalyReason: note ?? selectedTicket.anomalyReason,
      });
    }

    Alert.alert(
      'Audit Decision Saved',
      `Ticket ${targetId} marked as ${newStatus.toUpperCase()}.${note ? `\n\nAudit Reason: ${note}` : ''}`
    );

    try {
      await fetch(getAdminApiUrl('/api/admin/audit/tickets/action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: targetId, status: newStatus, anomalyReason: note }),
      });
    } catch {}
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch =
      t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.anomalyReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.conductorId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSubtitle}>US09 — Ticket Financial Audit</Text>
          <Text style={styles.headerTitle}>Ticket Audit Hub</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={fetchTickets}
          disabled={isRefreshing}
          activeOpacity={0.7}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#0F2942" />
          ) : (
            <RefreshCw size={18} color="#0F2942" />
          )}
        </TouchableOpacity>
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
          { id: 'valid', label: '✓ Valid Scans' },
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
      <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false}>
        {filteredTickets.map((t) => (
          <TouchableOpacity
            key={t.ticketId}
            style={[
              styles.ticketCard,
              t.status === 'flagged' ? { borderLeftColor: '#f59e0b' } : t.status === 'invalid' ? { borderLeftColor: '#f43f5e' } : { borderLeftColor: '#10b981' },
            ]}
            onPress={() => setSelectedTicket(t)}
            activeOpacity={0.8}
          >
            <View style={styles.ticketCardHeader}>
              <Text style={styles.ticketIdText}>{t.ticketId}</Text>
              <View
                style={[
                  styles.statusBadge,
                  t.status === 'flagged'
                    ? { backgroundColor: 'rgba(245, 158, 11, 0.2)' }
                    : t.status === 'invalid'
                    ? { backgroundColor: 'rgba(244, 63, 94, 0.2)' }
                    : { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    t.status === 'flagged' ? { color: '#f59e0b' } : t.status === 'invalid' ? { color: '#f43f5e' } : { color: '#10b981' },
                  ]}
                >
                  {t.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.ticketDetailsRow}>
              <Text style={styles.ticketSubtitle}>{t.passType} • {t.routeId}</Text>
              <Text style={styles.ticketFare}>Rs {t.fare.toFixed(2)}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: '#64748B' }}>Operator: {t.conductorId}</Text>
              <Text style={{ fontSize: 11, color: '#64748B' }}>Scanned: {t.scannedAt}</Text>
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

      {/* Ticket Detail Modal with Live Audit Decisions */}
      <Modal visible={!!selectedTicket} transparent={true} animationType="fade">
        {selectedTicket && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxWidth: 440 }]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={{ fontSize: 11, color: '#0284C7', fontWeight: '700' }}>AUDIT VERIFICATION</Text>
                  <Text style={styles.modalTitle}>Scan Inspection</Text>
                </View>
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
                  <Text style={styles.modalDataText}>
                    <Text style={{ fontWeight: 'bold' }}>Status:</Text>{' '}
                    <Text style={{ color: selectedTicket.status === 'valid' ? '#059669' : selectedTicket.status === 'flagged' ? '#D97706' : '#DC2626', fontWeight: '700' }}>
                      {selectedTicket.status.toUpperCase()}
                    </Text>
                  </Text>
                </View>

                {selectedTicket.anomalyReason ? (
                  <View style={[styles.anomalyBox, { marginVertical: 8 }]}>
                    <Text style={styles.anomalyText}>⚠️ Anomaly: {selectedTicket.anomalyReason}</Text>
                  </View>
                ) : null}

                {/* Audit Action Decisions */}
                <Text style={[styles.modalLabel, { marginTop: 10, marginBottom: 6 }]}>ADMIN AUDIT ACTIONS:</Text>
                <View style={{ gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.auditActionBtn, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}
                    onPress={() => handleUpdateTicketStatus(selectedTicket.ticketId, 'valid', 'Manually validated by Coordinator')}
                  >
                    <CheckCircle2 size={16} color="#15803D" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#15803D', fontWeight: '700', fontSize: 12 }}>Validate & Clear Anomaly</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.auditActionBtn, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
                    onPress={() => handleUpdateTicketStatus(selectedTicket.ticketId, 'flagged', 'Flagged for Conductor Handheld Investigation')}
                  >
                    <AlertTriangle size={16} color="#B45309" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#B45309', fontWeight: '700', fontSize: 12 }}>Flag for Route Investigation</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.auditActionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}
                    onPress={() => handleUpdateTicketStatus(selectedTicket.ticketId, 'invalid', 'Invalidated: Counterfeit / Expired Pass')}
                  >
                    <XCircle size={16} color="#DC2626" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 12 }}>Mark as Fraudulent / Invalid</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={[styles.modalButton, { marginTop: 12 }]} onPress={() => setSelectedTicket(null)}>
                <Text style={styles.modalButtonText}>Close Inspector</Text>
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
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  auditActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
});
