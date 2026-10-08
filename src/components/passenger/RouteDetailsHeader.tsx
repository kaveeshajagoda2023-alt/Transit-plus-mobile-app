import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';

interface RouteDetailsHeaderProps {
  title?: string;
  routeNumber?: string;
  destination?: string;
  etaMinutes?: number;
  isBookmarked: boolean;
  onBackPress: () => void;
  onBookmarkToggle: () => void;
}

export const RouteDetailsHeader: React.FC<RouteDetailsHeaderProps> = ({
  title = 'Route Details',
  routeNumber = 'Bus 42',
  destination = 'University Malabe Campus',
  etaMinutes = 6,
  isBookmarked,
  onBackPress,
  onBookmarkToggle,
}) => {
  const handleShare = async () => {
    try {
      const shareMessage = `TransitPulse: ${routeNumber} to ${destination} is arriving in ${etaMinutes} min. Track real-time live transit updates on TransitPulse.`;
      await Share.share({
        title: `TransitPulse - ${routeNumber}`,
        message: shareMessage,
      });
    } catch (error) {
      console.error('Error sharing route:', error);
    }
  };

  return (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onBackPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Feather name="arrow-left" size={24} color={TransitColors.primary} />
      </TouchableOpacity>

      {/* Screen Title */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Right Action Icons */}
      <View style={styles.rightActions}>
        {/* Share Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleShare}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Share route details"
        >
          <Feather name="share-2" size={20} color={TransitColors.primary} />
        </TouchableOpacity>

        {/* Bookmark Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBookmarkToggle}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark route'}
        >
          {isBookmarked ? (
            <Ionicons name="bookmark" size={21} color={TransitColors.primary} />
          ) : (
            <Ionicons name="bookmark-outline" size={21} color={TransitColors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TransitColors.primary,
    letterSpacing: -0.2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
