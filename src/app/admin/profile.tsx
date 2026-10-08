import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Download, Moon, LogOut, Award } from 'lucide-react-native';

export default function AdminProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // Navigate back to role selection or login
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Member 4 Staff Profile</Text>
        <Text style={styles.headerTitle}>Coordinator Profile</Text>
      </View>

      {/* Staff Identity Card */}
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>KJ</Text>
        </View>

        <Text style={styles.name}>K. K. Jagoda</Text>
        <Text style={styles.studentId}>Student ID: IT23762572 • Group WE_121</Text>

        <View style={styles.roleBadge}>
          <Award size={14} color="#10b981" />
          <Text style={styles.roleBadgeText}>Transport Operations Coordinator (Tier 3)</Text>
        </View>
      </View>

      {/* Settings & System Tools */}
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Shield size={18} color="#0ea5e9" />
            <Text style={styles.settingLabel}>Security Clearance Level</Text>
          </View>
          <Text style={styles.settingValue}>Tier 3 Master</Text>
        </View>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Download size={18} color="#10b981" />
            <Text style={styles.settingLabel}>Export System Audit Logs</Text>
          </View>
          <Text style={[styles.settingValue, { color: '#10b981' }]}>CSV / JSON</Text>
        </TouchableOpacity>

        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={styles.settingLeft}>
            <Moon size={18} color="#f59e0b" />
            <Text style={styles.settingLabel}>OLED Glassmorphism Theme</Text>
          </View>
          <Text style={[styles.settingValue, { color: '#f59e0b' }]}>Dark Mode Active</Text>
        </View>
      </View>

      {/* Sign Out Action */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={18} color="#f43f5e" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>Sign Out of Ops Portal</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
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
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '600',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  roleBadgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  settingsCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 13,
    color: '#fff',
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 12,
    color: '#94a3b8',
  },
  logoutButton: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#f43f5e',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#f43f5e',
    fontSize: 14,
    fontWeight: '600',
  }
});
