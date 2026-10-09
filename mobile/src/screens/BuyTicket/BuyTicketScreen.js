import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { listRoutes, getFare } from '../../services/routeService';
import ScreenHeader from '../../components/ScreenHeader';
import TextField from '../../components/TextField';
import Chip from '../../components/Chip';
import AppButton from '../../components/AppButton';
import Icon from '../../components/Icon';
import { ErrorState, Skeleton } from '../../components/Feedback';
import { PASSENGER_TYPES } from '../../utils/constants';
import { dayLabel, formatLKR } from '../../utils/format';

const MAX_PASSENGERS = 10;
const NOW = 'now';

const nextDays = (count = 7) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });

// Half-hour departure slots (minutes after midnight). Today starts at the next slot.
const timeSlots = (day) => {
  const isToday = day.toDateString() === new Date().toDateString();
  const now = new Date();
  const start = isToday ? Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / 30) * 30 : 5 * 60;
  const slots = [];
  for (let m = start; m <= 22 * 60; m += 30) slots.push(m);
  return isToday ? [NOW, ...slots] : slots;
};

const slotLabel = (slot) => {
  if (slot === NOW) return 'Now';
  const h = Math.floor(slot / 60);
  const m = String(slot % 60).padStart(2, '0');
  return `${((h + 11) % 12) + 1}:${m} ${h < 12 ? 'AM' : 'PM'}`;
};

const BuyTicketScreen = ({ navigation, route: navRoute }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routesError, setRoutesError] = useState(null);

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [fromStop, setFromStop] = useState(null);
  const [toStop, setToStop] = useState(null);
  const [passengerType, setPassengerType] = useState(user?.passengerType || 'adult');
  const [passengers, setPassengers] = useState(1);
  const days = useMemo(() => nextDays(), []);
  const [day, setDay] = useState(days[0]);
  const [slot, setSlot] = useState(NOW);

  const [fare, setFare] = useState(null);
  const [fareLoading, setFareLoading] = useState(false);
  const [fareError, setFareError] = useState(null);
  const [errors, setErrors] = useState({});
  const scrollRef = useRef(null);

  const loadRoutes = useCallback(async (term) => {
    setRoutesLoading(true);
    setRoutesError(null);
    try {
      setRoutes(await listRoutes(term));
    } catch (e) {
      setRoutesError(e.message);
    } finally {
      setRoutesLoading(false);
    }
  }, []);

  // Debounced route search
  useEffect(() => {
    const t = setTimeout(() => loadRoutes(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search, loadRoutes]);

  // Reset to the passenger's default type when their profile changes
  useEffect(() => {
    if (user?.passengerType) setPassengerType(user.passengerType);
  }, [user?.passengerType]);

  // Prefill when opened with a route (e.g. from another module)
  useEffect(() => {
    const preset = navRoute?.params?.route;
    if (preset) setSelectedRoute(preset);
  }, [navRoute?.params?.route]);

  // Live fare: recalculated whenever a fare-relevant choice changes
  useEffect(() => {
    if (!selectedRoute || !fromStop || !toStop) {
      setFare(null);
      return undefined;
    }
    let cancelled = false;
    setFareLoading(true);
    setFareError(null);
    const t = setTimeout(async () => {
      try {
        const data = await getFare(selectedRoute._id, { from: fromStop, to: toStop, type: passengerType, passengers });
        if (!cancelled) setFare(data);
      } catch (e) {
        if (!cancelled) setFareError(e.message);
      } finally {
        if (!cancelled) setFareLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [selectedRoute, fromStop, toStop, passengerType, passengers]);

  const chooseRoute = (r) => {
    setSelectedRoute(r);
    setFromStop(null);
    setToStop(null);
    setErrors({});
  };

  const chooseStop = (stop) => {
    // First tap sets boarding, second sets destination; tapping again starts over
    if (!fromStop || (fromStop && toStop)) {
      setFromStop(stop);
      setToStop(null);
    } else if (stop === fromStop) {
      setFromStop(null);
    } else {
      setToStop(stop);
    }
    setErrors((e) => ({ ...e, stops: null }));
  };

  const swapStops = () => {
    setFromStop(toStop);
    setToStop(fromStop);
  };

  const travelDate = () => {
    if (slot === NOW) return new Date();
    const d = new Date(day);
    d.setHours(Math.floor(slot / 60), slot % 60, 0, 0);
    return d;
  };

  const handleContinue = () => {
    const next = {};
    if (!selectedRoute) next.route = 'Choose a route first';
    else if (!fromStop || !toStop) next.stops = 'Choose both a boarding and a destination stop';
    setErrors(next);
    if (Object.keys(next).length) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (!fare) return;
    navigation.navigate('FareSummary', {
      route: { _id: selectedRoute._id, code: selectedRoute.code, name: selectedRoute.name },
      fromStop,
      toStop,
      passengerType,
      passengers,
      travelDate: travelDate().toISOString(),
      fare,
    });
  };

  const slots = timeSlots(day);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader title="Buy Ticket" subtitle="Choose your route, stops and travel time" />

        {/* 1. Route */}
        <Text style={styles.step}>1 · Route</Text>
        {selectedRoute ? (
          <View style={styles.selectedRoute}>
            <View style={styles.routeBadge}>
              <Text style={styles.routeBadgeText}>{selectedRoute.code}</Text>
            </View>
            <Text style={styles.selectedRouteName} numberOfLines={2}>
              {selectedRoute.name}
            </Text>
            <AppButton title="Change" variant="ghost" compact onPress={() => setSelectedRoute(null)} accessibilityLabel="Change route" />
          </View>
        ) : (
          <>
            <TextField
              icon="search"
              value={search}
              onChangeText={setSearch}
              placeholder="Search route number, name or stop"
              accessibilityLabel="Search routes"
              error={errors.route}
              autoCorrect={false}
            />
            {routesLoading ? (
              <View>
                <Skeleton height={56} radius={12} style={styles.gap} />
                <Skeleton height={56} radius={12} style={styles.gap} />
              </View>
            ) : routesError ? (
              <ErrorState message={routesError} onRetry={() => loadRoutes(search.trim())} />
            ) : routes.length === 0 ? (
              <Text style={styles.muted}>No routes match "{search}". Try a stop name like "Nugegoda".</Text>
            ) : (
              routes.map((r) => (
                <TouchableOpacity
                  key={r._id}
                  style={styles.routeRow}
                  onPress={() => chooseRoute(r)}
                  accessibilityRole="button"
                  accessibilityLabel={`Route ${r.code}, ${r.name}, ${r.stops.length} stops`}
                >
                  <View style={styles.routeBadge}>
                    <Text style={styles.routeBadgeText}>{r.code}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.routeName}>{r.name}</Text>
                    <Text style={styles.muted}>
                      {r.stops.length} stops · from {formatLKR(r.baseFare)}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.secondaryText} />
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {selectedRoute ? (
          <>
            {/* 2. Stops */}
            <View style={styles.stepRow}>
              <Text style={styles.step}>2 · Stops</Text>
              {fromStop && toStop ? (
                <AppButton title="Swap" icon="refresh" variant="ghost" compact onPress={swapStops} accessibilityLabel="Swap boarding and destination stops" />
              ) : null}
            </View>
            <View style={styles.stopSummary}>
              <View style={styles.stopBox}>
                <Text style={styles.stopLabel}>From</Text>
                <Text style={[styles.stopValue, !fromStop && styles.placeholder]}>{fromStop || 'Tap a stop'}</Text>
              </View>
              <Icon name="arrow-right" size={18} color={colors.secondaryText} />
              <View style={styles.stopBox}>
                <Text style={styles.stopLabel}>To</Text>
                <Text style={[styles.stopValue, !toStop && styles.placeholder]}>{toStop || (fromStop ? 'Tap a stop' : '-')}</Text>
              </View>
            </View>
            {errors.stops ? <Text style={styles.error}>{errors.stops}</Text> : null}
            <View style={styles.chips} accessibilityRole="radiogroup">
              {selectedRoute.stops.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  icon="map-pin"
                  selected={s === fromStop || s === toStop}
                  sublabel={s === fromStop ? 'Boarding' : s === toStop ? 'Destination' : undefined}
                  onPress={() => chooseStop(s)}
                  accessibilityLabel={`${s}${s === fromStop ? ', selected as boarding stop' : s === toStop ? ', selected as destination' : ''}`}
                />
              ))}
            </View>

            {/* 3. Passengers */}
            <Text style={styles.step}>3 · Passengers</Text>
            <View style={styles.chips} accessibilityRole="radiogroup">
              {PASSENGER_TYPES.map((t) => (
                <Chip key={t.value} label={t.label} sublabel={t.note} selected={passengerType === t.value} onPress={() => setPassengerType(t.value)} />
              ))}
            </View>
            <View style={styles.stepper}>
              <Text style={styles.stepperLabel}>Number of passengers</Text>
              <TouchableOpacity
                style={[styles.stepperBtn, passengers <= 1 && styles.stepperDisabled]}
                onPress={() => setPassengers((p) => Math.max(1, p - 1))}
                disabled={passengers <= 1}
                accessibilityRole="button"
                accessibilityLabel="Remove a passenger"
              >
                <Icon name="minus" size={20} color={colors.primaryDarkNavy} />
              </TouchableOpacity>
              <Text style={styles.stepperValue} accessibilityLabel={`${passengers} passengers`} accessibilityLiveRegion="polite">
                {passengers}
              </Text>
              <TouchableOpacity
                style={[styles.stepperBtn, passengers >= MAX_PASSENGERS && styles.stepperDisabled]}
                onPress={() => setPassengers((p) => Math.min(MAX_PASSENGERS, p + 1))}
                disabled={passengers >= MAX_PASSENGERS}
                accessibilityRole="button"
                accessibilityLabel="Add a passenger"
              >
                <Icon name="plus" size={20} color={colors.primaryDarkNavy} />
              </TouchableOpacity>
            </View>

            {/* 4. Date & time */}
            <Text style={styles.step}>4 · Travel date & time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {days.map((d) => (
                <Chip
                  key={d.toISOString()}
                  label={dayLabel(d)}
                  icon="calendar"
                  selected={d.getTime() === day.getTime()}
                  onPress={() => {
                    setDay(d);
                    setSlot(timeSlots(d)[0]);
                  }}
                />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {slots.map((s) => (
                <Chip key={String(s)} label={slotLabel(s)} icon="clock" selected={s === slot} onPress={() => setSlot(s)} />
              ))}
            </ScrollView>
          </>
        ) : null}
      </ScrollView>

      {/* Live fare + continue, pinned above the tab bar */}
      {selectedRoute ? (
        <View style={styles.footer}>
          <View style={styles.flex} accessibilityLiveRegion="polite">
            <Text style={styles.footerLabel}>Total fare</Text>
            {fareLoading ? (
              <ActivityIndicator color={colors.tealCyan} style={styles.fareSpinner} />
            ) : fareError ? (
              <Text style={styles.error}>{fareError}</Text>
            ) : fare ? (
              <>
                <Text style={styles.footerFare}>{formatLKR(fare.totalFare)}</Text>
                <Text style={styles.footerSub}>
                  {passengers} × {formatLKR(fare.unitFare)} · {fare.stopsTravelled} stops
                </Text>
              </>
            ) : (
              <Text style={styles.footerSub}>Choose stops to see the fare</Text>
            )}
          </View>
          <AppButton
            title="Continue"
            icon="arrow-right"
            onPress={handleContinue}
            disabled={fareLoading || !!fareError}
            accessibilityHint="Review the fare summary"
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  flex: {
    flex: 1,
  },
  gap: {
    marginBottom: 10,
  },
  step: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
    marginTop: 8,
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  muted: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  routeBadge: {
    minWidth: 46,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryDarkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 12,
  },
  routeBadgeText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  routeName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryText,
  },
  selectedRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tealTint,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1.5,
    borderColor: colors.tealCyan,
    paddingLeft: 12,
    paddingVertical: 6,
    marginBottom: 6,
  },
  selectedRouteName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
  },
  stopSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  stopBox: {
    flex: 1,
    paddingHorizontal: 4,
  },
  stopLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stopValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
    marginTop: 2,
  },
  placeholder: {
    color: colors.secondaryText,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 12,
    marginBottom: 8,
  },
  stepperLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.primaryText,
    fontWeight: '600',
  },
  stepperBtn: {
    width: theme.touch,
    height: theme.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDisabled: {
    opacity: 0.3,
  },
  stepperValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDarkNavy,
  },
  hScroll: {
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  footerLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footerFare: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDarkNavy,
  },
  footerSub: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  fareSpinner: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});

export default BuyTicketScreen;
