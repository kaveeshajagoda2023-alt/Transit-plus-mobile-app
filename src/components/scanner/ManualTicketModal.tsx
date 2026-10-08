import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface ManualTicketModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (ticketCode: string) => Promise<void>;
  isValidating: boolean;
}

const QUICK_TEST_CODES = [
  { code: 'TK-9021', label: 'Valid Single ($65)', type: 'valid' },
  { code: 'TK-9018', label: 'Concession Pass ($35)', type: 'valid' },
  { code: 'TK-9055', label: 'Valid Day Pass ($150)', type: 'valid' },
  { code: 'TK-8832', label: 'Expired Pass', type: 'expired' },
  { code: 'TK-7740', label: 'Already Used', type: 'used' },
  { code: 'TK-4411', label: 'Wrong Route (Line 138)', type: 'wrong' },
];

export const ManualTicketModal: React.FC<ManualTicketModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isValidating,
}) => {
  const [ticketInput, setTicketInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (codeToSubmit?: string) => {
    const code = (codeToSubmit || ticketInput).trim().toUpperCase();
    if (!code) {
      setErrorMessage('Please enter a ticket code');
      return;
    }
    setErrorMessage('');
    await onSubmit(code);
    setTicketInput('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="ticket-confirmation-outline" size={22} color="#2DD4BF" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Manual Ticket Verification</Text>
              <Text style={styles.subtitle}>Enter passenger 6-character ticket or pass code</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={isValidating}>
              <Feather name="x" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Input field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>TICKET / PASS CODE</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={ticketInput}
                onChangeText={(text) => {
                  setTicketInput(text.toUpperCase());
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g. TK-9021"
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isValidating}
              />
              {ticketInput.length > 0 && !isValidating && (
                <TouchableOpacity onPress={() => setTicketInput('')} style={styles.clearBtn}>
                  <Feather name="x-circle" size={18} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </View>

          {/* Quick Test Chips for Conductor Verification */}
          <View style={styles.quickChipsSection}>
            <Text style={styles.chipsSectionLabel}>QUICK TEST PRESETS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {QUICK_TEST_CODES.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.chip,
                    item.type === 'valid' && styles.chipValid,
                    item.type === 'expired' && styles.chipExpired,
                    item.type === 'used' && styles.chipUsed,
                    item.type === 'wrong' && styles.chipWrong,
                  ]}
                  onPress={() => {
                    setTicketInput(item.code);
                    handleSubmit(item.code);
                  }}
                  disabled={isValidating}
                >
                  <Text style={styles.chipCode}>{item.code}</Text>
                  <Text style={styles.chipLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isValidating}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, isValidating && styles.submitBtnDisabled]}
              onPress={() => handleSubmit()}
              disabled={isValidating}
            >
              {isValidating ? (
                <View style={styles.loadingInner}>
                  <ActivityIndicator size="small" color="#0F172A" />
                  <Text style={styles.submitBtnText}>Validating...</Text>
                </View>
              ) : (
                <View style={styles.submitInner}>
                  <Feather name="check" size={16} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Validate Ticket</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 22, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#0F1E33',
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E385B',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#081325',
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  clearBtn: {
    padding: 4,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    marginTop: 6,
  },
  quickChipsSection: {
    marginBottom: 22,
  },
  chipsSectionLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: '#162842',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#243F66',
  },
  chipValid: {
    borderColor: 'rgba(45, 212, 191, 0.4)',
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
  },
  chipExpired: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  chipUsed: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  chipWrong: {
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  chipCode: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '700',
  },
  chipLabel: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#162842',
    borderWidth: 1,
    borderColor: '#253D60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#2DD4BF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
});
