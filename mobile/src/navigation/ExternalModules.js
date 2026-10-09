// =====================================================================
// Integration point for the other members' modules.
// When merging, replace a placeholder `component` with the real screen,
// e.g.  import LiveMapScreen from '../screens/LiveMap';
// Screen names are fixed so Member 2 screens can already navigate to them.
// =====================================================================
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, theme } from '../theme';
import Icon from '../components/Icon';
import AppButton from '../components/AppButton';

const makePlaceholder = (title, owner, icon, description) => {
  const Placeholder = ({ navigation }) => (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={34} color={colors.tealText} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.owner}>{owner}</Text>
      <Text style={styles.text}>{description}</Text>
      <View style={styles.note}>
        <Icon name="info" size={16} color={colors.secondaryText} />
        <Text style={styles.noteText}>This module is built by another team member and will be connected here.</Text>
      </View>
      <AppButton title="Go back" variant="secondary" onPress={() => navigation.goBack()} style={styles.button} />
    </ScrollView>
  );
  return Placeholder;
};

// ---- Member 1: Live Map and Search & ETA ----
export const LiveMapScreen = makePlaceholder(
  'Live Bus Map',
  'Member 1 · Live Tracking',
  'map',
  'See buses moving on the map in real time and find the closest stop.'
);
export const SearchEtaScreen = makePlaceholder(
  'Search & ETA',
  'Member 1 · Journey Planner',
  'navigation',
  'Search a destination and see when the next bus will arrive.'
);

// ---- Member 3: Driver / Conductor ----
export const DriverConsoleScreen = makePlaceholder(
  'Driver & Conductor',
  'Member 3 · Operations',
  'bus',
  'Trip start/stop, passenger counts and on-board ticket checks.'
);

// ---- Member 4: Admin ----
export const AdminDashboardScreen = makePlaceholder(
  'Admin Dashboard',
  'Member 4 · Administration',
  'shield',
  'Manage routes, fares, users and reports.'
);

// Registered in the root stack by AppNavigator
export const EXTERNAL_SCREENS = [
  { name: 'LiveMap', component: LiveMapScreen, options: { title: 'Live Map' } },
  { name: 'SearchEta', component: SearchEtaScreen, options: { title: 'Search & ETA' } },
  { name: 'DriverConsole', component: DriverConsoleScreen, options: { title: 'Driver / Conductor' } },
  { name: 'AdminDashboard', component: AdminDashboardScreen, options: { title: 'Admin' } },
];

// Shortcuts on the Home screen
export const EXTERNAL_QUICK_ACTIONS = [
  { key: 'map', label: 'Live map', icon: 'map', screen: 'LiveMap' },
  { key: 'eta', label: 'Search & ETA', icon: 'navigation', screen: 'SearchEta' },
];

// Shortcuts in Profile > Other modules (role based once Members 3/4 merge)
export const EXTERNAL_PROFILE_LINKS = [
  { key: 'driver', label: 'Driver / Conductor mode', icon: 'bus', screen: 'DriverConsole' },
  { key: 'admin', label: 'Admin dashboard', icon: 'shield', screen: 'AdminDashboard' },
];

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.lightBackground,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDarkNavy,
  },
  owner: {
    fontSize: 13,
    color: colors.tealText,
    fontWeight: '700',
    marginTop: 4,
  },
  text: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginTop: 18,
  },
  noteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: colors.secondaryText,
  },
  button: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
});
