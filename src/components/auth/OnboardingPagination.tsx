import React from 'react';
import { View, StyleSheet } from 'react-native';

interface OnboardingPaginationProps {
  totalDots?: number;
  activeIndex: number;
  activeColor?: string;
  inactiveColor?: string;
}

export const OnboardingPagination: React.FC<OnboardingPaginationProps> = ({
  totalDots = 3,
  activeIndex,
  activeColor = '#0D9488',
  inactiveColor = '#CBD5E1',
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalDots }).map((_, i) => {
        const isActive = i === activeIndex;
        return (
          <View
            key={`dot-${i}`}
            style={[
              styles.dot,
              isActive
                ? [styles.activeDot, { backgroundColor: activeColor }]
                : [styles.inactiveDot, { backgroundColor: inactiveColor }],
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 22,
  },
  inactiveDot: {
    width: 6,
  },
});
