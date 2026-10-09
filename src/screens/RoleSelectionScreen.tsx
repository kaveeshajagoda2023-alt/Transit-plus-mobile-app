import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RoleCard } from '@/components/auth/RoleCard';
import { PortalRole } from '@/types/auth';
import { usePassengerAuth } from '@/context/PassengerAuthContext';

export function RoleSelectionScreen() {
  const [selectedRole, setSelectedRoleState] = useState<PortalRole>('PASSENGER');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PASSENGER' | 'DRIVER' | 'ADMIN'>('ALL');
  const { setSelectedRole } = usePassengerAuth();

  const handleSelectRole = async (role: PortalRole) => {
    setSelectedRoleState(role);
    await setSelectedRole(role);
  };

  const handleProceed = async (roleOverride?: PortalRole) => {
    const role = roleOverride || selectedRole;
    await setSelectedRole(role);

    if (role === 'PASSENGER') {
      router.push('/passenger/login' as any);
    } else if (role === 'DRIVER') {
      router.push('/staff/login' as any);
    } else if (role === 'ADMIN') {
      router.push('/admin/login' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="menu" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.brandRow}>
          <MaterialCommunityIcons name="bus-clock" size={20} color="#0D9488" />
          <Text style={styles.brandTitle}>TransitPulse</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/passenger/home' as any)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="search" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Feather name="lock" size={12} color="#0D9488" />
          <Text style={styles.securityBadgeText}>SECURE AUTHORIZATION</Text>
        </View>

        {/* Heading & Subtitle */}
        <Text style={styles.heading}>Select Portal Access Role</Text>
        <Text style={styles.subtitle}>Choose your account type to continue to your authorized portal</Text>

        {/* Filter Tab Chips */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabChip, filterTab === 'ALL' && styles.tabChipActive]}
            onPress={() => setFilterTab('ALL')}
          >
            <Text style={[styles.tabChipText, filterTab === 'ALL' && styles.tabChipTextActive]}>
              All Roles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, filterTab === 'PASSENGER' && styles.tabChipActive]}
            onPress={() => setFilterTab('PASSENGER')}
          >
            <Feather
              name="user"
              size={12}
              color={filterTab === 'PASSENGER' ? '#0F2942' : '#64748B'}
            />
            <Text style={[styles.tabChipText, filterTab === 'PASSENGER' && styles.tabChipTextActive]}>
              Passenger
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, filterTab === 'DRIVER' && styles.tabChipActive]}
            onPress={() => setFilterTab('DRIVER')}
          >
            <MaterialCommunityIcons
              name="steering"
              size={13}
              color={filterTab === 'DRIVER' ? '#0F2942' : '#64748B'}
            />
            <Text style={[styles.tabChipText, filterTab === 'DRIVER' && styles.tabChipTextActive]}>
              Driver/Crew
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, filterTab === 'ADMIN' && styles.tabChipActive]}
            onPress={() => setFilterTab('ADMIN')}
          >
            <Feather
              name="shield"
              size={12}
              color={filterTab === 'ADMIN' ? '#0F2942' : '#64748B'}
            />
            <Text style={[styles.tabChipText, filterTab === 'ADMIN' && styles.tabChipTextActive]}>
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. Passenger Card */}
        {(filterTab === 'ALL' || filterTab === 'PASSENGER') && (
          <RoleCard
            role="PASSENGER"
            title="Passenger"
            badgeTag="Commuter"
            badgeTagColor="#0D9488"
            description="Digital tickets, live bus/train tracking & trip planning."
            subBadgeText="Instant QR Boarding"
            actionText="Login as Passenger"
            iconName="person"
            iconType="ionicons"
            iconBgColor="#F0FDFA"
            iconColor="#0D9488"
            isSelected={selectedRole === 'PASSENGER'}
            onSelect={() => handleSelectRole('PASSENGER')}
            onActionPress={() => handleProceed('PASSENGER')}
          />
        )}

        {/* 2. Driver / Operator Card */}
        {(filterTab === 'ALL' || filterTab === 'DRIVER') && (
          <RoleCard
            role="DRIVER"
            title="Driver / Conductor"
            badgeTag="Onboard Crew"
            badgeTagColor="#2563EB"
            description="(QR ticket validation scanner 2/200), passenger counter & shift telemetry."
            subBadgeText="Hardware Ready"
            actionText="Login as Driver / Crew"
            iconName="steering"
            iconType="material"
            iconBgColor="#EFF6FF"
            iconColor="#2563EB"
            isSelected={selectedRole === 'DRIVER'}
            onSelect={() => handleSelectRole('DRIVER')}
            onActionPress={() => handleProceed('DRIVER')}
          />
        )}

        {/* 3. Administrator Card */}
        {(filterTab === 'ALL' || filterTab === 'ADMIN') && (
          <RoleCard
            role="ADMIN"
            title="Administrator"
            badgeTag="Dispatch Ops"
            badgeTagColor="#EA580C"
            description="Live fleet oversight (12/100), ticket fraud audit ($1520) & disruption alerts."
            subBadgeText="FPG 900 System"
            actionText="Login as Administrator"
            iconName="server"
            iconType="feather"
            iconBgColor="#FFF7ED"
            iconColor="#EA580C"
            isSelected={selectedRole === 'ADMIN'}
            onSelect={() => handleSelectRole('ADMIN')}
            onActionPress={() => handleProceed('ADMIN')}
          />
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => handleProceed()}
          activeOpacity={0.88}
        >
          <Text style={styles.continueButtonText}>
            Continue as {selectedRole === 'PASSENGER' ? 'Passenger' : selectedRole === 'DRIVER' ? 'Driver / Crew' : 'Administrator'}
          </Text>
          <Feather name="arrow-right" size={17} color="#FFFFFF" style={styles.continueArrow} />
        </TouchableOpacity>

        {/* MTA Security Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoTopRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="shield-checkmark" size={16} color="#0D9488" />
              <Text style={styles.infoTitle}>MTA Federated Identity Security Active</Text>
            </View>
            <View style={styles.tlsBadge}>
              <Text style={styles.tlsText}>TLS 1.3</Text>
            </View>
          </View>
          <Text style={styles.uptimeText}>Subway Operations: 99.98% uptime</Text>
          <Text style={styles.mtaAgencyText}>
            Metropolitan Transit Authority — Unified Auth Gateway v4.8 — FIPS-140-2 Validated
          </Text>
        </View>

        {/* Bottom Support Links */}
        <View style={styles.footerLinksRow}>
          <TouchableOpacity
            onPress={() => Alert.alert('Operator Support', 'Direct radio/dispatch line: 1-800-TRANSIT-OPS')}
          >
            <Text style={styles.footerLink}>Operator Support</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Station Emergency', 'Emergency speed-dial 2941 activated.')}
          >
            <Text style={styles.footerLink}>Station Emergency (2941)</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Security Policy', 'Data secured with end-to-end 256-bit encryption.')
            }
          >
            <Text style={styles.footerLink}>Security Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  securityBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.6,
  },
  heading: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0F2942',
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabChipTextActive: {
    color: '#0F2942',
    fontWeight: '700',
  },
  continueButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#0B2545',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
    shadowColor: '#0B2545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  continueArrow: {
    marginLeft: 8,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  tlsBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tlsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0D9488',
  },
  uptimeText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
    marginBottom: 4,
  },
  mtaAgencyText: {
    fontSize: 10.5,
    color: '#94A3B8',
    lineHeight: 14,
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  footerLink: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
  },
  footerDivider: {
    fontSize: 10,
    color: '#CBD5E1',
  },
});
