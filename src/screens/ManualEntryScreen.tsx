import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { DashboardBottomNav, DashboardTab } from '@/components/dashboard/DashboardBottomNav';
import { tripApi } from '@/services/api/tripApi';

interface ManualEntryScreenProps {
  onBackToScanner?: () => void;
  onValidationSuccess?: (result: any) => void;
  onValidationError?: (result: any) => void;
}

export function ManualEntryScreen({
  onBackToScanner,
  onValidationSuccess,
  onValidationError,
}: ManualEntryScreenProps) {
  const [ticketInput, setTicketInput] = useState<string>('TK-9021-042');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  // Live lookup match preview state
  const [previewMatch, setPreviewMatch] = useState<{
    found: boolean;
    ticketId: string;
    status: 'VALID' | 'USED' | 'EXPIRED' | 'INVALID_ROUTE' | 'NOT_FOUND';
    passengerName?: string;
    type?: string;
    fareAmount?: number;
    paymentMethod?: string;
    route?: string;
  } | null>(null);

  // Update live preview whenever input changes
  useEffect(() => {
    if (ticketInput.trim().length >= 4) {
      const match = tripApi.lookupTicketPreview(ticketInput.trim());
      setPreviewMatch(match);
    } else {
      setPreviewMatch(null);
    }
  }, [ticketInput]);

  // Keypad key press handler
  const handleKeyPress = (char: string) => {
    if (char === 'CLR') {
      setTicketInput('TK-');
      setValidationError('');
    } else if (char === 'DEL') {
      if (ticketInput.length > 3) {
        setTicketInput((prev) => prev.slice(0, -1));
      } else {
        setTicketInput('');
      }
      setValidationError('');
    } else {
      setTicketInput((prev) => prev + char);
      setValidationError('');
    }
  };

  // Submission to real backend validation
  const handleVerifyTicket = async () => {
    const clean = ticketInput.trim().toUpperCase();
    if (!clean || clean === 'TK-') {
      setValidationError('Please enter a ticket reference code.');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      const res = await tripApi.validateTicket(clean, 'QR');
      if (res.valid && res.result === 'PASS') {
        if (onValidationSuccess) {
          onValidationSuccess(res);
        } else {
          router.push({
            pathname: '/staff/ticket-success' as any,
            params: {
              ticketId: res.ticketId,
              ticketType: res.ticketTypeLabel,
              passenger: res.passengerName || 'Cardholder',
              fare: String(res.fareAmount),
              bookingRef: res.bookingReference,
              origin: res.originStop,
              destination: res.destinationStop,
            },
          });
        }
      } else {
        if (onValidationError) {
          onValidationError(res);
        } else {
          router.push({
            pathname: '/staff/ticket-error' as any,
            params: {
              ticketId: res.ticketId,
              reason: res.reason || 'Ticket not valid',
              faultCode: res.faultCode || '0x01',
            },
          });
        }
      }
    } catch (err: any) {
      setValidationError(err.message || 'Validation failed. Check connection.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleBackToScanner = () => {
    if (onBackToScanner) {
      onBackToScanner();
    } else {
      router.replace('/staff/scanner' as any);
    }
  };

  const handleSelectTab = (tab: DashboardTab) => {
    if (tab === 'dashboard') {
      router.replace('/staff/dashboard' as any);
    } else if (tab === 'scanner') {
      router.replace('/staff/scanner' as any);
    } else {
      router.replace('/staff/dashboard' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* 1. TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToScanner}
          accessibilityLabel="Back to scanner"
        >
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitleText}>Manual Ticket Entry</Text>
          <Text style={styles.headerSubtitleText}>TransitPulse • Bus #4028</Text>
        </View>

        <View style={styles.linePill}>
          <Text style={styles.linePillText}>LINE 42</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. NOTICE BAR */}
        <View style={styles.noticeBar}>
          <MaterialCommunityIcons name="information-outline" size={16} color="#0D9488" style={{ marginRight: 8 }} />
          <Text style={styles.noticeText}>
            Scanner hardware fallback: used for damaged QR, smeared screens, or hands-free gates.
          </Text>
        </View>

        {/* 3. TICKET CODE INPUT CARD */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeaderRow}>
            <Text style={styles.inputLabel}>Enter 8 to 10-Character Ticket Reference</Text>
            <Text style={styles.stepCounterText}>Step 1 of 1</Text>
          </View>

          <View style={styles.inputBox}>
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color="#0D9488" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.textInput}
              value={ticketInput}
              onChangeText={(txt) => {
                setTicketInput(txt.toUpperCase());
                if (validationError) setValidationError('');
              }}
              placeholder="e.g. TK-9021-042"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isValidating}
            />
            {ticketInput.length > 0 && !isValidating && (
              <TouchableOpacity onPress={() => setTicketInput('')} style={styles.clearIconBtn}>
                <Feather name="x" size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.formatHintText}>
            Format: TK-XXXX-XXX (Found below barcode on passenger receipts)
          </Text>

          {validationError ? (
            <Text style={styles.errorText}>{validationError}</Text>
          ) : null}
        </View>

        {/* 4. LOOKUP MATCH FOUND CARD (LIVE DYNAMIC PREVIEW) */}
        {previewMatch && previewMatch.found && (
          <View style={styles.matchCard}>
            <View style={styles.matchHeaderRow}>
              <View style={styles.matchHeaderLeft}>
                <Feather name="search" size={14} color="#0D9488" style={{ marginRight: 6 }} />
                <Text style={styles.matchTitleText}>Lookup Match Found</Text>
              </View>

              {previewMatch.status === 'VALID' && (
                <View style={styles.activeValidBadge}>
                  <Text style={styles.activeValidBadgeText}>● ACTIVE & VALID</Text>
                </View>
              )}
              {previewMatch.status === 'EXPIRED' && (
                <View style={styles.expiredBadge}>
                  <Text style={styles.expiredBadgeText}>✕ EXPIRED</Text>
                </View>
              )}
              {previewMatch.status === 'USED' && (
                <View style={styles.usedBadge}>
                  <Text style={styles.usedBadgeText}>⚠ ALREADY REDEEMED</Text>
                </View>
              )}
              {previewMatch.status === 'INVALID_ROUTE' && (
                <View style={styles.usedBadge}>
                  <Text style={styles.usedBadgeText}>⚠ WRONG ROUTE</Text>
                </View>
              )}
            </View>

            <View style={styles.matchBody}>
              <Text style={styles.passengerNameText}>{previewMatch.passengerName || 'Dilshan Silva'}</Text>
              <Text style={styles.passDetailsText}>
                {previewMatch.type || 'Student Monthly Pass'} • {previewMatch.route || 'Line 42 Eastbound'}
              </Text>
              <View style={styles.matchMetaRow}>
                <Text style={styles.matchMetaText}>Paid Via: {previewMatch.paymentMethod || 'Parkway Wallet'}</Text>
                <Text style={styles.matchMetaText}>Auto-Renew: Yes</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Test Presets */}
        <View style={styles.quickPresetsRow}>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => setTicketInput('TK-9021-042')}
          >
            <Text style={styles.presetChipText}>TK-9021 (Valid Single)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => setTicketInput('TK-8832')}
          >
            <Text style={styles.presetChipText}>TK-8832 (Expired)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => setTicketInput('TK-7740')}
          >
            <Text style={styles.presetChipText}>TK-7740 (Used)</Text>
          </TouchableOpacity>
        </View>

        {/* 5. CUSTOM TRANSIT 3x4 KEYPAD */}
        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>
            <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('1')}>
              <Text style={styles.keypadDigit}>1</Text>
              <Text style={styles.keypadSub}>. </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('2')}>
              <Text style={styles.keypadDigit}>2</Text>
              <Text style={styles.keypadSub}>ABC</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('3')}>
              <Text style={styles.keypadDigit}>3</Text>
              <Text style={styles.keypadSub}>DEF</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keypadRow}>
            <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('4')}>
              <Text style={styles.keypadDigit}>4</Text>
              <Text style={styles.keypadSub}>GHI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('5')}>
              <Text style={styles.keypadDigit}>5</Text>
              <Text style={styles.keypadSub}>JKL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('6')}>
              <Text style={styles.keypadDigit}>6</Text>
              <Text style={styles.keypadSub}>MNO</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keypadRow}>
            <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('7')}>
              <Text style={styles.keypadDigit}>7</Text>
              <Text style={styles.keypadSub}>PQRS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('8')}>
              <Text style={styles.keypadDigit}>8</Text>
              <Text style={styles.keypadSub}>TUV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('9')}>
              <Text style={styles.keypadDigit}>9</Text>
              <Text style={styles.keypadSub}>WXYZ</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keypadRow}>
            <TouchableOpacity style={[styles.keypadKey, styles.keypadKeyAlt]} onPress={() => handleKeyPress('CLR')}>
              <Text style={[styles.keypadDigit, styles.keypadDigitAlt]}>CLR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadKey} onPress={() => handleKeyPress('0')}>
              <Text style={styles.keypadDigit}>0</Text>
              <Text style={styles.keypadSub}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.keypadKey, styles.keypadKeyAlt]} onPress={() => handleKeyPress('DEL')}>
              <Feather name="delete" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. ACTION BUTTONS */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.verifyButton, isValidating && styles.verifyButtonDisabled]}
            onPress={handleVerifyTicket}
            disabled={isValidating}
            activeOpacity={0.85}
          >
            {isValidating ? (
              <View style={styles.buttonInnerLoading}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.verifyButtonText}>Validating Ticket...</Text>
              </View>
            ) : (
              <View style={styles.buttonInner}>
                <MaterialCommunityIcons name="shield-check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.verifyButtonText}>Verify Ticket Reference</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backScannerButton}
            onPress={handleBackToScanner}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="camera-outline" size={18} color="#0D9488" style={{ marginRight: 8 }} />
            <Text style={styles.backScannerButtonText}>Back to Camera Scanner</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 7. BOTTOM NAVIGATION */}
      <DashboardBottomNav currentTab="scanner" onSelectTab={handleSelectTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 6,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 6,
  },
  headerTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitleText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  linePill: {
    backgroundColor: '#0F766E',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  linePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },

  // Notice Bar
  noticeBar: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#0F766E',
    fontWeight: '500',
    lineHeight: 16,
  },

  // Input Card
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepCounterText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0D9488',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  clearIconBtn: {
    padding: 4,
  },
  formatHintText: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 6,
  },
  errorText: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 6,
  },

  // Match Card
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  matchHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchTitleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0D9488',
  },
  activeValidBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeValidBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  expiredBadge: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  expiredBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  usedBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  usedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  matchBody: {
    gap: 3,
  },
  passengerNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  passDetailsText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  matchMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  matchMetaText: {
    fontSize: 10.5,
    color: '#64748B',
  },

  // Quick Presets
  quickPresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },

  // Keypad
  keypadContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keypadKey: {
    flex: 1,
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadKeyAlt: {
    backgroundColor: '#F1F5F9',
  },
  keypadDigit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  keypadDigitAlt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  keypadSub: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: -2,
  },

  // Actions
  actionsContainer: {
    gap: 10,
  },
  verifyButton: {
    backgroundColor: '#0F2942',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonInnerLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backScannerButton: {
    backgroundColor: '#FFFFFF',
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backScannerButtonText: {
    color: '#0F766E',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
