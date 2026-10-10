import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import Icon from './Icon';

// Labels/icons for the tab routes declared in AppNavigator
const TAB_META = {
  Home: { label: 'Home', icon: 'home' },
  BuyTicket: { label: 'Buy Ticket', icon: 'plus-circle' },
  Tickets: { label: 'My Tickets', icon: 'ticket' },
  Scan: { label: 'Scan', icon: 'scan' },
  Profile: { label: 'Profile', icon: 'user' },
};

const BottomNavigation = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 5) }]} accessibilityRole="tablist">
      {state.routes.map((route, index) => {
        const meta = TAB_META[route.name] || { label: route.name, icon: 'info' };
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={`${meta.label} tab`}
          >
            <Icon name={meta.icon} size={22} color={isFocused ? colors.activeCyan : '#A9B8C6'} />
            <Text style={[styles.label, { color: isFocused ? colors.activeCyan : '#A9B8C6' }]} numberOfLines={1}>
              {meta.label}
            </Text>
            {isFocused && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 65,
    backgroundColor: colors.primaryDarkNavy,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryNavy,
    paddingTop: 6,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.activeCyan,
    marginTop: 3,
  },
});

export default BottomNavigation;
