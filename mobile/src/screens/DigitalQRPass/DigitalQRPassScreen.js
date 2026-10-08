import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, theme } from '../../theme';
import StatusBadge from '../../components/StatusBadge';
import { getTicketById } from '../../services/api';

const DigitalQRPassScreen = ({ route, navigation }) => {
  // Extract ticket passed from PassengerCheckoutScreen or TicketHistoryScreen
  const initialTicket = route?.params?.ticket;
  const ticketIdParam = route?.params?.ticketId;

  const [ticket, setTicket] = useState(initialTicket || null);
  const [loading, setLoading] = useState(!initialTicket && !!ticketIdParam);
  const [error, setError] = useState(
    !initialTicket && !ticketIdParam ? 'No ticket data was provided.' : null
  );

  useEffect(() => {
    if (!ticket && ticketIdParam) {
      loadTicketDetails(ticketIdParam);
    }
  }, [ticketIdParam]);

  const loadTicketDetails = async (id) => {
    if (!id) {
      setError('No ticket data was provided.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await getTicketById(id);
      if (res && res.success && res.ticket) {
        setTicket(res.ticket);
      } else {
        setError('Ticket details could not be found');
      }
    } catch (err) {
      console.error('[DigitalQRPass Error]:', err);
      setError('Failed to fetch ticket data');
    } finally {
      setLoading(false);
    }
  };

  const activeTicket = ticket;

  const qrValueString = activeTicket?.qrData || activeTicket?.ticketId;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Banner */}
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Digital QR Transit Pass</Text>
        <Text style={styles.screenSubtitle}>Scan this pass at validator gates or showing to inspector</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tealCyan} />
          <Text style={styles.loadingText}>Loading dynamic pass...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadTicketDetails(ticketIdParam)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.passCard}>
          {/* Card Top Row: Route & Status Badge */}
          <View style={styles.passHeader}>
            <View style={styles.routeContainer}>
              <Text style={styles.passRouteLabel}>Route</Text>
              <Text style={styles.passRouteTitle}>{activeTicket.route}</Text>
            </View>
            <StatusBadge status={activeTicket.ticketStatus} />
          </View>

          <View style={styles.divider} />

          {/* Dynamic QR Code Render Container */}
          <View style={styles.qrWrapper}>
            <View style={styles.qrFrame}>
              <QRCode
                value={qrValueString}
                size={180}
                color={colors.primaryDarkNavy}
                backgroundColor={colors.white}
              />
            </View>
            <Text style={styles.ticketIdText}>Ticket ID: {activeTicket.ticketId}</Text>
            <Text style={styles.scanInstruction}>Dynamic Verification Payload Encoded</Text>
          </View>

          <View style={styles.divider} />

          {/* Boarding and Destination Details */}
          <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <View style={[styles.dot, { backgroundColor: colors.tealCyan }]} />
              <View style={styles.locationDetails}>
                <Text style={styles.locationLabel}>Boarding Point</Text>
                <Text style={styles.locationName}>{activeTicket.boardingPoint}</Text>
              </View>
            </View>

            <View style={styles.lineConnector} />

            <View style={styles.locationRow}>
              <View style={[styles.dot, { backgroundColor: colors.activeCyan }]} />
              <View style={styles.locationDetails}>
                <Text style={styles.locationLabel}>Destination</Text>
                <Text style={styles.locationName}>{activeTicket.destination}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Ticket Information Breakdown */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Travel Date</Text>
              <Text style={styles.infoValue}>{activeTicket.travelDate}</Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{activeTicket.travelTime}</Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Fare Paid</Text>
              <Text style={[styles.infoValue, { color: colors.tealCyan, fontWeight: '700' }]}>
                ${Number(activeTicket.fare).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.navigate('Tickets')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryActionText}>View in Ticket History 🎫</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryActionButton}
          onPress={() => navigation.navigate('MainTabs')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryActionText}>Back to Home</Text>
        </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.secondaryText,
  },
  errorContainer: {
    backgroundColor: '#FCE8E6',
    padding: 16,
    borderRadius: theme.borderRadius.card,
    alignItems: 'center',
  },
  errorText: {
    color: '#C5221F',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.primaryDarkNavy,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
  passCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    textTransform: 'uppercase',
  },
  passRouteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
    paddingVertical: 10,
  },
  qrFrame: {
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.tealCyan,
    shadowColor: colors.primaryDarkNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  ticketIdText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDarkNavy,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  scanInstruction: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 4,
  },
  locationContainer: {
    paddingVertical: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  lineConnector: {
    width: 2,
    height: 18,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  locationName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
    marginTop: 2,
  },
  actionContainer: {
    gap: 10,
  },
  primaryActionButton: {
    backgroundColor: colors.tealCyan,
    borderRadius: theme.borderRadius.button,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  secondaryActionButton: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.button,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryActionText: {
    color: colors.primaryDarkNavy,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DigitalQRPassScreen;
