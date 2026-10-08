import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from '@expo/vector-icons';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

export type TabKey = 'home' | 'routes' | 'tickets' | 'alerts' | 'profile';

interface BottomNavigationProps {
  currentTab?: TabKey;
  hasUnreadAlerts?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab = 'home',
  hasUnreadAlerts = true,
}) => {
  const pathname = usePathname();

  const activeTab: TabKey =
    currentTab ||
    (pathname.includes('routes')
      ? 'routes'
      : pathname.includes('tickets')
      ? 'tickets'
      : pathname.includes('alerts')
      ? 'alerts'
      : pathname.includes('profile')
      ? 'profile'
      : 'home');

  const handleTabPress = (tab: TabKey) => {
    if (tab === activeTab && tab === 'home') return;

    switch (tab) {
      case 'home':
        router.push('/' as any);
        break;
      case 'routes':
        router.push('/routes' as any);
        break;
      case 'tickets':
        router.push('/tickets' as any);
        break;
      case 'alerts':
        router.push('/alerts' as any);
        break;
      case 'profile':
        router.push('/profile' as any);
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Home Tab (Active style matching screenshot) */}
      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === 'home' && styles.activeTabPill,
        ]}
        onPress={() => handleTabPress('home')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'home' }}
      >
        <Ionicons
          name="bus"
          size={18}
          color={activeTab === 'home' ? '#FFFFFF' : TransitColors.navInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'home' ? styles.activeTabLabel : styles.inactiveTabLabel,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Routes Tab */}
      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === 'routes' && styles.activeTabPill,
        ]}
        onPress={() => handleTabPress('routes')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'routes' }}
      >
        <MaterialCommunityIcons
          name="source-fork"
          size={19}
          color={activeTab === 'routes' ? '#FFFFFF' : TransitColors.navInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'routes' ? styles.activeTabLabel : styles.inactiveTabLabel,
          ]}
        >
          Routes
        </Text>
      </TouchableOpacity>

      {/* Tickets Tab */}
      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === 'tickets' && styles.activeTabPill,
        ]}
        onPress={() => handleTabPress('tickets')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'tickets' }}
      >
        <MaterialCommunityIcons
          name="ticket-confirmation-outline"
          size={19}
          color={activeTab === 'tickets' ? '#FFFFFF' : TransitColors.navInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'tickets' ? styles.activeTabLabel : styles.inactiveTabLabel,
          ]}
        >
          Tickets
        </Text>
      </TouchableOpacity>

      {/* Alerts Tab */}
      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === 'alerts' && styles.activeTabPill,
        ]}
        onPress={() => handleTabPress('alerts')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'alerts' }}
      >
        <View>
          <Feather
            name="bell"
            size={18}
            color={activeTab === 'alerts' ? '#FFFFFF' : TransitColors.navInactive}
          />
          {hasUnreadAlerts && activeTab !== 'alerts' && (
            <View style={styles.alertBadgeDot} />
          )}
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'alerts' ? styles.activeTabLabel : styles.inactiveTabLabel,
          ]}
        >
          Alerts
        </Text>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity
        style={[
          styles.tabItem,
          activeTab === 'profile' && styles.activeTabPill,
        ]}
        onPress={() => handleTabPress('profile')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'profile' }}
      >
        <Feather
          name="user"
          size={18}
          color={activeTab === 'profile' ? '#FFFFFF' : TransitColors.navInactive}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'profile' ? styles.activeTabLabel : styles.inactiveTabLabel,
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
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 14 : 4,
    ...TransitShadows.card,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 54,
  },
  activeTabPill: {
    backgroundColor: TransitColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#FFFFFF',
  },
  inactiveTabLabel: {
    color: TransitColors.navInactive,
  },
  alertBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: TransitColors.badgeDot,
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
  },
});
