import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '@/components/passenger/Header';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { TransitColors } from '@/constants/transitTheme';

export default function TicketsTabScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header
        onMenuPress={() => {}}
        onSearchPress={() => router.push('/passenger/route-search' as any)}
      />

      <View style={styles.centerContent}>
        <MaterialCommunityIcons
          name="ticket-confirmation-outline"
          size={56}
          color={TransitColors.primary}
        />
        <Text style={styles.title}>Digital Tickets & Passes</Text>
        <Text style={styles.subtitle}>
          Ticketing module (Member 3) will be integrated here. View active passes and QR codes.
        </Text>
      </View>

      <BottomNavigation currentTab="tickets" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: TransitColors.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: TransitColors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
});
