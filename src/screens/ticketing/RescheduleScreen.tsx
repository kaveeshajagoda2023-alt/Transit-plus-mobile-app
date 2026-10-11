/**
 * Member 2 — Edit booking / Reschedule ticket
 * Unpaid bookings: change travel time, fare type and passengers (fare recalculated).
 * Paid tickets: change travel time only (max 2 times, before the travel window opens).
 */
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { TransitColors } from '@/constants/transitTheme';
import { ticketingApi } from '@/services/api/ticketingApi';
import { FARE_CATEGORY_LABELS, FareCategory, PassengerTicket } from '@/types/ticketing';
import { CATEGORY_DISCOUNT, FARE_CATEGORIES } from '@/services/ticketing/fareRules';
import { formatDateTime, formatLKR } from '@/services/ticketing/format';
import {
  Card,
  Chip,
  ErrorBanner,
  InfoRow,
  OfflineBanner,
  PrimaryButton,
  SectionLabel,
  Stepper,
  TicketingHeader,
  TravelTimePicker,
  ticketingStyles,
} from '@/components/ticketing/TicketingUI';

export function RescheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<PassengerTicket | null>(null);
  const [travelDate, setTravelDate] = useState<Date | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [category, setCategory] = useState<FareCategory>('ADULT');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      ticketingApi
        .getTicket(id)
        .then(({ ticket: t }) => {
          setTicket(t);
          const original = new Date(t.travelDate);
          setTravelDate(original.getTime() > Date.now() ? original : null);
          setPassengers(t.passengers);
          setCategory(t.fareCategory);
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'Could not load this ticket.'));
    }, [id])
  );

  const isPaid = ticket?.status === 'ACTIVE';
  const preview = useMemo(() => {
    if (!ticket) return null;
    return ticketingApi.previewFare(
      { id: ticket.routeId, routeNumber: ticket.routeNumber, name: ticket.routeName, type: ticket.transportType, stops: [] },
      ticket.fromSequence,
      ticket.toSequence,
      category,
      passengers
    );
  }, [ticket, category, passengers]);

  if (!ticket) {
    return (
      <SafeAreaView style={ticketingStyles.screen}>
        <TicketingHeader title="Edit ticket" />
        {error ? <View style={{ padding: 16 }}><ErrorBanner message={error} /></View> : <ActivityIndicator style={{ marginTop: 40 }} color={TransitColors.primary} />}
      </SafeAreaView>
    );
  }

  const dateChanged = !!travelDate && travelDate.toISOString() !== new Date(ticket.travelDate).toISOString();
  const otherChanged = !isPaid && (passengers !== ticket.passengers || category !== ticket.fareCategory);
  const hasChanges = dateChanged || otherChanged;

  const save = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setError(null);
    try {
      await ticketingApi.updateTicket(ticket.id, {
        ...(dateChanged && travelDate ? { travelDate: travelDate.toISOString() } : {}),
        ...(otherChanged ? { passengers, fareCategory: category } : {}),
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={ticketingStyles.screen} edges={['top', 'left', 'right', 'bottom']}>
      <TicketingHeader
        title={isPaid ? 'Reschedule ticket' : 'Edit booking'}
        subtitle={`${ticket.fromStop} → ${ticket.toStop}`}
      />
      <OfflineBanner />

      <ScrollView contentContainerStyle={ticketingStyles.scroll}>
        {error ? <ErrorBanner message={error} /> : null}

        <Card>
          <InfoRow label="Currently booked for" value={formatDateTime(ticket.travelDate)} />
          {isPaid ? (
            <Text style={styles.note}>
              Paid tickets can be moved to another time up to 2 times at no cost ({ticket.rescheduleCount} of 2 used). To
              change passengers or fare type, cancel and book again.
            </Text>
          ) : null}
        </Card>

        <Card>
          <SectionLabel>New travel date & time</SectionLabel>
          <TravelTimePicker value={travelDate} onChange={setTravelDate} />
        </Card>

        {!isPaid ? (
          <Card>
            <SectionLabel>Fare type & passengers</SectionLabel>
            <View style={styles.wrapRow}>
              {FARE_CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  label={FARE_CATEGORY_LABELS[c]}
                  sublabel={CATEGORY_DISCOUNT[c] ? `${CATEGORY_DISCOUNT[c]}% off` : 'Full fare'}
                  selected={category === c}
                  onPress={() => setCategory(c)}
                />
              ))}
            </View>
            <View style={styles.paxRow}>
              <Text style={styles.paxLabel}>Passengers</Text>
              <Stepper value={passengers} onChange={setPassengers} label="passengers" />
            </View>
            {preview ? (
              <View style={styles.fareBox}>
                <InfoRow label="New total" value={formatLKR(preview.totalFare)} strong />
                {preview.totalFare !== ticket.totalFare ? (
                  <Text style={styles.note}>Was {formatLKR(ticket.totalFare)}</Text>
                ) : null}
              </View>
            ) : null}
          </Card>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Save changes" icon="check" onPress={save} disabled={!hasChanges} loading={saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 12, color: TransitColors.textSecondary, marginTop: 6, lineHeight: 17 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: TransitColors.divider,
  },
  paxLabel: { fontSize: 14, fontWeight: '800', color: TransitColors.textPrimary },
  fareBox: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: TransitColors.divider },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: TransitColors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: TransitColors.border,
  },
});
