import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';

const { width } = Dimensions.get('window');

export function WelcomeHomeScreen() {
  const handleGetStarted = () => {
    router.push('/onboarding' as any);
  };

  const handleSkipToRoles = () => {
    router.push('/role-selection' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top subtle badge */}
      <View style={styles.topBar}>
        <View style={styles.metroBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.metroBadgeText}>MTA REAL-TIME NETWORK</Text>
        </View>

        <TouchableOpacity onPress={handleSkipToRoles} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.skipText}>Portals →</Text>
        </TouchableOpacity>
      </View>

      {/* Center Branding Area */}
      <View style={styles.centerContent}>
        {/* Glowing background halo */}
        <View style={styles.glowHalo} />

        {/* Brand Icon Emblem */}
        <View style={styles.emblemContainer}>
          <View style={styles.emblemInner}>
            <View style={styles.emblemSquare}>
              <MaterialCommunityIcons name="bus-clock" size={44} color="#00F0FF" />
              <View style={styles.pulseWave}>
                <Ionicons name="pulse" size={20} color="#22C55E" />
              </View>
            </View>
          </View>
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>TransitPulse</Text>
        <Text style={styles.brandSubtitle}>Real-Time Transit & Smart Ticketing</Text>

        {/* Feature Pills */}
        <View style={styles.pillsRow}>
          <View style={styles.pillItem}>
            <Text style={styles.pillEmoji}>🚆</Text>
            <Text style={styles.pillText}>Metro</Text>
          </View>
          <View style={styles.pillItem}>
            <Text style={styles.pillEmoji}>🚌</Text>
            <Text style={styles.pillText}>Bus</Text>
          </View>
          <View style={styles.pillItem}>
            <Text style={styles.pillEmoji}>⚡</Text>
            <Text style={styles.pillText}>Express</Text>
          </View>
        </View>
      </View>

      {/* Bottom CTA Area */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGetStarted}
          activeOpacity={0.88}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" style={styles.buttonArrow} />
        </TouchableOpacity>

        {/* Authority footer */}
        <View style={styles.authorityRow}>
          <Ionicons name="shield-checkmark" size={14} color="#64748B" />
          <Text style={styles.authorityText}>Official Regional Transit Authority</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  metroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  metroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    position: 'relative',
  },
  glowHalo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#E0F2FE',
    opacity: 0.55,
    top: -20,
  },
  emblemContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0369A1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 28,
  },
  emblemInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemSquare: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#0B2545',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  pulseWave: {
    position: 'absolute',
    bottom: 6,
    right: 8,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 14.5,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.2,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  pillEmoji: {
    fontSize: 12,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#0B2545',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0B2545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  buttonArrow: {
    marginLeft: 8,
  },
  authorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorityText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
});
