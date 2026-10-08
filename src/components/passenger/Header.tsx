import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';

import { router } from 'expo-router';

interface HeaderProps {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onSearchPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="Menu"
        activeOpacity={0.7}
      >
        <Feather name="menu" size={24} color={TransitColors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.titleWrap}
        onPress={() => router.push('/staff/login' as any)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="TransitPulse Brand (tap for staff portal)"
      >
        <View style={styles.logoSquare}>
          <Ionicons name="bus" size={14} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>TransitPulse</Text>
      </TouchableOpacity>

      <View style={styles.rightGroup}>
        <TouchableOpacity
          style={styles.staffBtn}
          onPress={() => router.push('/staff/login' as any)}
          accessibilityRole="button"
          accessibilityLabel="Staff Portal"
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="shield-account-outline" size={18} color={TransitColors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearchPress}
          accessibilityRole="button"
          accessibilityLabel="Search"
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={22} color={TransitColors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logoSquare: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: TransitColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: TransitColors.primary,
    letterSpacing: -0.3,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  staffBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
});

