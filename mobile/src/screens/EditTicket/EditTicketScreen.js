import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../../theme';
import { updateTicket } from '../../services/ticketService';
import { useToast } from '../../context/ToastContext';
import AppButton from '../../components/AppButton';
import Chip from '../../components/Chip';
import Icon from '../../components/Icon';
import { Banner } from '../../components/Feedback';
import { dayLabel, formatLKR, formatTime } from '../../utils/format';

const days = () =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });

const slotsFor = (day) => {
  const now = new Date();
  const isToday = day.toDateString() === now.toDateString();
  const start = isToday ? Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / 30) * 30 : 5 * 60;
  const out = [];
  for (let m = start; m <= 22 * 60; m += 30) {
    const d = new Date(day);
    d.setHours(Math.floor(m / 60), m % 60, 0, 0);
    out.push(d);
  }
  return out;
};

// Update a ticket: travel time (before use) and passenger count (before payment only)
const EditTicketScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { ticket } = route.params;
  const isPending = ticket.status === 'PENDING_PAYMENT';
  const dayList = useMemo(days, []);

  const original = new Date(ticket.travelDate);
  const [day, setDay] = useState(dayList.find((d) => d.toDateString() === original.toDateString()) || dayList[0]);
  const [time, setTime] = useState(null); // null = keep current time
  const [passengers, setPassengers] = useState(ticket.passengers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const slots = slotsFor(day);
  const changed = time !== null || passengers !== ticket.passengers;

  const handleSave = async () => {
    const body = {};
    if (time) body.travelDate = time.toISOString();
    if (passengers !== ticket.passengers) body.passengers = passengers;
    setLoading(true);
    setError(null);
    try {
      const res = await updateTicket(ticket._id, body);
      toast.show(res.message, 'success');
      navigation.goBack();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Banner type="error" message={error} /> : null}
        <View style={styles.current}>
          <Icon name="calendar" size={18} color={colors.tealText} />
          <Text style={styles.currentText}>
            Currently {dayLabel(original)} at {formatTime(original)} · {ticket.passengers} passenger(s)
          </Text>
        </View>

        <Text style={styles.sectionTitle}>New travel date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dayList.map((d) => (
            <Chip
              key={d.toISOString()}
              label={dayLabel(d)}
              selected={d.getTime() === day.getTime()}
              onPress={() => {
                setDay(d);
                setTime(null);
              }}
            />
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>New departure time</Text>
        {slots.length === 0 ? (
          <Text style={styles.muted}>No more departures today. Choose another day.</Text>
        ) : (
          <View style={styles.wrap}>
            {slots.map((s) => (
              <Chip key={s.toISOString()} label={formatTime(s)} selected={time?.getTime() === s.getTime()} onPress={() => setTime(s)} />
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Passengers</Text>
        {isPending ? (
          <View style={styles.stepper}>
            <Text style={styles.stepperLabel}>
              {passengers} × {formatLKR(ticket.unitFare)} = {formatLKR(passengers * ticket.unitFare)}
            </Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setPassengers((p) => Math.max(1, p - 1))}
              accessibilityRole="button"
              accessibilityLabel="Remove a passenger"
            >
              <Icon name="minus" size={20} color={colors.primaryDarkNavy} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{passengers}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setPassengers((p) => Math.min(10, p + 1))}
              accessibilityRole="button"
              accessibilityLabel="Add a passenger"
            >
              <Icon name="plus" size={20} color={colors.primaryDarkNavy} />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.muted}>
            The passenger count can't change after payment. Cancel and rebook if you need more seats.
          </Text>
        )}

        {!isPending ? (
          <Text style={styles.note}>Changing the time issues a new QR code. Any saved screenshot will stop working.</Text>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton title="Save changes" icon="check" onPress={handleSave} loading={loading} disabled={!changed} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  current: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tealTint,
    borderRadius: theme.borderRadius.button,
    padding: 12,
  },
  currentText: {
    flex: 1,
    marginLeft: 8,
    color: colors.primaryText,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
    marginTop: 16,
    marginBottom: 8,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muted: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 12,
  },
  stepperLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.primaryText,
  },
  stepperBtn: {
    width: theme.touch,
    height: theme.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDarkNavy,
  },
  note: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 16,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

export default EditTicketScreen;
