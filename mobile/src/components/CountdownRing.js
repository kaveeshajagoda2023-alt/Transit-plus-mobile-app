import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme';

// Circular countdown showing seconds until the QR refreshes
const CountdownRing = ({ secondsLeft, total = 30, size = 64, stroke = 6, warning = false }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, secondsLeft / total));
  const ringColor = warning ? colors.warning : colors.tealCyan;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={`QR code refreshes in ${secondsLeft} seconds`}
    >
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.seconds}>{secondsLeft}</Text>
        <Text style={styles.unit}>sec</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seconds: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDarkNavy,
  },
  unit: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: -2,
  },
});

export default CountdownRing;
