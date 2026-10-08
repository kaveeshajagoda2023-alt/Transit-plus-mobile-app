import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { TerminalStatus } from '@/types/staff';

interface TerminalStatusBarProps {
  status: TerminalStatus;
}

export const TerminalStatusBar: React.FC<TerminalStatusBarProps> = ({ status }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isConnected = status.connectionStatus === 'CONNECTED';
  const isReady = isConnected && status.terminalState === 'READY';

  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnected, pulseAnim]);

  const dotColor = isReady ? '#10B981' : isConnected ? '#F59E0B' : '#EF4444';
  const statusLabel = !isConnected
    ? 'TERMINAL OFFLINE • NO DISPATCH SIGNAL'
    : `TERMINAL ${status.terminalState} • ${status.dispatchZone}`;

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: dotColor, opacity: pulseAnim },
          ]}
        />
        <Text style={[styles.statusText, !isConnected && styles.offlineStatusText]}>
          {statusLabel}
        </Text>
      </View>

      <Text style={styles.versionText}>{status.version}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E', // Emerald / dark teal from screenshot
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  offlineStatusText: {
    color: '#DC2626',
  },
  versionText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'monospace',
  },
});
