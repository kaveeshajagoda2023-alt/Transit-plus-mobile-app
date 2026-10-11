import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Rect } from 'react-native-svg';
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
  FontAwesome5,
} from '@expo/vector-icons';
import { Header } from '@/components/passenger/Header';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface PassengerTicket {
  id: string;
  ticketNumber: string;
  routeId: string;
  routeName: string;
  transportType: 'Bus' | 'Train';
  passengerType: 'Adult' | 'Student' | 'Senior/Concession';
  passengerCount: number;
  fromStop: string;
  toStop: string;
  travelDate: string;
  travelTime: string;
  totalFare: number;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  bookingReference: string;
  paymentMethod: string;
  transactionId: string;
  qrToken?: string;
  expiresInMinutes?: number;
}

// Unified Ticket Database aligned with Member 3 Scanner & Member 4 Audit
const INITIAL_TICKETS: PassengerTicket[] = [
  {
    id: 't-1',
    ticketNumber: 'TK-9021',
    routeId: 'Route 42',
    routeName: 'Line 42 Eastbound (Central to University)',
    transportType: 'Bus',
    passengerType: 'Adult',
    passengerCount: 1,
    fromStop: 'Market St & 4th',
    toStop: 'University Malabe Campus',
    travelDate: 'Today',
    travelTime: '09:15 AM',
    totalFare: 65.0,
    status: 'ACTIVE',
    bookingReference: 'MTA-BK-90214',
    paymentMethod: 'MetroPay Wallet',
    transactionId: 'TXN-884028-091',
    expiresInMinutes: 45,
  },
  {
    id: 't-2',
    ticketNumber: 'TK-9055',
    routeId: 'Route 42',
    routeName: 'Route 42 All-Day Transit Pass',
    transportType: 'Bus',
    passengerType: 'Adult',
    passengerCount: 1,
    fromStop: 'Downtown Terminal',
    toStop: 'Metro Outer Ring',
    travelDate: 'Today',
    travelTime: '08:00 AM',
    totalFare: 150.0,
    status: 'ACTIVE',
    bookingReference: 'MTA-BK-90559',
    paymentMethod: 'TransitPulse App Pay',
    transactionId: 'TXN-884028-055',
    expiresInMinutes: 180,
  },
  {
    id: 't-3',
    ticketNumber: 'TK-9018',
    routeId: 'Route 42',
    routeName: 'Line 42 Student Concession',
    transportType: 'Bus',
    passengerType: 'Senior/Concession',
    passengerCount: 1,
    fromStop: '3rd & Pine',
    toStop: 'Malabe Center',
    travelDate: 'Today',
    travelTime: '08:45 AM',
    totalFare: 35.0,
    status: 'ACTIVE',
    bookingReference: 'MTA-BK-90180',
    paymentMethod: 'Concession Transit Card',
    transactionId: 'TXN-884028-084',
    expiresInMinutes: 75,
  },
  {
    id: 't-4',
    ticketNumber: 'TK-7740',
    routeId: 'Route 42',
    routeName: 'Line 42 City Commuter',
    transportType: 'Bus',
    passengerType: 'Adult',
    passengerCount: 1,
    fromStop: '3rd & Pine',
    toStop: 'University Junction',
    travelDate: 'Yesterday',
    travelTime: '05:30 PM',
    totalFare: 65.0,
    status: 'USED',
    bookingReference: 'MTA-BK-77409',
    paymentMethod: 'Apple Pay NFC',
    transactionId: 'TXN-774011-DUP',
  },
  {
    id: 't-5',
    ticketNumber: 'TK-9827',
    routeId: 'Route 18',
    routeName: 'Route 18 Metro Express Train',
    transportType: 'Train',
    passengerType: 'Adult',
    passengerCount: 2,
    fromStop: 'Fort Railway Station',
    toStop: 'Maradana Central Interchange',
    travelDate: '10 Oct 2026',
    travelTime: '02:15 PM',
    totalFare: 120.0,
    status: 'USED',
    bookingReference: 'MTA-BK-98271',
    paymentMethod: 'Visa Card •••• 4092',
    transactionId: 'TXN-982700-EXP',
  },
  {
    id: 't-6',
    ticketNumber: 'TK-8832',
    routeId: 'Route 42',
    routeName: 'Line 42 Single Pass',
    transportType: 'Bus',
    passengerType: 'Adult',
    passengerCount: 1,
    fromStop: 'South Transit Line',
    toStop: 'Market St & 4th',
    travelDate: '09 Oct 2026',
    travelTime: '11:00 AM',
    totalFare: 65.0,
    status: 'EXPIRED',
    bookingReference: 'MTA-BK-88321',
    paymentMethod: 'Unverified Farebox',
    transactionId: 'TXN-EXPIRED-883',
  },
];

const AVAILABLE_ROUTES = [
  {
    id: 'Route 42',
    name: 'Line 42 Eastbound (Central to University)',
    type: 'Bus' as const,
    baseFare: 65.0,
    stops: ['Market Square', '5th & Mission', 'Market St & 4th', 'Malabe Center', 'University Malabe Campus'],
  },
  {
    id: 'Route 18',
    name: 'Route 18 Express Metro Train',
    type: 'Train' as const,
    baseFare: 120.0,
    stops: ['Fort Main Station', 'Maradana Junction', 'Dematagoda', 'Kelaniya Highspeed Depot'],
  },
  {
    id: 'Route 105',
    name: 'Route 105 BRT Rapid Transit',
    type: 'Bus' as const,
    baseFare: 80.0,
    stops: ['Pettah Central Hub', 'Town Hall', 'Bambalapitiya Junction', 'Nugegoda High-Level Terminal'],
  },
];

/**
 * Procedural Dynamic QR Code Matrix Generator
 * Creates an authentic 21x21 QR barcode with 3 standard finder corners and deterministic data cells.
 */
function generateQrGrid(seed: string, size = 21): boolean[][] {
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to draw a standard 7x7 Finder Pattern at (row, col)
  const drawFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[startRow + r][startCol + c] = true;
        } else {
          grid[startRow + r][startCol + c] = false;
        }
      }
    }
  };

  // 1. Top-Left Finder
  drawFinder(0, 0);
  // 2. Top-Right Finder
  drawFinder(0, size - 7);
  // 3. Bottom-Left Finder
  drawFinder(size - 7, 0);

  // 4. Timing lines (row 6 and col 6)
  for (let i = 7; i < size - 7; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // 5. Fill remaining data cells pseudo-randomly using hash of seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinderTL = r < 8 && c < 8;
      const inFinderTR = r < 8 && c >= size - 8;
      const inFinderBL = r >= size - 8 && c < 8;
      const isTiming = r === 6 || c === 6;

      if (!inFinderTL && !inFinderTR && !inFinderBL && !isTiming) {
        hash = (hash * 1664525 + 1013904223) >>> 0;
        grid[r][c] = (hash % 100) < 46;
      }
    }
  }

  return grid;
}

// Vector QR Component
const DynamicQrSvg = ({
  seed,
  size = 140,
  darkColor = '#0F2942',
  lightColor = '#FFFFFF',
}: {
  seed: string;
  size?: number;
  darkColor?: string;
  lightColor?: string;
}) => {
  const matrixSize = 21;
  const grid = useMemo(() => generateQrGrid(seed, matrixSize), [seed]);
  const cellSize = size / matrixSize;

  return (
    <View style={{ width: size, height: size, backgroundColor: lightColor, padding: 4, borderRadius: 8 }}>
      <Svg width={size - 8} height={size - 8} viewBox={`0 0 ${size} ${size}`}>
        <Rect x={0} y={0} width={size} height={size} fill={lightColor} />
        {grid.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <Rect
                key={`qr-${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.3}
                height={cellSize + 0.3}
                fill={darkColor}
              />
            ) : null
          )
        )}
      </Svg>
    </View>
  );
};

export default function TicketsTabScreen() {
  const [tickets, setTickets] = useState<PassengerTicket[]>(INITIAL_TICKETS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'USED' | 'EXPIRED'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<PassengerTicket | null>(null);
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState<PassengerTicket | null>(null);
  const [isBuyModalVisible, setIsBuyModalVisible] = useState(false);

  // Dynamic QR Token Rotation (FR-03 requirement: 30s auto-refresh)
  const [qrCountdown, setQrCountdown] = useState(30);
  const [dynamicTokenSeed, setDynamicTokenSeed] = useState(`TOKEN-${Date.now()}`);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Purchase Form State
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [fromStop, setFromStop] = useState(AVAILABLE_ROUTES[0].stops[0]);
  const [toStop, setToStop] = useState(AVAILABLE_ROUTES[0].stops[AVAILABLE_ROUTES[0].stops.length - 1]);
  const [passengerType, setPassengerType] = useState<'Adult' | 'Student' | 'Senior/Concession'>('Adult');
  const [passengerCount, setPassengerCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'MetroPay Wallet' | 'Saved Card' | 'Cash on Board'>('MetroPay Wallet');

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          setDynamicTokenSeed(`HMAC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update stops when route changes in buy modal
  const handleRouteChange = (idx: number) => {
    setSelectedRouteIndex(idx);
    const r = AVAILABLE_ROUTES[idx];
    setFromStop(r.stops[0]);
    setToStop(r.stops[r.stops.length - 1]);
  };

  // Toast feedback helper
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Active tickets
  const activeTickets = useMemo(() => tickets.filter((t) => t.status === 'ACTIVE'), [tickets]);
  const primaryHeroTicket = activeTickets.length > 0 ? activeTickets[0] : null;

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'ACTIVE' && ticket.status === 'ACTIVE') ||
        (activeFilter === 'USED' && ticket.status === 'USED') ||
        (activeFilter === 'EXPIRED' && ticket.status === 'EXPIRED');

      const matchesSearch =
        searchQuery.trim() === '' ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.fromStop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.toStop.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [tickets, activeFilter, searchQuery]);

  // Calculate live fare for buy modal
  const calculatedFare = useMemo(() => {
    const base = AVAILABLE_ROUTES[selectedRouteIndex].baseFare;
    let multiplier = 1.0;
    if (passengerType === 'Student') multiplier = 0.5;
    if (passengerType === 'Senior/Concession') multiplier = 0.6;
    return Math.round(base * multiplier * passengerCount);
  }, [selectedRouteIndex, passengerType, passengerCount]);

  // Handle Ticket Purchase
  const handleConfirmPurchase = () => {
    const route = AVAILABLE_ROUTES[selectedRouteIndex];
    const newId = `t-${Date.now()}`;
    const generatedTicketNumber = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: PassengerTicket = {
      id: newId,
      ticketNumber: generatedTicketNumber,
      routeId: route.id,
      routeName: route.name,
      transportType: route.type,
      passengerType,
      passengerCount,
      fromStop,
      toStop,
      travelDate: 'Today',
      travelTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalFare: calculatedFare,
      status: 'ACTIVE',
      bookingReference: `MTA-BK-${generatedTicketNumber.replace('TK-', '')}9`,
      paymentMethod,
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}-PAY`,
      expiresInMinutes: 60,
    };

    setTickets([newTicket, ...tickets]);
    setIsBuyModalVisible(false);
    showToast(`Pass ${newTicket.ticketNumber} issued successfully! Active for travel.`);
    setSelectedTicketForQR(newTicket);
  };

  // Handle Cancel Ticket (with refund preview)
  const handleCancelTicket = (ticket: PassengerTicket) => {
    Alert.alert(
      'Cancel Ticket & Refund Preview',
      `Cancel pass ${ticket.ticketNumber} for ${ticket.fromStop} → ${ticket.toStop}?\n\nRefund Policy: 100% refund (LKR ${ticket.totalFare.toFixed(2)}) returned immediately to ${ticket.paymentMethod}.`,
      [
        { text: 'Keep Ticket', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: () => {
            setTickets((prev) =>
              prev.map((t) => (t.id === ticket.id ? { ...t, status: 'CANCELLED' as const } : t))
            );
            setSelectedTicketForDetails(null);
            showToast(`Ticket ${ticket.ticketNumber} cancelled. Refund credited.`);
          },
        },
      ]
    );
  };

  // Handle Rebook
  const handleRebook = (ticket: PassengerTicket) => {
    const routeIdx = AVAILABLE_ROUTES.findIndex((r) => r.id === ticket.routeId);
    if (routeIdx !== -1) {
      setSelectedRouteIndex(routeIdx);
      setFromStop(ticket.fromStop);
      setToStop(ticket.toStop);
      setPassengerCount(ticket.passengerCount);
      setIsBuyModalVisible(true);
    } else {
      setIsBuyModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <Header
        onMenuPress={() => {
          Alert.alert('Transit Services', 'Need immediate support with tickets or fare disputes?', [
            { text: 'Conductor Portal Scan Info', onPress: () => router.push('/staff/scanner' as any) },
            { text: 'Close', style: 'cancel' },
          ]);
        }}
        onSearchPress={() => router.push('/passenger/route-search' as any)}
      />

      {/* Floating Toast Notification */}
      {feedbackToast && (
        <View style={styles.toastContainer}>
          <Feather name="check-circle" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{feedbackToast.message}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Action Header */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.screenTitle}>My Tickets & Passes</Text>
            <Text style={styles.screenSubtitle}>
              Dynamic QR passes for turnstile & conductor scanning
            </Text>
          </View>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => setIsBuyModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.buyButtonText}>Buy Pass</Text>
          </TouchableOpacity>
        </View>

        {/* HERO SECTION: ACTIVE PASS CARD WITH DYNAMIC QR */}
        {primaryHeroTicket ? (
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroBadgeRow}>
                <View style={styles.liveIndicatorDot} />
                <Text style={styles.heroBadgeText}>ACTIVE TRANSIT PASS</Text>
              </View>
              <Text style={styles.heroTicketNum}>{primaryHeroTicket.ticketNumber}</Text>
            </View>

            <View style={styles.heroRouteRow}>
              <View style={styles.heroIconBox}>
                <Ionicons
                  name={primaryHeroTicket.transportType === 'Train' ? 'train' : 'bus'}
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.heroRouteName} numberOfLines={1}>
                  {primaryHeroTicket.routeName}
                </Text>
                <Text style={styles.heroStopsText}>
                  {primaryHeroTicket.fromStop}  ➔  {primaryHeroTicket.toStop}
                </Text>
              </View>
            </View>

            {/* Dynamic QR & Countdown Container */}
            <View style={styles.qrDisplayBox}>
              <TouchableOpacity
                onPress={() => setSelectedTicketForQR(primaryHeroTicket)}
                activeOpacity={0.9}
                style={styles.qrPressArea}
              >
                <DynamicQrSvg
                  seed={`${primaryHeroTicket.ticketNumber}-${dynamicTokenSeed}`}
                  size={135}
                  darkColor={TransitColors.primaryDark}
                />
                <View style={styles.tapToExpandBadge}>
                  <Feather name="maximize-2" size={12} color="#0F2942" />
                  <Text style={styles.tapToExpandText}>Tap for Fullscreen QR</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.qrInfoCol}>
                <View style={styles.timerBadge}>
                  <Feather name="shield" size={14} color="#059669" />
                  <Text style={styles.timerBadgeText}>HMAC Cryptographic Pass</Text>
                </View>

                <Text style={styles.countdownValue}>{qrCountdown}s</Text>
                <Text style={styles.countdownLabel}>Auto-refreshes to prevent fraud</Text>

                <TouchableOpacity
                  style={styles.refreshCodeBtn}
                  onPress={() => {
                    setDynamicTokenSeed(`HMAC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
                    setQrCountdown(30);
                    showToast('Token refreshed manually.');
                  }}
                >
                  <Ionicons name="refresh" size={14} color="#0F2942" />
                  <Text style={styles.refreshCodeBtnText}>Force Rotate</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Hero Card Footer */}
            <View style={styles.heroFooter}>
              <View>
                <Text style={styles.heroMetaLabel}>PASSENGERS</Text>
                <Text style={styles.heroMetaVal}>
                  {primaryHeroTicket.passengerCount} × {primaryHeroTicket.passengerType}
                </Text>
              </View>
              <View>
                <Text style={styles.heroMetaLabel}>FARE PAID</Text>
                <Text style={styles.heroMetaVal}>LKR {primaryHeroTicket.totalFare.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.heroDetailsBtn}
                onPress={() => setSelectedTicketForDetails(primaryHeroTicket)}
              >
                <Text style={styles.heroDetailsBtnText}>Details</Text>
                <Feather name="chevron-right" size={14} color="#1E293B" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyHeroCard}>
            <MaterialCommunityIcons name="ticket-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyHeroTitle}>No Active Tickets</Text>
            <Text style={styles.emptyHeroSub}>
              Purchase a digital ticket or pass to travel seamlessly across the transit network.
            </Text>
            <TouchableOpacity
              style={styles.emptyBuyBtn}
              onPress={() => setIsBuyModalVisible(true)}
            >
              <Text style={styles.emptyBuyBtnText}>Buy Ticket Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SEARCH AND FILTER SECTION */}
        <View style={styles.filterSection}>
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by ticket # or route..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {(['ALL', 'ACTIVE', 'USED', 'EXPIRED'] as const).map((filterKey) => {
              const isSelected = activeFilter === filterKey;
              const count =
                filterKey === 'ALL'
                  ? tickets.length
                  : tickets.filter((t) => t.status === filterKey).length;

              return (
                <TouchableOpacity
                  key={filterKey}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setActiveFilter(filterKey)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {filterKey.charAt(0) + filterKey.slice(1).toLowerCase()} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* TICKETS LIST */}
        <View style={styles.ticketsListContainer}>
          <Text style={styles.sectionHeader}>
            {activeFilter === 'ALL' ? 'All Tickets' : `${activeFilter.charAt(0) + activeFilter.slice(1).toLowerCase()} Tickets`} ({filteredTickets.length})
          </Text>

          {filteredTickets.length === 0 ? (
            <View style={styles.noResultsBox}>
              <Feather name="inbox" size={36} color="#CBD5E1" />
              <Text style={styles.noResultsText}>No tickets match the selected filter</Text>
            </View>
          ) : (
            filteredTickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketItemCard}
                onPress={() => setSelectedTicketForDetails(ticket)}
                activeOpacity={0.88}
              >
                {/* Header: Route & Status Badge */}
                <View style={styles.itemCardHeader}>
                  <View style={styles.itemRouteInfo}>
                    <View
                      style={[
                        styles.itemTypeBadge,
                        ticket.transportType === 'Train' ? styles.trainBadgeBg : styles.busBadgeBg,
                      ]}
                    >
                      <Ionicons
                        name={ticket.transportType === 'Train' ? 'train' : 'bus'}
                        size={12}
                        color="#FFFFFF"
                      />
                      <Text style={styles.itemTypeBadgeText}>{ticket.routeId}</Text>
                    </View>
                    <Text style={styles.itemTicketNum}>{ticket.ticketNumber}</Text>
                  </View>

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusPill,
                      ticket.status === 'ACTIVE'
                        ? styles.statusActive
                        : ticket.status === 'USED'
                        ? styles.statusUsed
                        : styles.statusExpired,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        ticket.status === 'ACTIVE'
                          ? styles.statusActiveText
                          : ticket.status === 'USED'
                          ? styles.statusUsedText
                          : styles.statusExpiredText,
                      ]}
                    >
                      {ticket.status}
                    </Text>
                  </View>
                </View>

                {/* Stoppage Route */}
                <View style={styles.itemJourneyRow}>
                  <View style={styles.journeyStopBlock}>
                    <View style={styles.stopCircleGreen} />
                    <Text style={styles.stopText} numberOfLines={1}>
                      {ticket.fromStop}
                    </Text>
                  </View>
                  <Feather name="arrow-right" size={14} color="#94A3B8" style={{ marginHorizontal: 6 }} />
                  <View style={styles.journeyStopBlock}>
                    <View style={styles.stopCircleRed} />
                    <Text style={styles.stopText} numberOfLines={1}>
                      {ticket.toStop}
                    </Text>
                  </View>
                </View>

                {/* Meta Details */}
                <View style={styles.itemFooterRow}>
                  <View>
                    <Text style={styles.itemDateText}>
                      {ticket.travelDate} · {ticket.travelTime}
                    </Text>
                    <Text style={styles.itemPassengerText}>
                      {ticket.passengerCount} {ticket.passengerType} · {ticket.paymentMethod}
                    </Text>
                  </View>
                  <Text style={styles.itemFareText}>LKR {ticket.totalFare.toFixed(2)}</Text>
                </View>

                {/* Card Action Row */}
                <View style={styles.cardActionRow}>
                  {ticket.status === 'ACTIVE' && (
                    <TouchableOpacity
                      style={styles.cardQrActionBtn}
                      onPress={() => setSelectedTicketForQR(ticket)}
                    >
                      <MaterialCommunityIcons name="qrcode-scan" size={14} color="#0F2942" />
                      <Text style={styles.cardQrActionBtnText}>Show QR Pass</Text>
                    </TouchableOpacity>
                  )}
                  {(ticket.status === 'USED' || ticket.status === 'EXPIRED') && (
                    <TouchableOpacity
                      style={styles.cardRebookBtn}
                      onPress={() => handleRebook(ticket)}
                    >
                      <Feather name="rotate-cw" size={13} color="#0F2942" />
                      <Text style={styles.cardRebookBtnText}>Rebook Trip</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.cardDetailsBtn}
                    onPress={() => setSelectedTicketForDetails(ticket)}
                  >
                    <Text style={styles.cardDetailsBtnText}>View Details</Text>
                    <Feather name="chevron-right" size={13} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FULLSCREEN DYNAMIC QR MODAL */}
      <Modal
        visible={!!selectedTicketForQR}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTicketForQR(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.qrModalCard}>
            <View style={styles.qrModalHeader}>
              <View>
                <Text style={styles.qrModalTitle}>Dynamic Turnstile QR Pass</Text>
                <Text style={styles.qrModalSub}>Hold near scanner optical reader</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedTicketForQR(null)}
                style={styles.closeCircleBtn}
              >
                <Feather name="x" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {selectedTicketForQR && (
              <View style={styles.qrModalContent}>
                {/* Large high-contrast QR barcode */}
                <View style={styles.qrCodeContainerLarge}>
                  <DynamicQrSvg
                    seed={`${selectedTicketForQR.ticketNumber}-${dynamicTokenSeed}`}
                    size={220}
                    darkColor="#091A2B"
                  />
                  <View style={styles.qrSecurityTag}>
                    <Feather name="lock" size={11} color="#059669" />
                    <Text style={styles.qrSecurityTagText}>TOKEN: {dynamicTokenSeed.slice(0, 12)}</Text>
                  </View>
                </View>

                {/* Rotating Timer Display */}
                <View style={styles.modalTimerRow}>
                  <View style={styles.countdownPill}>
                    <Ionicons name="timer-outline" size={16} color="#0F2942" />
                    <Text style={styles.countdownPillText}>{qrCountdown}s remaining</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.rotateTokenBtn}
                    onPress={() => {
                      setDynamicTokenSeed(`HMAC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
                      setQrCountdown(30);
                      showToast('Generated fresh QR token.');
                    }}
                  >
                    <Ionicons name="refresh" size={15} color="#0F2942" />
                    <Text style={styles.rotateTokenBtnText}>Rotate Token</Text>
                  </TouchableOpacity>
                </View>

                {/* Ticket Details Summary */}
                <View style={styles.modalTicketMetaBox}>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>TICKET ID</Text>
                    <Text style={styles.modalMetaValBold}>{selectedTicketForQR.ticketNumber}</Text>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>ROUTE</Text>
                    <Text style={styles.modalMetaValBold}>{selectedTicketForQR.routeName}</Text>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>FROM / TO</Text>
                    <Text style={styles.modalMetaVal}>
                      {selectedTicketForQR.fromStop}  ➔  {selectedTicketForQR.toStop}
                    </Text>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>PASSENGER</Text>
                    <Text style={styles.modalMetaVal}>
                      {selectedTicketForQR.passengerCount} × {selectedTicketForQR.passengerType}
                    </Text>
                  </View>
                </View>

                <View style={styles.scannerBrightnessHint}>
                  <Feather name="sun" size={14} color="#D97706" />
                  <Text style={styles.brightnessHintText}>
                    Screen brightness automatically elevated for turnstile validation.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.qrDoneButton}
                  onPress={() => setSelectedTicketForQR(null)}
                >
                  <Text style={styles.qrDoneButtonText}>Close Pass</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* TICKET DETAILS & REFUND MODAL */}
      <Modal
        visible={!!selectedTicketForDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTicketForDetails(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailsModalCard}>
            <View style={styles.qrModalHeader}>
              <View>
                <Text style={styles.qrModalTitle}>Ticket Specification</Text>
                <Text style={styles.qrModalSub}>Official Digital Transit Voucher</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedTicketForDetails(null)}
                style={styles.closeCircleBtn}
              >
                <Feather name="x" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {selectedTicketForDetails && (
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <View style={styles.detailsBlock}>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailItemKey}>Ticket Number</Text>
                    <Text style={styles.detailItemValBold}>{selectedTicketForDetails.ticketNumber}</Text>
                  </View>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailItemKey}>Booking Reference</Text>
                    <Text style={styles.detailItemVal}>{selectedTicketForDetails.bookingReference}</Text>
                  </View>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailItemKey}>Status</Text>
                    <Text
                      style={[
                        styles.detailItemValBold,
                        { color: selectedTicketForDetails.status === 'ACTIVE' ? '#059669' : '#64748B' },
                      ]}
                    >
                      {selectedTicketForDetails.status}
                    </Text>
                  </View>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailItemKey}>Route</Text>
                    <Text style={styles.detailItemVal}>{selectedTicketForDetails.routeName}</Text>
                  </View>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailItemKey}>Boarding Stop</Text>
                    <Text style={styles.detailItemVal}>{selectedTicketForDetails.fromStop}</Text>
                  </View>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailItemKey}>Destination Stop</Text>
                    <Text style={styles.detailItemVal}>{selectedTicketForDetails.toStop}</Text>
                  </View>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailItemKey}>Travel Date & Time</Text>
                    <Text style={styles.detailItemVal}>
                      {selectedTicketForDetails.travelDate} · {selectedTicketForDetails.travelTime}
                    </Text>
                  </View>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailItemKey}>Passengers</Text>
                    <Text style={styles.detailItemVal}>
                      {selectedTicketForDetails.passengerCount} ({selectedTicketForDetails.passengerType})
                    </Text>
                  </View>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailItemKey}>Payment Method</Text>
                    <Text style={styles.detailItemVal}>{selectedTicketForDetails.paymentMethod}</Text>
                  </View>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailItemKey}>Transaction Ref</Text>
                    <Text style={styles.detailItemVal}>{selectedTicketForDetails.transactionId}</Text>
                  </View>
                  <View style={[styles.detailItemRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.detailItemKey}>Total Fare</Text>
                    <Text style={[styles.detailItemValBold, { color: '#0F2942', fontSize: 17 }]}>
                      LKR {selectedTicketForDetails.totalFare.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.detailsActionsArea}>
                  {selectedTicketForDetails.status === 'ACTIVE' && (
                    <>
                      <TouchableOpacity
                        style={styles.detailPrimaryQrBtn}
                        onPress={() => {
                          const t = selectedTicketForDetails;
                          setSelectedTicketForDetails(null);
                          setSelectedTicketForQR(t);
                        }}
                      >
                        <MaterialCommunityIcons name="qrcode-scan" size={16} color="#FFFFFF" />
                        <Text style={styles.detailPrimaryQrBtnText}>Show QR Pass</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cancelTicketBtn}
                        onPress={() => handleCancelTicket(selectedTicketForDetails)}
                      >
                        <Feather name="x-circle" size={16} color="#DC2626" />
                        <Text style={styles.cancelTicketBtnText}>Cancel Pass & Refund</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {selectedTicketForDetails.status !== 'ACTIVE' && (
                    <TouchableOpacity
                      style={styles.detailPrimaryQrBtn}
                      onPress={() => {
                        const t = selectedTicketForDetails;
                        setSelectedTicketForDetails(null);
                        handleRebook(t);
                      }}
                    >
                      <Feather name="rotate-cw" size={16} color="#FFFFFF" />
                      <Text style={styles.detailPrimaryQrBtnText}>Rebook Similar Trip</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* BUY TICKET / PASS MODAL */}
      <Modal
        visible={isBuyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBuyModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.buyModalCard}>
            <View style={styles.qrModalHeader}>
              <View>
                <Text style={styles.qrModalTitle}>Buy Transit Pass</Text>
                <Text style={styles.qrModalSub}>Select route, stops & passenger type</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsBuyModalVisible(false)}
                style={styles.closeCircleBtn}
              >
                <Feather name="x" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
              {/* Route Picker */}
              <Text style={styles.formSectionTitle}>1. CHOOSE ROUTE</Text>
              <View style={styles.routeOptionList}>
                {AVAILABLE_ROUTES.map((route, idx) => {
                  const isSelected = selectedRouteIndex === idx;
                  return (
                    <TouchableOpacity
                      key={route.id}
                      style={[styles.routeOptionCard, isSelected && styles.routeOptionCardActive]}
                      onPress={() => handleRouteChange(idx)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.routeOptionHeader}>
                        <View
                          style={[
                            styles.itemTypeBadge,
                            route.type === 'Train' ? styles.trainBadgeBg : styles.busBadgeBg,
                          ]}
                        >
                          <Ionicons
                            name={route.type === 'Train' ? 'train' : 'bus'}
                            size={12}
                            color="#FFFFFF"
                          />
                          <Text style={styles.itemTypeBadgeText}>{route.id}</Text>
                        </View>
                        <Text style={styles.routeFarePreview}>LKR {route.baseFare.toFixed(2)}</Text>
                      </View>
                      <Text style={styles.routeNameText}>{route.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Stops Selection */}
              <Text style={styles.formSectionTitle}>2. JOURNEY STOPS</Text>
              <View style={styles.stopsPickerBox}>
                <View style={styles.stopInputBlock}>
                  <Text style={styles.stopInputLabel}>Boarding Stop</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                    {AVAILABLE_ROUTES[selectedRouteIndex].stops.map((stop) => (
                      <TouchableOpacity
                        key={`from-${stop}`}
                        style={[styles.stopChip, fromStop === stop && styles.stopChipSelected]}
                        onPress={() => setFromStop(stop)}
                      >
                        <Text style={[styles.stopChipText, fromStop === stop && styles.stopChipTextSelected]}>
                          {stop}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={[styles.stopInputBlock, { marginTop: 12 }]}>
                  <Text style={styles.stopInputLabel}>Destination Stop</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                    {AVAILABLE_ROUTES[selectedRouteIndex].stops.map((stop) => (
                      <TouchableOpacity
                        key={`to-${stop}`}
                        style={[styles.stopChip, toStop === stop && styles.stopChipSelected]}
                        onPress={() => setToStop(stop)}
                      >
                        <Text style={[styles.stopChipText, toStop === stop && styles.stopChipTextSelected]}>
                          {stop}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Passenger Type & Count */}
              <Text style={styles.formSectionTitle}>3. PASSENGER TYPE & COUNT</Text>
              <View style={styles.passengerTypeRow}>
                {(['Adult', 'Student', 'Senior/Concession'] as const).map((type) => {
                  const isSelected = passengerType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typePill, isSelected && styles.typePillActive]}
                      onPress={() => setPassengerType(type)}
                    >
                      <Text style={[styles.typePillText, isSelected && styles.typePillTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.countSelectorRow}>
                <Text style={styles.countLabel}>Number of Commuters</Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                  >
                    <Feather name="minus" size={16} color="#0F2942" />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{passengerCount}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPassengerCount(Math.min(6, passengerCount + 1))}
                  >
                    <Feather name="plus" size={16} color="#0F2942" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Payment Method */}
              <Text style={styles.formSectionTitle}>4. PAYMENT METHOD</Text>
              <View style={styles.paymentMethodList}>
                {(['MetroPay Wallet', 'Saved Card', 'Cash on Board'] as const).map((pm) => {
                  const isSelected = paymentMethod === pm;
                  return (
                    <TouchableOpacity
                      key={pm}
                      style={[styles.paymentMethodCard, isSelected && styles.paymentMethodCardActive]}
                      onPress={() => setPaymentMethod(pm)}
                    >
                      <Ionicons
                        name={
                          pm === 'MetroPay Wallet'
                            ? 'wallet-outline'
                            : pm === 'Saved Card'
                            ? 'card-outline'
                            : 'cash-outline'
                        }
                        size={18}
                        color={isSelected ? '#0F2942' : '#64748B'}
                      />
                      <Text style={[styles.paymentMethodText, isSelected && styles.paymentMethodTextActive]}>
                        {pm}
                      </Text>
                      {isSelected && <Feather name="check" size={16} color="#0F2942" style={{ marginLeft: 'auto' }} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Total & Confirm Button */}
              <View style={styles.buySummaryFooter}>
                <View>
                  <Text style={styles.fareTotalLabel}>Total Fare Calculated</Text>
                  <Text style={styles.fareTotalValue}>LKR {calculatedFare.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.confirmBuyBtn}
                  onPress={handleConfirmPurchase}
                  activeOpacity={0.88}
                >
                  <Text style={styles.confirmBuyBtnText}>Pay & Issue Pass</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavigation currentTab="tickets" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 48,
    left: 20,
    right: 20,
    zIndex: 99,
    backgroundColor: '#0F2942',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...TransitShadows.floating,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: TransitColors.primaryDark,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontSize: 12.5,
    color: TransitColors.textSecondary,
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: TransitColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    ...TransitShadows.card,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },

  /* HERO CARD */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    ...TransitShadows.card,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.4,
  },
  heroTicketNum: {
    fontSize: 14,
    fontWeight: '800',
    color: TransitColors.primary,
    letterSpacing: 0.5,
  },
  heroRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: TransitColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRouteName: {
    fontSize: 15,
    fontWeight: '700',
    color: TransitColors.primaryDark,
  },
  heroStopsText: {
    fontSize: 12,
    color: TransitColors.textSecondary,
    marginTop: 2,
  },
  qrDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  qrPressArea: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tapToExpandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tapToExpandText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0F2942',
    marginLeft: 3,
  },
  qrInfoCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 4,
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: '900',
    color: TransitColors.primaryDark,
    marginTop: 4,
  },
  countdownLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  refreshCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  refreshCodeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2942',
    marginLeft: 4,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  heroMetaLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  heroMetaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: TransitColors.primaryDark,
    marginTop: 1,
  },
  heroDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  heroDetailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 2,
  },

  /* EMPTY HERO */
  emptyHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  emptyHeroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TransitColors.primaryDark,
    marginTop: 10,
  },
  emptyHeroSub: {
    fontSize: 12.5,
    color: TransitColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  emptyBuyBtn: {
    backgroundColor: TransitColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
  },
  emptyBuyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* SEARCH & FILTER */
  filterSection: {
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    marginLeft: 8,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: TransitColors.primary,
    borderColor: TransitColors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  /* TICKETS LIST */
  ticketsListContainer: {
    marginTop: 6,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: TransitColors.primaryDark,
    marginBottom: 10,
  },
  noResultsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noResultsText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
  },
  ticketItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    ...TransitShadows.card,
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemRouteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  busBadgeBg: {
    backgroundColor: '#0F2942',
  },
  trainBadgeBg: {
    backgroundColor: '#0D7B74',
  },
  itemTypeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 3,
  },
  itemTicketNum: {
    fontSize: 13,
    fontWeight: '800',
    color: TransitColors.primaryDark,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusUsed: {
    backgroundColor: '#F1F5F9',
  },
  statusExpired: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  statusActiveText: {
    color: '#15803D',
  },
  statusUsedText: {
    color: '#64748B',
  },
  statusExpiredText: {
    color: '#DC2626',
  },
  itemJourneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  journeyStopBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stopCircleGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  stopCircleRed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 5,
  },
  stopText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  itemFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  itemDateText: {
    fontSize: 11,
    color: '#64748B',
  },
  itemPassengerText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  itemFareText: {
    fontSize: 14,
    fontWeight: '800',
    color: TransitColors.primaryDark,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardQrActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cardQrActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2942',
    marginLeft: 4,
  },
  cardRebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cardRebookBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2942',
    marginLeft: 4,
  },
  cardDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  cardDetailsBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 2,
  },

  /* MODALS */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qrModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    ...TransitShadows.floating,
  },
  detailsModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    ...TransitShadows.floating,
  },
  buyModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    ...TransitShadows.floating,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  qrModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: TransitColors.primaryDark,
  },
  qrModalSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrModalContent: {
    alignItems: 'center',
  },
  qrCodeContainerLarge: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrSecurityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  qrSecurityTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
    marginLeft: 4,
  },
  modalTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 12,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  countdownPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2942',
    marginLeft: 5,
  },
  rotateTokenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rotateTokenBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2942',
    marginLeft: 5,
  },
  modalTicketMetaBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  modalMetaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  modalMetaVal: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '500',
  },
  modalMetaValBold: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  scannerBrightnessHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  brightnessHintText: {
    fontSize: 10.5,
    color: '#B45309',
    marginLeft: 6,
    flex: 1,
  },
  qrDoneButton: {
    backgroundColor: TransitColors.primary,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  qrDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* DETAILS MODAL */
  detailsBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailItemKey: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  detailItemVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  detailItemValBold: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '800',
  },
  detailsActionsArea: {
    marginTop: 16,
  },
  detailPrimaryQrBtn: {
    backgroundColor: TransitColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailPrimaryQrBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    marginLeft: 6,
  },
  cancelTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  cancelTicketBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },

  /* BUY PASS FORM */
  formSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 8,
  },
  routeOptionList: {
    gap: 8,
  },
  routeOptionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  routeOptionCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: TransitColors.primary,
    borderWidth: 1.5,
  },
  routeOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeFarePreview: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2942',
  },
  routeNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 4,
  },
  stopsPickerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stopInputBlock: {},
  stopInputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  stopChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 6,
  },
  stopChipSelected: {
    backgroundColor: TransitColors.primary,
    borderColor: TransitColors.primary,
  },
  stopChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  stopChipTextSelected: {
    color: '#FFFFFF',
  },
  passengerTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typePill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  typePillActive: {
    backgroundColor: TransitColors.primary,
    borderColor: TransitColors.primary,
  },
  typePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  typePillTextActive: {
    color: '#FFFFFF',
  },
  countSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  countLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepperBtn: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2942',
    paddingHorizontal: 10,
  },
  paymentMethodList: {
    gap: 6,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentMethodCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: TransitColors.primary,
    borderWidth: 1.5,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 10,
  },
  paymentMethodTextActive: {
    color: '#0F2942',
    fontWeight: '700',
  },
  buySummaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  fareTotalLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  fareTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: TransitColors.primaryDark,
  },
  confirmBuyBtn: {
    backgroundColor: TransitColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  confirmBuyBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});

