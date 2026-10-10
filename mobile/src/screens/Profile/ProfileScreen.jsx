import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { deleteMe } from '../../services/userService';
import Icon from '../../components/Icon';
import ConfirmDialog from '../../components/ConfirmDialog';
import TextField from '../../components/TextField';
import { Banner } from '../../components/Feedback';
import { LANGUAGES } from '../../utils/constants';
import { formatDate, passengerTypeLabel } from '../../utils/format';
import { goToTab } from '../../navigation/navHelpers';
import { EXTERNAL_PROFILE_LINKS } from '../../navigation/ExternalModules';

const OptionRow = ({ icon, title, description, onPress, danger = false }) => (
  <TouchableOpacity style={styles.optionRow} onPress={onPress} accessibilityRole="button" accessibilityLabel={title} accessibilityHint={description}>
    <View style={[styles.optionIconContainer, danger && styles.optionIconDanger]}>
      <Icon name={icon} size={20} color={danger ? colors.danger : colors.secondaryNavy} />
    </View>
    <View style={styles.optionTextContainer}>
      <Text style={[styles.optionTitle, danger && styles.dangerText]}>{title}</Text>
      {description ? <Text style={styles.optionDescription}>{description}</Text> : null}
    </View>
    <Icon name="chevron-right" size={20} color={colors.secondaryText} />
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user, stats, refreshUser, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null); // 'logout' | 'delete'
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      setError(null);
      try {
        await refreshUser();
      } catch (e) {
        setError(e.message);
      } finally {
        setRefreshing(false);
      }
    },
    [refreshUser]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const passenger = user || {};
  const initials = (passenger.name || '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const language = LANGUAGES.find((l) => l.value === passenger.preferredLanguage)?.label || 'English';

  const closeDialog = () => {
    setDialog(null);
    setPassword('');
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!password) {
      setDeleteError('Enter your password to confirm');
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMe(password);
      closeDialog();
      await signOut();
      toast.show('Your account has been deleted', 'info');
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.tealCyan]} />}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle} accessibilityRole="header">
          Profile
        </Text>
        <Text style={styles.screenSubtitle}>Manage your passenger account and travel details</Text>
      </View>

      {error ? <Banner type="warning" message={`Showing saved details. ${error}`} actionLabel="Retry" onAction={() => load()} /> : null}

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.nameText}>{passenger.name}</Text>
          <Text style={styles.memberIdText}>
            {passengerTypeLabel(passenger.passengerType)} passenger · since {formatDate(passenger.createdAt).slice(5)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Icon name="edit" size={20} color={colors.tealText} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard} onPress={() => goToTab(navigation, 'Tickets')} accessibilityRole="button" accessibilityLabel={`${stats?.activeTickets ?? 0} active tickets. Open My Tickets`}>
          <Text style={styles.statValue}>{stats?.activeTickets ?? '–'}</Text>
          <Text style={styles.statLabel}>Active tickets</Text>
        </TouchableOpacity>
        <View style={styles.statCard} accessible accessibilityLabel={`${stats?.completedTrips ?? 0} trips completed`}>
          <Text style={styles.statValue}>{stats?.completedTrips ?? '–'}</Text>
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
            <Text style={styles.detailValue}>{passenger.phone || 'Not added'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Passenger type</Text>
            <Text style={styles.detailValue}>{passengerTypeLabel(passenger.passengerType)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Language</Text>
            <Text style={styles.detailValue}>{language}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Payments & tickets</Text>
        <View style={styles.optionsCard}>
          <OptionRow
            icon="card"
            title="Saved payment methods"
            description={`${stats?.savedMethods ?? 0} saved card(s) · add, remove, set default`}
            onPress={() => navigation.navigate('PaymentMethods')}
          />
          <View style={styles.optionDivider} />
          <OptionRow icon="receipt" title="Payment history" description="Receipts and refunds" onPress={() => navigation.navigate('PaymentHistory')} />
          <View style={styles.optionDivider} />
          <OptionRow icon="ticket" title="Ticket purchase history" description="View your past transit purchases" onPress={() => goToTab(navigation, 'Tickets')} />
          <View style={styles.optionDivider} />
          <OptionRow icon="list" title="Scan history" description="Tickets you have validated" onPress={() => navigation.navigate('ScanHistory')} />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Other modules</Text>
        <View style={styles.optionsCard}>
          {EXTERNAL_PROFILE_LINKS.map((link, i) => (
            <View key={link.key}>
              {i > 0 ? <View style={styles.optionDivider} /> : null}
              <OptionRow icon={link.icon} title={link.label} onPress={() => navigation.navigate(link.screen)} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.optionsCard}>
          <OptionRow icon="edit" title="Edit profile" description="Name, phone, passenger type, language" onPress={() => navigation.navigate('EditProfile')} />
          <View style={styles.optionDivider} />
          <OptionRow icon="log-out" title="Log out" onPress={() => setDialog('logout')} />
          <View style={styles.optionDivider} />
          <OptionRow icon="trash" title="Delete account" description="Permanently remove your data" danger onPress={() => setDialog('delete')} />
        </View>
      </View>

      <ConfirmDialog
        visible={dialog === 'logout'}
        title="Log out?"
        message="You will need to log in again to see your tickets."
        confirmLabel="Log out"
        icon="log-out"
        onConfirm={() => {
          closeDialog();
          signOut();
        }}
        onCancel={closeDialog}
      />

      <ConfirmDialog
        visible={dialog === 'delete'}
        title="Delete your account?"
        message="All your tickets, payments and saved cards will be permanently deleted. Active tickets will stop working."
        confirmLabel="Delete forever"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={closeDialog}
      >
        <TextField
          label="Enter your password to confirm"
          secure
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setDeleteError(null);
          }}
          error={deleteError}
          autoCapitalize="none"
          style={styles.passwordField}
        />
      </ConfirmDialog>
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
    color: colors.primaryDarkNavy,
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
  editButton: {
    width: theme.touch,
    height: theme.touch,
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
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
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  optionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 60,
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
  optionIconDanger: {
    backgroundColor: colors.dangerBg,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
  },
  dangerText: {
    color: colors.danger,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  passwordField: {
    marginTop: 12,
    marginBottom: 0,
  },
});

export default ProfileScreen;
