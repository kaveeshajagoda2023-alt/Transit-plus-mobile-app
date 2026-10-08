import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OccupancyLevel } from '@/types/vehicle';
import { TransitColors } from '@/constants/transitTheme';

interface OccupancyIndicatorProps {
  level: OccupancyLevel;
}

export const OccupancyIndicator: React.FC<OccupancyIndicatorProps> = ({ level }) => {
  let activeCount = 1;
  let activeColor: string = TransitColors.occupancyLow;

  if (level === 'medium') {
    activeCount = 2;
    activeColor = TransitColors.occupancyMedium;
  } else if (level === 'high') {
    activeCount = 3;
    activeColor = TransitColors.occupancyHigh;
  }

  const segments = [1, 2, 3, 4];

  return (
    <View style={styles.container}>
      {segments.map((index) => {
        const isFilled = index <= activeCount;
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor: isFilled ? activeColor : TransitColors.occupancyEmpty,
              },
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
    gap: 4,
  },
  bar: {
    width: 14,
    height: 4.5,
    borderRadius: 2.5,
  },
});
