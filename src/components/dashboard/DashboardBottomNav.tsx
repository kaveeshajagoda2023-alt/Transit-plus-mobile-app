import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';

export type DashboardTab = 'dashboard' | 'scanner' | 'passengers' | 'activity' | 'profile';

interface DashboardBottomNavProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
}

export const DashboardBottomNav: React.FC<DashboardBottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Dashboard Tab */}
      <TouchableOpacity
        style={[
          styles.tabItem,
          currentTab === 'dashboard' && styles.tabItemActive,
        ]}
        onPress={() => onSelectTab('dashboard')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: currentTab === 'dashboard' }}
        accessibilityLabel="Dashboard"
      >
        <MaterialCommunityIcons
          name="view-dashboard-outline"
          size={20}
          color={currentTab === 'dashboard' ? '#0F172A' : '#64748B'}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'dashboard' && styles.tabLabelActive,
          ]}
        >
          Dashboard
        </Text>
      </TouchableOpacity>

      {/* 2. Scanner Tab */}
      <TouchableOpacity
        style={[
          styles.tabItem,
          currentTab === 'scanner' && styles.tabItemActive,
        ]}
        onPress={() => onSelectTab('scanner')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: currentTab === 'scanner' }}
        accessibilityLabel="Scanner"
      >
        <MaterialCommunityIcons
          name="qrcode-scan"
          size={19}
          color={currentTab === 'scanner' ? '#0F172A' : '#64748B'}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'scanner' && styles.tabLabelActive,
          ]}
        >
          Scanner
        </Text>
      </TouchableOpacity>

      {/* 3. Passengers Tab */}
      <TouchableOpacity
        style={[
          styles.tabItem,
          currentTab === 'passengers' && styles.tabItemActive,
        ]}
        onPress={() => onSelectTab('passengers')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: currentTab === 'passengers' }}
        accessibilityLabel="Passengers"
      >
        <Ionicons
          name="people-outline"
          size={20}
          color={currentTab === 'passengers' ? '#0F172A' : '#64748B'}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'passengers' && styles.tabLabelActive,
          ]}
        >
          Passengers
        </Text>
      </TouchableOpacity>

      {/* 4. Activity Tab */}
      <TouchableOpacity
        style={[
          styles.tabItem,
          currentTab === 'activity' && styles.tabItemActive,
        ]}
        onPress={() => onSelectTab('activity')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: currentTab === 'activity' }}
        accessibilityLabel="Activity"
      >
        <MaterialCommunityIcons
          name="receipt-text-outline"
          size={20}
          color={currentTab === 'activity' ? '#0F172A' : '#64748B'}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'activity' && styles.tabLabelActive,
          ]}
        >
          Activity
        </Text>
      </TouchableOpacity>

      {/* 5. Profile Tab */}
      <TouchableOpacity
        style={[
          styles.tabItem,
          currentTab === 'profile' && styles.tabItemActive,
        ]}
        onPress={() => onSelectTab('profile')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: currentTab === 'profile' }}
        accessibilityLabel="Profile"
      >
        <Feather
          name="user"
          size={19}
          color={currentTab === 'profile' ? '#0F172A' : '#64748B'}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'profile' && styles.tabLabelActive,
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 76 : 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 14 : 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    minWidth: 58,
  },
  tabItemActive: {
    backgroundColor: '#99F6E4', // Mint green active pill from screenshot
    paddingHorizontal: 14,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
});
