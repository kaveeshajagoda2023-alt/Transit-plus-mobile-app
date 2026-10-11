/**
 * Member 2 — Buy Ticket
 * Route → boarding stop → destination → fare type → passengers → travel time,
 * with a live fare summary. Creates a PENDING_PAYMENT ticket and opens checkout.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';
import { ticketingApi } from '@/services/api/ticketingApi';
import { FARE_CATEGORY_LABELS, FareCategory, TicketingRoute, TicketingStop } from '@/types/ticketing';
import { usePassengerIdentity } from '@/hooks/usePassengerIdentity';
import { CATEGORY_DISCOUNT, FARE_CATEGORIES } from '@/services/ticketing/fareRules';
import { formatDateTime, formatLKR } from '@/services/ticketing/format';
import {
  Card,
  Chip,
  ErrorBanner,
  OfflineBanner,
  PrimaryButton,
  RouteBadge,
  SectionLabel,
  Stepper,
  TicketingHeader,
  TravelTimePicker,
  firstAvailableSlot,
  ticketingStyles,
} from '@/components/ticketing/TicketingUI';

function StopList({
  stops,
  selectedId,
  disabledId,
  onSelect,
  label,
}: {
  stops: TicketingStop[];
  selectedId?: string;
  disabledId?: string;
  onSelect: (s: TicketingStop) => void;
  label: string;
}) {
  return (
    <View accessibilityLabel={label}>
      {stops.map((s, i) => {
        const selected = s.id === selectedId;
        const disabled = s.id === disabledId;
        return (
          <TouchableOpacity
            key={s.id}
            style={[styles.stopRow, i > 0 && styles.stopRowBorder, disabled && { opacity: 0.35 }]}
            onPress={() => onSelect(s)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            accessibilityLabel={`${label}: ${s.name}`}
          >
            <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <View style={styles.radioDot} /> : null}</View>
            <Text style={[styles.stopName, selected && styles.stopNameOn]}>{s.name}</Text>
            <Text style={styles.stopSeq}>Stop {s.sequence}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function BuyTicketScreen() {
  const params = useLocalSearchParams<{ routeId?: string }>();
  const { passengerId, passengerName, defaultCategory } = usePassengerIdentity();

  const [routes, setRoutes] = useState<TicketingRoute[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [routeId, setRouteId] = useState<string | undefined>(params.routeId);
  const [fromStop, setFromStop] = useState<TicketingStop | undefined>();
  const [toStop, setToStop] = useState<TicketingStop | undefined>();
  const [category, setCategory] = useState<FareCategory>(defaultCategory);
  const [passengers, setPassengers] = useState(1);
  const [travelDate, setTravelDate] = useState<Date | null>(() => firstAvailableSlot());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ticketingApi
      .getRoutes()
      .then((r) => {
        setRoutes(r);
        setRouteId((current) => current ?? r[0]?.id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load routes.'))
      .finally(() => setLoadingRoutes(false));
  }, []);

  const route = routes.find((r) => r.id === routeId);
  const quote = useMemo(
    () => ticketingApi.previewFare(route, fromStop?.sequence, toStop?.sequence, category, passengers),
    [route, fromStop, toStop, category, passengers]
  );

  const selectRoute = (id: string) => {
    setRouteId(id);
    setFromStop(undefined);
    setToStop(undefined);
  };

  const missing = !route
    ? 'Choose a route'
    : !fromStop
      ? 'Choose your boarding stop'
      : !toStop
        ? 'Choose your destination'
        : !travelDate
          ? 'Choose a travel time'
          : null;

  const handleContinue = async () => {
    if (missing || !route || !fromStop || !toStop || !travelDate) return;
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await ticketingApi.createTicket({
        passengerId,
        passengerName,
        routeId: route.id,
        fromStopId: fromStop.id,
        toStopId: toStop.id,
        fareCategory: category,
        passengers,
        travelDate: travelDate.toISOString(),
      });
      router.replace({ pathname: '/tickets/checkout', params: { id: ticket.id } } as any);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reserve the ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={ticketingStyles.screen} edges={['top', 'left', 'right', 'bottom']}>
      <TicketingHeader title="Buy a ticket" subtitle="Step 1 of 2 · Journey details" />
      <OfflineBanner />

      <ScrollView contentContainerStyle={ticketingStyles.scroll} keyboardShouldPersistTaps="handled">
        {error ? <ErrorBanner message={error} /> : null}

        <SectionLabel>1 · Route</SectionLabel>
        {loadingRoutes ? (
          <ActivityIndicator color={TransitColors.primary} style={{ marginVertical: 16 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeRow}>
            {routes.map((r) => {
              const selected = r.id === routeId;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.routeCard, selected && styles.routeCardOn]}
                  onPress={() => selectRoute(r.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${r.routeNumber}, ${r.name}`}
                >
                  <RouteBadge routeNumber={r.routeNumber} type={r.type} />
                  <Text style={[styles.routeName, selected && { color: '#FFFFFF' }]} numberOfLines={2}>
                    {r.name}
                  </Text>
                  <Text style={[styles.routeStops, selected && { color: '#CBD5E1' }]}>{r.stops.length} stops</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {route ? (
          <>
            <Card>
              <SectionLabel>2 · Boarding stop</SectionLabel>
              <StopList
                stops={route.stops}
                selectedId={fromStop?.id}
                disabledId={toStop?.id}
                onSelect={setFromStop}
                label="Boarding stop"
              />
            </Card>
            <Card>
              <SectionLabel>3 · Destination</SectionLabel>
              <StopList
                stops={route.stops}
                selectedId={toStop?.id}
                disabledId={fromStop?.id}
                onSelect={setToStop}
                label="Destination"
              />
            </Card>
          </>
        ) : null}

        <Card>
          <SectionLabel>4 · Fare type</SectionLabel>
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
          {category !== 'ADULT' ? (
            <Text style={styles.note}>
              <Feather name="info" size={12} /> Conductor may ask for a valid {FARE_CATEGORY_LABELS[category].toLowerCase()} ID.
            </Text>
          ) : null}

          <View style={styles.paxRow}>
            <View>
              <Text style={styles.paxLabel}>Passengers</Text>
              <Text style={styles.paxSub}>Up to 10 on one ticket</Text>
            </View>
            <Stepper value={passengers} onChange={setPassengers} label="passengers" />
          </View>
        </Card>

        <Card>
          <SectionLabel>5 · Travel date & time</SectionLabel>
          <TravelTimePicker value={travelDate} onChange={setTravelDate} />
          {travelDate ? (
            <Text style={styles.note}>
              Valid from 30 min before to 3 h after {formatDateTime(travelDate)}.
            </Text>
          ) : null}
        </Card>
      </ScrollView>

      {/* Sticky fare summary */}
      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.footerLabel}>Total fare</Text>
          <Text style={styles.footerTotal}>{quote ? formatLKR(quote.totalFare) : '—'}</Text>
          {quote ? (
            <Text style={styles.footerSub}>
              {passengers} × {formatLKR(quote.unitFare)} · {quote.stopsTravelled} stop{quote.stopsTravelled > 1 ? 's' : ''}
            </Text>
          ) : (
            <Text style={styles.footerSub}>{missing}</Text>
          )}
        </View>
        <View style={{ width: 168 }}>
          <PrimaryButton
            label="Continue"
            icon="arrow-right"
            onPress={handleContinue}
            disabled={!!missing}
            loading={submitting}
            accessibilityHint="Reserves the ticket and opens payment"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  routeRow: { gap: 10, paddingBottom: 14, paddingRight: 8 },
  routeCard: {
    width: 170,
    padding: 14,
    borderRadius: 16,
    backgroundColor: TransitColors.cardBackground,
    borderWidth: 1.5,
    borderColor: TransitColors.border,
    gap: 8,
  },
  routeCardOn: { backgroundColor: TransitColors.primary, borderColor: TransitColors.primary },
  routeName: { fontSize: 13, fontWeight: '700', color: TransitColors.textPrimary, minHeight: 34 },
  routeStops: { fontSize: 11, color: TransitColors.textSecondary },
  stopRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, minHeight: 48 },
  stopRowBorder: { borderTopWidth: 1, borderTopColor: TransitColors.divider },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: TransitColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: TransitColors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: TransitColors.primary },
  stopName: { flex: 1, fontSize: 14, color: TransitColors.textPrimary, fontWeight: '600' },
  stopNameOn: { color: TransitColors.primary, fontWeight: '800' },
  stopSeq: { fontSize: 11, color: TransitColors.textMuted },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  note: { fontSize: 12, color: TransitColors.textSecondary, marginTop: 10, lineHeight: 17 },
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
  paxSub: { fontSize: 12, color: TransitColors.textSecondary, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: TransitColors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: TransitColors.border,
    ...TransitShadows.bottomSheet,
  },
  footerLabel: { fontSize: 11, fontWeight: '700', color: TransitColors.textSecondary, textTransform: 'uppercase' },
  footerTotal: { fontSize: 22, fontWeight: '800', color: TransitColors.primary },
  footerSub: { fontSize: 11, color: TransitColors.textSecondary },
});
