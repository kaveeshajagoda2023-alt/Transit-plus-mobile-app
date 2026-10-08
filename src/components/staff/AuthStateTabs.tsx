import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StaffAuthTab } from '@/types/staff';
import { TransitShadows } from '@/constants/transitTheme';

interface AuthStateTabsProps {
  activeTab: StaffAuthTab;
  onTabChange: (tab: StaffAuthTab) => void;
  isAuthenticating?: boolean;
}

export const AuthStateTabs: React.FC<AuthStateTabsProps> = ({
  activeTab,
  onTabChange,
  isAuthenticating = false,
}) => {
  const tabs: { key: StaffAuthTab; label: string }[] = [
    { key: 'normal', label: 'Normal State' },
    { key: 'error', label: 'Error Banner' },
    { key: 'authenticating', label: 'Authenticating' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
            disabled={isAuthenticating && tab.key !== 'authenticating'}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`State: ${tab.label}`}
          >
            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    borderRadius: 14,
    padding: 4,
    marginVertical: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    ...TransitShadows.card,
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#0F172A',
    fontWeight: '800',
  },
  inactiveTabLabel: {
    color: '#64748B',
  },
});
