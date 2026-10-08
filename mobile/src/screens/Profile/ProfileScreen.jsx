import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, theme } from '../../theme';

const passenger = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 014-2026',
  memberId: 'PASS-EXP-2048',
  activeTickets: 3,
  completedTrips: 18,
};

const ProfileScreen = ({ navigation }) => {
  const initials = passenger.name
    .split(' ')
    .map((part) => part[0])
    .join('');

  const navigateToTickets = () => navigation.navigate('Tickets');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Profile</Text>
        <Text style={styles.screenSubtitle}>Manage your passenger account and travel details</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.nameText}>{passenger.name}</Text>
          <Text style={styles.memberIdText}>{passenger.memberId}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{passenger.activeTickets}</Text>
          <Text style={styles.statLabel}>Active tickets</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{passenger.completedTrips}</Text>
          <Text style={styles.statLabel}>Trips completed</Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Account details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{passenger.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{passenger.phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.optionsCard}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={navigateToTickets}
            accessibilityRole="button"
          >
            <View style={styles.optionIconContainer}>
              <Text style={styles.optionIcon}>🎫</Text>
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Ticket purchase history</Text>
              <Text style={styles.optionDescription}>View your past transit purchases</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => undefined}
            accessibilityRole="button"
          >
            <View style={styles.optionIconContainer}>
              <Text style={styles.optionIcon}>⚙️</Text>
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Preferences</Text>
              <Text style={styles.optionDescription}>Manage your account settings</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 18,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  avatarContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.tealCyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
  },
  memberIdText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
  },
  statLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
    marginBottom: 10,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  optionsCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  optionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIcon: {
    fontSize: 18,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  optionArrow: {
    fontSize: 24,
    color: colors.secondaryText,
  },
});

export default ProfileScreen;
