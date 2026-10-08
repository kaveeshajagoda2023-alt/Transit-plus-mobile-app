import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';

interface ValidationBannerProps {
  message: string | null;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({ message }) => {
  if (!message) return null;

  return (
    <View style={styles.bannerContainer}>
      <Feather
        name="info"
        size={16}
        color={TransitColors.trainBadge}
        style={styles.infoIcon}
      />
      <Text style={styles.bannerText} numberOfLines={2}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#D4E5F7',
  },
  infoIcon: {
    marginRight: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334E68',
  },
});
