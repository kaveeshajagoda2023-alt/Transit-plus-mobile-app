import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SkeletonCard } from './SkeletonLoader';
import { TransitColors } from '@/constants/transitTheme';

interface LoadingStateProps {
  title?: string;
  description?: string;
  showSkeletons?: boolean;
  skeletonCount?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Searching optimal bus and train connections...',
  description = 'Evaluating 18 multimodal combinations in real time',
  showSkeletons = true,
  skeletonCount = 2,
}) => {
  return (
    <View style={styles.container}>
      {/* Centered Circular Animated Spinner */}
      <View style={styles.spinnerCircle}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>

      {/* Main Loading Title & Subtitle */}
      <Text style={styles.titleText}>{title}</Text>
      {description && <Text style={styles.descText}>{description}</Text>}

      {/* Skeleton Placeholder Blocks */}
      {showSkeletons && (
        <View style={styles.skeletonsContainer}>
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  spinnerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  titleText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: TransitColors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  descText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: TransitColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  skeletonsContainer: {
    width: '100%',
    marginTop: 4,
  },
});
