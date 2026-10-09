import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../../theme';
import { useToast } from '../../context/ToastContext';
import { deleteMethod, listMethods, setDefaultMethod } from '../../services/paymentService';
import AppButton from '../../components/AppButton';
import ConfirmDialog from '../../components/ConfirmDialog';
import Icon from '../../components/Icon';
import { EmptyState, ErrorState, SkeletonList } from '../../components/Feedback';

// Saved cards: list (R), add (C, next screen), set default (U), remove (D)
const PaymentMethodsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      setMethods(await listMethods());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const makeDefault = async (m) => {
    setBusyId(m._id);
    try {
      const res = await setDefaultMethod(m._id);
      setMethods((prev) =>
        prev.map((x) => ({ ...x, isDefault: x._id === m._id })).sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
      );
      toast.show(res.message, 'success');
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteMethod(toDelete._id);
      toast.show(res.message, 'success');
      setToDelete(null);
      await load();
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.list]}>
        <SkeletonList count={2} />
      </View>
    );
  }
  if (error && methods.length === 0) return <ErrorState message={error} onRetry={() => load()} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={methods}
        keyExtractor={(m) => m._id}
        contentContainerStyle={[styles.list, methods.length === 0 && styles.grow]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.tealCyan]} />}
        ListHeaderComponent={
          methods.length ? (
            <Text style={styles.note}>Only the card brand and last 4 digits are stored. The default card is pre-selected at checkout.</Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState icon="card" title="No saved cards" message="Save a card to pay faster next time." />
        }
        renderItem={({ item: m }) => (
          <View style={[styles.card, m.isDefault && styles.cardDefault]}>
            <View style={styles.cardTop}>
              <View style={styles.brandIcon}>
                <Icon name="card" size={22} color={colors.white} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>
                  {m.brand} •••• {m.last4}
                </Text>
                <Text style={styles.cardSub}>
                  Expires {m.expiry}
                  {m.holderName ? ` · ${m.holderName}` : ''}
                </Text>
              </View>
              {m.isDefault ? (
                <View style={styles.defaultPill} accessible accessibilityLabel="Default card">
                  <Icon name="star" size={12} color={colors.primaryDarkNavy} fill={colors.primaryDarkNavy} />
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.actions}>
              {!m.isDefault ? (
                <AppButton
                  title="Set as default"
                  icon="star"
                  variant="secondary"
                  compact
                  loading={busyId === m._id}
                  onPress={() => makeDefault(m)}
                  accessibilityLabel={`Set ${m.brand} ending ${m.last4} as default`}
                  style={styles.flex}
                />
              ) : (
                <View style={styles.flex} />
              )}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => setToDelete(m)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${m.brand} ending ${m.last4}`}
              >
                <Icon name="trash" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton title="Add a card" icon="plus" onPress={() => navigation.navigate('AddPaymentMethod')} />
      </View>

      <ConfirmDialog
        visible={!!toDelete}
        title="Remove this card?"
        message={toDelete ? `${toDelete.brand} •••• ${toDelete.last4} will be removed from your account.` : ''}
        confirmLabel="Remove"
        destructive
        icon="trash"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  list: {
    padding: 16,
  },
  grow: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  note: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
    ...theme.shadows.card,
  },
  cardDefault: {
    borderColor: colors.tealCyan,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 44,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.secondaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
  },
  cardSub: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  defaultPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tealCyan,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDarkNavy,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  deleteBtn: {
    width: theme.touch,
    height: theme.touch,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1.5,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

export default PaymentMethodsScreen;
