import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Download, Sun, LogOut, Award, CheckCircle2, FileSpreadsheet, FileCode, FileText, X } from 'lucide-react-native';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';
import { executeAuditExport, ExportFormat, ExportRange } from '@/services/utils/auditExportService';

export default function AdminProfileScreen() {
  const router = useRouter();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('PDF');
  const [exportRange, setExportRange] = useState<ExportRange>('24h');
  const [isExporting, setIsExporting] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out of Ops Portal',
      'Are you sure you want to exit the Transport Coordinator control hub?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => router.replace('/') },
      ]
    );
  };

  const handleExecuteExport = async () => {
    try {
      setIsExporting(true);
      const result = await executeAuditExport({
        format: exportFormat,
        range: exportRange,
        coordinatorName: 'K. K. Jagoda',
        staffId: 'CDR-8910@transitpulse.gov',
      });
      setIsExporting(false);
      setShowExportModal(false);
      Alert.alert(
        'Audit Report Downloaded',
        `File "${result.filename}" has been generated and saved.\n\n• Location: ${result.filePathNotice}\n\nWould you like to open and view the document in a new browser tab now?`,
        [
          { text: 'Close', style: 'cancel' },
          {
            text: 'Open & View',
            onPress: () => {
              if (result.viewReport) {
                result.viewReport();
              }
            },
          },
        ]
      );
    } catch (err: any) {
      setIsExporting(false);
      Alert.alert('Export Failed', err?.message || 'An error occurred while generating the audit file.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>System Administrator</Text>
        <Text style={styles.headerTitle}>Coordinator Profile</Text>
      </View>

      {/* Staff Identity Card */}
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>KJ</Text>
        </View>

        <Text style={styles.name}>K. K. Jagoda</Text>
        <Text style={styles.studentId}>Official Staff Account • TransitPulse Ops</Text>

        <View style={styles.roleBadge}>
          <Award size={14} color="#059669" />
          <Text style={styles.roleBadgeText}>Transport Operations Coordinator (Tier 3)</Text>
        </View>
      </View>

      {/* Settings & System Tools */}
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Shield size={18} color="#0284C7" />
            <Text style={styles.settingLabel}>Security Clearance Level</Text>
          </View>
          <Text style={styles.settingValue}>Tier 3 Master</Text>
        </View>

        {/* Functional Export Audit Logs Row */}
        <TouchableOpacity 
          style={styles.settingRow} 
          onPress={() => setShowExportModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Download size={18} color="#059669" />
            <Text style={styles.settingLabel}>Export System Audit Logs</Text>
          </View>
          <View style={styles.exportTagPill}>
            <Text style={styles.exportTagText}>PDF / CSV</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={styles.settingLeft}>
            <Sun size={18} color="#D97706" />
            <Text style={styles.settingLabel}>Transit App Palette</Text>
          </View>
          <Text style={[styles.settingValue, { color: '#059669', fontWeight: '700' }]}>Light Theme Active</Text>
        </View>
      </View>

      {/* Sign Out Action */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <LogOut size={18} color="#DC2626" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>Sign Out of Ops Portal</Text>
      </TouchableOpacity>

      {/* EXPORT AUDIT LOGS MODAL */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSub}>Member 4 • Reporting Tool</Text>
                <Text style={styles.modalTitle}>Export Audit Telemetry</Text>
              </View>
              <TouchableOpacity onPress={() => setShowExportModal(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>1. CHOOSE FORMAT</Text>
            <View style={styles.formatRow}>
              <TouchableOpacity
                style={[styles.formatBtn, exportFormat === 'PDF' && styles.formatBtnActive]}
                onPress={() => setExportFormat('PDF')}
              >
                <FileText size={16} color={exportFormat === 'PDF' ? '#FFFFFF' : '#0F2942'} />
                <Text style={[styles.formatBtnText, exportFormat === 'PDF' && styles.formatBtnTextActive]}>
                  PDF Report
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formatBtn, exportFormat === 'CSV' && styles.formatBtnActive]}
                onPress={() => setExportFormat('CSV')}
              >
                <FileSpreadsheet size={16} color={exportFormat === 'CSV' ? '#FFFFFF' : '#0F2942'} />
                <Text style={[styles.formatBtnText, exportFormat === 'CSV' && styles.formatBtnTextActive]}>
                  CSV Data
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formatBtn, exportFormat === 'JSON' && styles.formatBtnActive]}
                onPress={() => setExportFormat('JSON')}
              >
                <FileCode size={16} color={exportFormat === 'JSON' ? '#FFFFFF' : '#0F2942'} />
                <Text style={[styles.formatBtnText, exportFormat === 'JSON' && styles.formatBtnTextActive]}>
                  Raw JSON
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>2. TIME RANGE</Text>
            <View style={styles.rangeRow}>
              {[
                { id: '24h', label: 'Last 24 Hours' },
                { id: '7d', label: 'Past 7 Days' },
                { id: 'all', label: 'Complete History' },
              ].map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.rangeBtn, exportRange === r.id && styles.rangeBtnActive]}
                  onPress={() => setExportRange(r.id as any)}
                >
                  <Text style={[styles.rangeBtnText, exportRange === r.id && styles.rangeBtnTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.exportMetaBox}>
              <Text style={styles.exportMetaTitle}>Included Telemetry Streams:</Text>
              <Text style={styles.exportMetaItem}>• Active Fleet Inventory & Maintenance Logs (CRUD 1)</Text>
              <Text style={styles.exportMetaItem}>• Disruption Alerts & Broadcast Events (CRUD 2)</Text>
              <Text style={styles.exportMetaItem}>• Conductor Ticket Scans & Flagged Anomalies</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setShowExportModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.exportConfirmBtn} 
                onPress={handleExecuteExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Download size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.exportConfirmBtnText}>Generate & Download</Text>
                  </>
                )}
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
    padding: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 12,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0F2942',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#0F2942',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  name: {
    fontSize: 19,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  roleBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  exportTagPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  exportTagText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.floating,
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
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '800',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 6,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  formatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  formatBtnActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  formatBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2942',
    marginLeft: 4,
  },
  formatBtnTextActive: {
    color: '#FFFFFF',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  rangeBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 8,
  },
  rangeBtnActive: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  rangeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  rangeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  exportMetaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 18,
  },
  exportMetaTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  exportMetaItem: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  exportConfirmBtn: {
    flex: 1.6,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2942',
  },
  exportConfirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
