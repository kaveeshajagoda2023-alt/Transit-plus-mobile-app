/**
 * Member 2 — shared building blocks for the ticketing screens.
 * Styled with the team's TransitColors / TransitShadows so the module matches
 * the rest of TransitPulse.
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';
import { TicketStatus, TICKET_STATUS_LABELS } from '@/types/ticketing';
import { ticketingApi } from '@/services/api/ticketingApi';
import { formatDay, formatTime } from '@/services/ticketing/format';

/* ---------- Header ---------- */

export function TicketingHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onBack || (() => (router.canGoBack() ? router.back() : router.replace('/tickets' as any)))}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={20} color={TransitColors.primary} />
      </TouchableOpacity>
      <View style={styles.headerTitles}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

/* ---------- Offline banner ---------- */

export function OfflineBanner() {
  const [offline, setOffline] = useState(ticketingApi.isOfflineMode());
  const [checking, setChecking] = useState(false);

  useEffect(() => ticketingApi.onOfflineModeChange(setOffline), []);

  if (!offline) return null;
  return (
    <View style={styles.offlineBanner} accessibilityRole="alert">
      <Feather name="wifi-off" size={14} color="#92400E" />
      <Text style={styles.offlineText}>Server offline — demo mode. Tickets are saved on this phone only.</Text>
      <TouchableOpacity
        onPress={async () => {
          setChecking(true);
          await ticketingApi.reconnect();
          setChecking(false);
        }}
        accessibilityRole="button"
        accessibilityLabel="Retry connecting to server"
      >
        {checking ? <ActivityIndicator size="small" color="#92400E" /> : <Text style={styles.offlineRetry}>Retry</Text>}
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Status pill ---------- */

const STATUS_COLORS: Record<TicketStatus, { bg: string; fg: string }> = {
  PENDING_PAYMENT: { bg: TransitColors.etaPeachBg, fg: TransitColors.etaPeachText },
  ACTIVE: { bg: TransitColors.onTimeBg, fg: TransitColors.onTimeText },
  USED: { bg: TransitColors.offlineBg, fg: TransitColors.offlineText },
  EXPIRED: { bg: TransitColors.offlineBg, fg: TransitColors.offlineText },
  CANCELLED: { bg: TransitColors.delayedBg, fg: TransitColors.delayedText },
};

export function StatusPill({ status }: { status: TicketStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <View style={[styles.pillDot, { backgroundColor: c.fg }]} />
      <Text style={[styles.pillText, { color: c.fg }]}>{TICKET_STATUS_LABELS[status]}</Text>
    </View>
  );
}

/* ---------- Card & section ---------- */

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

/* ---------- Buttons ---------- */

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  variant = 'primary',
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentProps<typeof Feather>['name'];
  variant?: 'primary' | 'outline' | 'danger';
  accessibilityHint?: string;
}) {
  const isOutline = variant === 'outline';
  const color = isOutline ? TransitColors.primary : '#FFFFFF';
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        isOutline && styles.buttonOutline,
        variant === 'danger' && styles.buttonDanger,
        (disabled || loading) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={17} color={color} /> : null}
          <Text style={[styles.buttonText, { color }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/* ---------- Chips ---------- */

export function Chip({
  label,
  selected,
  onPress,
  sublabel,
  disabled,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  sublabel?: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected, disabled && styles.chipDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
      {sublabel ? <Text style={[styles.chipSub, selected && styles.chipSubSelected]}>{sublabel}</Text> : null}
    </TouchableOpacity>
  );
}

/* ---------- Passenger stepper ---------- */

export function Stepper({
  value,
  min = 1,
  max = 10,
  onChange,
  label,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <View style={styles.stepper} accessibilityLabel={`${label}: ${value}`}>
      <TouchableOpacity
        style={[styles.stepBtn, value <= min && styles.stepBtnDisabled]}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
      >
        <Feather name="minus" size={18} color={value <= min ? TransitColors.textMuted : TransitColors.primary} />
      </TouchableOpacity>
      <Text style={styles.stepValue}>{value}</Text>
      <TouchableOpacity
        style={[styles.stepBtn, value >= max && styles.stepBtnDisabled]}
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
      >
        <Feather name="plus" size={18} color={value >= max ? TransitColors.textMuted : TransitColors.primary} />
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Travel date & time picker ---------- */

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

const FIRST_SLOT_MIN = 5 * 60; // 05:00
const LAST_SLOT_MIN = 23 * 60 + 30; // 23:30

/** The next bookable 30-minute departure slot (today, or tomorrow morning). */
export function firstAvailableSlot(from = Date.now()): Date {
  const d = new Date(from);
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60);
  const mins = d.getHours() * 60 + d.getMinutes();
  if (mins < FIRST_SLOT_MIN) d.setHours(5, 0, 0, 0);
  else if (mins > LAST_SLOT_MIN || d.getDate() !== new Date(from).getDate()) {
    const t = new Date(from);
    t.setDate(t.getDate() + 1);
    t.setHours(5, 0, 0, 0);
    return t;
  }
  return d;
}

/** Day chips for the next 7 days plus 30-minute time slots (05:00 – 23:30). Past slots are hidden. */
export function TravelTimePicker({ value, onChange }: { value: Date | null; onChange: (d: Date) => void }) {
  // Snapshot of "now" taken when the picker mounts (keeps render pure)
  const [now] = useState(() => Date.now());
  const today = startOfDay(new Date(now));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const selectedDay = value ? startOfDay(value) : today;

  const slots: Date[] = [];
  for (let mins = FIRST_SLOT_MIN; mins <= LAST_SLOT_MIN; mins += 30) {
    const s = new Date(selectedDay);
    s.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
    if (s.getTime() > now) slots.push(s);
  }

  const pickDay = (d: Date) => {
    const base = value ? new Date(value) : new Date(now);
    const next = new Date(d);
    next.setHours(base.getHours(), base.getMinutes() - (base.getMinutes() % 30), 0, 0);
    if (next.getTime() <= now) {
      // Move to the first future slot on that day
      const first = new Date(d);
      first.setHours(5, 0, 0, 0);
      while (first.getTime() <= now) first.setMinutes(first.getMinutes() + 30);
      onChange(first);
    } else {
      onChange(next);
    }
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {days.map((d) => (
          <Chip
            key={d.toISOString()}
            label={formatDay(d)}
            selected={selectedDay.getTime() === d.getTime()}
            onPress={() => pickDay(d)}
          />
        ))}
      </ScrollView>
      {slots.length === 0 ? (
        <Text style={styles.emptySlots}>No more departures today — pick another day.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chipRow, { marginTop: 8 }]}>
          {slots.map((s) => (
            <Chip
              key={s.toISOString()}
              label={formatTime(s)}
              selected={!!value && value.getTime() === s.getTime()}
              onPress={() => onChange(s)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

/* ---------- Misc ---------- */

export function InfoRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, strong && styles.infoValueStrong]}>{value}</Text>
    </View>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.errorBanner} accessibilityRole="alert">
      <Feather name="alert-circle" size={16} color={TransitColors.delayedText} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function RouteBadge({ routeNumber, type }: { routeNumber: string; type: 'bus' | 'train' }) {
  return (
    <View style={[styles.routeBadge, { backgroundColor: type === 'train' ? TransitColors.trainBadge : TransitColors.busBadge }]}>
      <MaterialCommunityIcons name={type === 'train' ? 'train' : 'bus'} size={13} color="#FFFFFF" />
      <Text style={styles.routeBadgeText}>{routeNumber}</Text>
    </View>
  );
}

export const ticketingStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: TransitColors.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: TransitColors.background,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: TransitColors.cardBackground,
    borderWidth: 1,
    borderColor: TransitColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: { flex: 1, marginHorizontal: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: TransitColors.primary },
  headerSubtitle: { fontSize: 12, color: TransitColors.textSecondary, marginTop: 1 },
  headerRight: { minWidth: 40, alignItems: 'flex-end' },

  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  offlineText: { flex: 1, fontSize: 12, color: '#92400E', fontWeight: '600' },
  offlineRetry: { fontSize: 12, color: '#92400E', fontWeight: '800', textDecorationLine: 'underline' },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },

  card: {
    backgroundColor: TransitColors.cardBackground,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: TransitColors.borderLight,
    ...TransitShadows.card,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: TransitColors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  button: {
    minHeight: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  buttonPrimary: { backgroundColor: TransitColors.primary },
  buttonOutline: { backgroundColor: TransitColors.cardBackground, borderWidth: 1.5, borderColor: TransitColors.primary },
  buttonDanger: { backgroundColor: TransitColors.delayedText },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { fontSize: 15, fontWeight: '800' },

  chipRow: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: TransitColors.cardBackground,
    borderWidth: 1.5,
    borderColor: TransitColors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: TransitColors.primary, borderColor: TransitColors.primary },
  chipDisabled: { opacity: 0.4 },
  chipText: { fontSize: 13, fontWeight: '700', color: TransitColors.textPrimary },
  chipTextSelected: { color: '#FFFFFF' },
  chipSub: { fontSize: 11, color: TransitColors.textSecondary, marginTop: 2 },
  chipSubSelected: { color: '#CBD5E1' },
  emptySlots: { fontSize: 13, color: TransitColors.textSecondary, marginTop: 10 },

  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: TransitColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TransitColors.cardBackground,
  },
  stepBtnDisabled: { backgroundColor: TransitColors.borderLight },
  stepValue: { fontSize: 20, fontWeight: '800', color: TransitColors.primary, minWidth: 24, textAlign: 'center' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: 12 },
  infoLabel: { fontSize: 13, color: TransitColors.textSecondary, flexShrink: 0 },
  infoValue: { fontSize: 13, color: TransitColors.textPrimary, fontWeight: '600', flex: 1, textAlign: 'right' },
  infoValueStrong: { fontSize: 16, fontWeight: '800', color: TransitColors.primary },

  errorBanner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: TransitColors.delayedBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 13, color: TransitColors.delayedText, fontWeight: '600', lineHeight: 18 },

  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  routeBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
});
