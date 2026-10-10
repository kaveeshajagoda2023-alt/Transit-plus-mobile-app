import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { colors, theme } from '../../theme';
import StatusBadge from '../../components/StatusBadge';
import CountdownRing from '../../components/CountdownRing';
import AppButton from '../../components/AppButton';
import Icon from '../../components/Icon';
import { Banner, ErrorState, LoadingView } from '../../components/Feedback';
import { useToast } from '../../context/ToastContext';
import { getQr, getTicket, rotateQr } from '../../services/ticketService';
import { formatDateTime, formatTime, passengerTypeLabel, routeLabel } from '../../utils/format';

const REFRESH_BEFORE_EXPIRY_S = 2; // fetch the next code slightly before the current one expires
const RETRY_AFTER_MS = 5000;

// Full-screen dynamic QR. The server signs a token that is only valid for 30 s,
// so the code shown here keeps changing and screenshots stop working.
const DigitalQRPassScreen = ({ route, navigation }) => {
  const toast = useToast();
  const ticketId = route?.params?.ticketId || route?.params?.ticket?._id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(ticketId ? null : 'No ticket data was provided.');
  const [qr, setQr] = useState(null); // { token, expiresAt, ttlSeconds }
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [stale, setStale] = useState(false);
  const [rotating, setRotating] = useState(false);

  const clockOffset = useRef(0); // server time - phone time, so the countdown matches the server
  const fetching = useRef(false);
  const lastFailure = useRef(0);
  const active = useRef(false);

  const loadTicketDetails = useCallback(async () => {
    try {
      const t = await getTicket(ticketId);
      setTicket(t);
      return t;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [ticketId]);

  const fetchQr = useCallback(
    async (rotate = false) => {
      if (fetching.current) return;
      fetching.current = true;
      try {
        const data = rotate ? await rotateQr(ticketId) : await getQr(ticketId);
        clockOffset.current = data.serverTime - Date.now();
        setQr(data);
        setStale(false);
        if (rotate) toast.show('New QR code generated. The previous one no longer works.', 'success');
      } catch (e) {
        lastFailure.current = Date.now();
        if (e.status === 409) {
          // Ticket is no longer ACTIVE (e.g. it was just scanned) - show its new status
          setQr(null);
          await loadTicketDetails();
        } else {
          setStale(true);
        }
      } finally {
        fetching.current = false;
      }
    },
    [ticketId, loadTicketDetails, toast]
  );

  // Initial load
  useEffect(() => {
    if (!ticketId) {
      setLoading(false);
      return;
    }
    (async () => {
      const t = await loadTicketDetails();
      if (t?.status === 'ACTIVE') await fetchQr();
      setLoading(false);
    })();
  }, [ticketId, loadTicketDetails, fetchQr]);

  // 1-second ticker: updates the ring and refreshes the code when it is about to expire.
  // Runs only while this screen is focused and the app is in the foreground.
  useFocusEffect(
    useCallback(() => {
      active.current = true;
      const tick = () => {
        if (!active.current || !qr) return;
        const left = Math.max(0, Math.ceil((qr.expiresAt - (Date.now() + clockOffset.current)) / 1000));
        setSecondsLeft(left);
        const canRetry = Date.now() - lastFailure.current > RETRY_AFTER_MS;
        if (left <= REFRESH_BEFORE_EXPIRY_S && canRetry) fetchQr();
      };
      tick();
      const timer = setInterval(tick, 1000);
      const sub = AppState.addEventListener('change', (state) => {
        active.current = state === 'active';
        if (state === 'active') fetchQr();
      });
      return () => {
        active.current = false;
        clearInterval(timer);
        sub.remove();
      };
    }, [qr, fetchQr])
  );

  if (loading) return <LoadingView message="Loading dynamic pass..." />;
  if (error || !ticket) return <ErrorState message={error || 'Ticket details could not be found'} onRetry={() => navigation.replace('DigitalQRPass', { ticketId })} />;

  const expired = qr && secondsLeft === 0;
  const isActive = ticket.status === 'ACTIVE';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {stale ? (
        <Banner
          type={expired ? 'error' : 'warning'}
          message={
            expired
              ? 'Offline: this QR code has expired and will be rejected. Reconnect to get a new code.'
              : 'Connection problem: could not refresh the QR code. Retrying...'
          }
          actionLabel="Retry"
          onAction={() => {
            lastFailure.current = 0;
            fetchQr();
          }}
        />
      ) : null}

      <View style={styles.passCard}>
        <View style={styles.passHeader}>
          <View style={styles.routeContainer}>
            <Text style={styles.passRouteLabel}>Route</Text>
            <Text style={styles.passRouteTitle}>{routeLabel(ticket.route)}</Text>
          </View>
          <StatusBadge status={ticket.status} />
        </View>

        <View style={styles.divider} />

        {isActive && qr ? (
          <View style={styles.qrWrapper}>
            <View
              style={[styles.qrFrame, expired && styles.qrExpired]}
              accessible
              accessibilityLabel={`QR code for ticket ${ticket.ticketNumber}. ${expired ? 'Expired, waiting for a new code.' : 'Show this to the conductor.'}`}
            >
              <QRCode value={qr.token} size={230} color={colors.primaryDarkNavy} backgroundColor={colors.white} ecl="M" />
              {expired ? (
                <View style={styles.expiredOverlay}>
                  <Icon name="refresh" size={32} color={colors.primaryDarkNavy} />
                  <Text style={styles.expiredText}>Refreshing code...</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.timerRow}>
              <CountdownRing secondsLeft={secondsLeft} total={qr.ttlSeconds} warning={stale || secondsLeft <= 5} size={58} />
              <View style={styles.timerText}>
                <Text style={styles.ticketIdText}>{ticket.ticketNumber}</Text>
                <Text style={styles.scanInstruction}>
                  Code changes every {qr.ttlSeconds} seconds. Screenshots will not work.
                </Text>
              </View>
            </View>
          </View>
        ) : isActive ? (
          <View style={styles.inactive}>
            <Icon name="wifi-off" size={40} color={colors.secondaryNavy} />
            <Text style={styles.inactiveTitle}>Could not load your QR code</Text>
            <AppButton
              title="Try again"
              icon="refresh"
              onPress={() => {
                lastFailure.current = 0;
                fetchQr();
              }}
              style={styles.payBtn}
            />
          </View>
        ) : (
          <View style={styles.inactive}>
            <Icon name={ticket.status === 'USED' ? 'check-double' : 'alert-circle'} size={40} color={colors.secondaryNavy} />
            <Text style={styles.inactiveTitle}>
              {ticket.status === 'USED'
                ? `Ticket used at ${formatTime(ticket.usedAt)}`
                : ticket.status === 'PENDING_PAYMENT'
                  ? 'Complete payment to get your QR code'
                  : 'This ticket can no longer be used'}
            </Text>
            {ticket.status === 'PENDING_PAYMENT' ? (
              <AppButton title="Pay now" icon="card" onPress={() => navigation.navigate('PassengerCheckout', { ticket })} style={styles.payBtn} />
            ) : null}
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: colors.tealCyan }]} />
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Boarding Point</Text>
              <Text style={styles.locationName}>{ticket.fromStop}</Text>
            </View>
          </View>
          <View style={styles.lineConnector} />
          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: colors.primaryDarkNavy }]} />
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Destination</Text>
              <Text style={styles.locationName}>{ticket.toStop}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Valid from</Text>
            <Text style={styles.infoValue}>{formatDateTime(ticket.validFrom)}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Valid until</Text>
            <Text style={styles.infoValue}>{formatDateTime(ticket.validUntil)}</Text>
          </View>
        </View>
        <View style={[styles.infoGrid, styles.infoGap]}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Passengers</Text>
            <Text style={styles.infoValue}>
              {ticket.passengers} × {passengerTypeLabel(ticket.passengerType)}
            </Text>
          </View>
        </View>
      </View>

      {isActive && qr ? (
        <AppButton
          title="Generate a new code"
          icon="refresh"
          variant="secondary"
          loading={rotating}
          onPress={async () => {
            setRotating(true);
            lastFailure.current = 0;
            await fetchQr(true);
            setRotating(false);
          }}
          accessibilityHint="Use this if someone may have copied your QR code"
          style={styles.rotate}
        />
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDarkNavy,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  passCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 18,
    ...theme.shadows.card,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routeContainer: {
    flex: 1,
    marginRight: 10,
  },
  passRouteLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  passRouteTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryDarkNavy,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  qrWrapper: {
    alignItems: 'center',
  },
  qrFrame: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.tealCyan,
    backgroundColor: colors.white,
  },
  qrExpired: {
    borderColor: colors.danger,
  },
  expiredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  expiredText: {
    marginTop: 6,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    alignSelf: 'stretch',
  },
  timerText: {
    flex: 1,
    marginLeft: 12,
  },
  ticketIdText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDarkNavy,
  },
  scanInstruction: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  inactive: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  inactiveTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
    marginTop: 10,
    textAlign: 'center',
  },
  payBtn: {
    marginTop: 14,
    alignSelf: 'stretch',
  },
  locationContainer: {
    paddingLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryText,
  },
  lineConnector: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  infoGrid: {
    flexDirection: 'row',
  },
  infoGap: {
    marginTop: 10,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    color: colors.primaryText,
    fontWeight: '600',
    marginTop: 2,
  },
  rotate: {
    marginTop: 16,
  },
});

export default DigitalQRPassScreen;
