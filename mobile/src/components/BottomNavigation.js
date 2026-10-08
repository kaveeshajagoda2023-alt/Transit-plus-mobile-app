import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

const BottomNavigation = ({ state, descriptors, navigation }) => {
  const tabs = [
    { name: 'CheckoutTab', label: 'Home', icon: '🏠' },
    { name: 'Routes', label: 'Routes', icon: '🗺️' },
    { name: 'Tickets', label: 'Tickets', icon: '🎫' },
    { name: 'Alerts', label: 'Alerts', icon: '🔔' },
    { name: 'Profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isFocused = state ? state.index === index : index === 0;

        const onPress = () => {
          if (navigation) {
            const event = navigation.emit({
              type: 'tabPress',
              target: tab.name,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text
              style={[
                styles.label,
                { color: isFocused ? colors.activeCyan : colors.secondaryText },
              ]}
            >
              {tab.label}
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
    height: 65,
    backgroundColor: colors.primaryDarkNavy,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryNavy,
    paddingBottom: 5,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  icon: {
    fontSize: 18,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
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
