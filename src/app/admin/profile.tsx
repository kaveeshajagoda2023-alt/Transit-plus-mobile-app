import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Download, Sun, LogOut, Award, CheckCircle2, FileSpreadsheet, FileCode, FileText, X, Eye, Share2 } from 'lucide-react-native';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';
import {
  executeAuditExport,
  ExportFormat,
  ExportRange,
  ExportResult,
  FLEET_SNAPSHOT,
  ALERTS_SNAPSHOT,
  SCANS_SNAPSHOT,
  getRangeLabel,
} from '@/services/utils/auditExportService';

export default function AdminProfileScreen() {
  const router = useRouter();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('PDF');
  const [exportRange, setExportRange] = useState<ExportRange>('24h');
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportResult, setLastExportResult] = useState<ExportResult | null>(null);

  const handleLogout = () => {
    setShowLogoutModal(true);
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
      setLastExportResult(result);

      Alert.alert(
        'Audit Report Ready',
        `File "${result.filename}" has been generated successfully.\n\n• Location: ${result.filePathNotice}\n\nYou can view the formatted report on-screen, or save/share the document on your device.`,
        [
          { text: 'Done', style: 'cancel' },
          {
            text: 'Preview Report',
            onPress: () => {
              setShowPreviewModal(true);
            },
          },
          {
            text: 'Share / Save',
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

  const handleShareFromPreview = async () => {
    if (lastExportResult?.viewReport) {
      lastExportResult.viewReport();
      return;
    }
    try {
      setIsExporting(true);
      const result = await executeAuditExport({
        format: exportFormat,
        range: exportRange,
        coordinatorName: 'K. K. Jagoda',
        staffId: 'CDR-8910@transitpulse.gov',
      });
      setIsExporting(false);
      setLastExportResult(result);
      if (result.viewReport) {
        result.viewReport();
      }
    } catch (err: any) {
      setIsExporting(false);
      Alert.alert('Sharing Error', err?.message || 'Could not trigger native share sheet.');
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
                style={styles.previewBtn} 
                onPress={() => {
                  setShowExportModal(false);
                  setShowPreviewModal(true);
                }}
              >
                <Eye size={15} color="#0F2942" style={{ marginRight: 4 }} />
                <Text style={styles.previewBtnText}>Preview</Text>
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
                    <Download size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.exportConfirmBtnText}>Download</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* IN-APP AUDIT REPORT PREVIEW MODAL */}
      <Modal
        visible={showPreviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.previewContainer}>
          {/* Header Bar */}
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewHeaderSub}>Official Telemetry Document</Text>
              <Text style={styles.previewHeaderTitle}>System Audit Report</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                style={styles.previewShareBtn}
                onPress={handleShareFromPreview}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Share2 size={15} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.previewShareBtnText}>Share / Save</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowPreviewModal(false)}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Document Content */}
          <ScrollView
            style={styles.previewScroll}
            contentContainerStyle={styles.previewScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Banner */}
            <View style={styles.docBanner}>
              <Text style={styles.docBannerTitle}>TRANSITPLUS OPERATIONS ADMINISTRATION</Text>
              <Text style={styles.docBannerSub}>OFFICIAL SYSTEM AUDIT & FLEET TELEMETRY REPORT (TIER 3)</Text>
            </View>

            {/* Meta Grid */}
            <View style={styles.docMetaCard}>
              <View style={styles.docMetaRow}>
                <View style={styles.docMetaItem}>
                  <Text style={styles.docMetaLabel}>ISSUED BY</Text>
                  <Text style={styles.docMetaVal}>K. K. Jagoda (Coordinator)</Text>
                </View>
                <View style={styles.docMetaItem}>
                  <Text style={styles.docMetaLabel}>AUDIT WINDOW</Text>
                  <Text style={styles.docMetaVal}>{getRangeLabel(exportRange)}</Text>
                </View>
              </View>
              <View style={styles.docMetaRow}>
                <View style={styles.docMetaItem}>
                  <Text style={styles.docMetaLabel}>SECURITY CLEARANCE</Text>
                  <Text style={styles.docMetaVal}>Tier 3 Master Clearance</Text>
                </View>
                <View style={styles.docMetaItem}>
                  <Text style={styles.docMetaLabel}>ENCRYPTION</Text>
                  <Text style={styles.docMetaVal}>HMAC-SHA256 Multi-Node</Text>
                </View>
              </View>
            </View>

            {/* KPI Cards */}
            <View style={styles.docKpiGrid}>
              <View style={[styles.docKpiCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                <Text style={styles.docKpiLabel}>FLEET UNITS</Text>
                <Text style={[styles.docKpiVal, { color: '#0284C7' }]}>18 ACTIVE</Text>
              </View>
              <View style={[styles.docKpiCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                <Text style={styles.docKpiLabel}>OPERATIONAL</Text>
                <Text style={[styles.docKpiVal, { color: '#059669' }]}>94.8% RATE</Text>
              </View>
              <View style={[styles.docKpiCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                <Text style={styles.docKpiLabel}>TICKET SCANS</Text>
                <Text style={[styles.docKpiVal, { color: '#D97706' }]}>246 SCANS</Text>
              </View>
              <View style={[styles.docKpiCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <Text style={styles.docKpiLabel}>ALERTS</Text>
                <Text style={[styles.docKpiVal, { color: '#DC2626' }]}>1 ADVISORY</Text>
              </View>
            </View>

            {/* Section 1: Fleet Inventory */}
            <Text style={styles.docSectionTitle}>1. FLEET TELEMETRY & ASSET STATUS</Text>
            <View style={styles.docTableCard}>
              {FLEET_SNAPSHOT.map((row, idx) => (
                <View key={row.id} style={[styles.docTableRow, idx % 2 === 1 && styles.docTableRowAlt]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docTableRowTitle}>{row.id} • {row.route}</Text>
                    <Text style={styles.docTableRowSub}>Operator: {row.driver} | Capacity: {row.load}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.docStatusBadge, row.status === 'Delayed' ? styles.statusDelayed : styles.statusActive]}>
                      {row.status}
                    </Text>
                    <Text style={styles.docHealthText}>Health: {row.health}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Section 2: Active Disruption Alerts */}
            <Text style={styles.docSectionTitle}>2. ACTIVE DISRUPTION BROADCASTS</Text>
            <View style={styles.docTableCard}>
              {ALERTS_SNAPSHOT.map((alert) => (
                <View key={alert.code} style={styles.docTableRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docTableRowTitle}>{alert.code} • {alert.route}</Text>
                    <Text style={styles.docTableRowSub}>{alert.message}</Text>
                  </View>
                  <Text style={[styles.docStatusBadge, alert.severity === 'Moderate' ? styles.statusDelayed : styles.statusActive]}>
                    {alert.severity}
                  </Text>
                </View>
              ))}
            </View>

            {/* Section 3: Conductor Ticket Scans */}
            <Text style={styles.docSectionTitle}>3. TICKET SCANS & CRYPTOGRAPHIC VERIFICATION</Text>
            <View style={styles.docTableCard}>
              {SCANS_SNAPSHOT.map((scan) => (
                <View key={scan.ticket} style={styles.docTableRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docTableRowTitle}>{scan.ticket} • {scan.passenger}</Text>
                    <Text style={styles.docTableRowSub}>{scan.scanner}</Text>
                    <Text style={styles.docHmacText}>HMAC: {scan.hmac}</Text>
                  </View>
                  <Text style={[styles.docStatusBadge, scan.result.includes('VALID') ? styles.statusActive : styles.statusFlagged]}>
                    {scan.result}
                  </Text>
                </View>
              ))}
            </View>

            {/* Footer Notice */}
            <View style={styles.docFooter}>
              <Shield size={16} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.docFooterText}>
                Cryptographically certified by TransitPlus Core Telemetry Engine • Tier 3 Verified
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* SIGN OUT CONFIRMATION MODAL */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.logoutModalCard]}>
            <View style={styles.logoutIconCircle}>
              <LogOut size={26} color="#DC2626" />
            </View>
            <Text style={styles.logoutModalTitle}>Sign Out of Ops Portal</Text>
            <Text style={styles.logoutModalDesc}>
              Are you sure you want to exit your administrative session? You can return anytime with coordinator credentials.
            </Text>

            <TouchableOpacity
              style={styles.logoutConfirmBtn}
              onPress={() => {
                setShowLogoutModal(false);
                router.replace('/admin/login');
              }}
              activeOpacity={0.8}
            >
              <LogOut size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.logoutConfirmBtnText}>Sign Out to Admin Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutSecondaryBtn}
              onPress={() => {
                setShowLogoutModal(false);
                router.replace('/role-selection');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutSecondaryBtnText}>Switch Role / Main Portal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutCancelBtn}
              onPress={() => setShowLogoutModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutCancelBtnText}>Cancel & Stay Signed In</Text>
            </TouchableOpacity>
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
  previewBtn: {
    flex: 1.1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  previewBtnText: {
    color: '#0F2942',
    fontWeight: '700',
    fontSize: 13,
  },
  exportConfirmBtn: {
    flex: 1.4,
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
  /* LOGOUT MODAL STYLES */
  logoutModalCard: {
    maxWidth: 380,
    padding: 24,
    alignItems: 'center',
    borderRadius: 20,
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoutModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  logoutModalDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  logoutConfirmBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 10,
    ...TransitShadows.card,
  },
  logoutConfirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  logoutSecondaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  logoutSecondaryBtnText: {
    color: '#0F2942',
    fontWeight: '700',
    fontSize: 13,
  },
  logoutCancelBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  logoutCancelBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  /* PREVIEW MODAL STYLES */
  previewContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  previewHeaderSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  previewHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2942',
  },
  previewShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2942',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  previewShareBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  previewScroll: {
    flex: 1,
  },
  previewScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  docBanner: {
    backgroundColor: '#0F2942',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  docBannerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13.5,
    letterSpacing: 0.4,
  },
  docBannerSub: {
    color: '#93C5FD',
    fontWeight: '600',
    fontSize: 10,
    marginTop: 4,
  },
  docMetaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  docMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  docMetaItem: {
    flex: 1,
  },
  docMetaLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  docMetaVal: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  docKpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  docKpiCard: {
    flex: 1,
    padding: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  docKpiLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
  },
  docKpiVal: {
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 3,
  },
  docSectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F2942',
    marginBottom: 8,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  docTableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  docTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  docTableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  docTableRowTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  docTableRowSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  docHmacText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  docStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 9.5,
    fontWeight: '700',
    overflow: 'hidden',
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  statusDelayed: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
  },
  statusFlagged: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
  docHealthText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    marginTop: 3,
  },
  docFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginTop: 6,
  },
  docFooterText: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
});
