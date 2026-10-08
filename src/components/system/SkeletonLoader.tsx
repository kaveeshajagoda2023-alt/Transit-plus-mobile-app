import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonBlock: React.FC<SkeletonProps> = ({
  width = 60,
  height = 18,
  borderRadius = 6,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <View style={[styles.skeletonCard, compact && styles.compactCard]}>
      {/* Top Row: Route Badge & Tag Placeholder */}
      <View style={styles.rowBetween}>
        <View style={styles.rowLeft}>
          <SkeletonBlock width={64} height={20} borderRadius={6} />
          <SkeletonBlock width={40} height={20} borderRadius={6} style={{ marginLeft: 8 }} />
        </View>
        <SkeletonBlock width={54} height={18} borderRadius={6} />
      </View>

      {/* Middle Line: Title */}
      <SkeletonBlock
        width="82%"
        height={13}
        borderRadius={4}
        style={{ marginTop: 12, marginBottom: 8 }}
      />

      {/* Bottom Row: Subtext & Fare / Time */}
      <View style={styles.rowBetween}>
        <SkeletonBlock width="45%" height={11} borderRadius={4} />
        <SkeletonBlock width={48} height={14} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#CBD5E1',
  },
  skeletonCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactCard: {
    padding: 10,
    marginVertical: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
