import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';

interface AuthPasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  onForgotPassword?: () => void;
  showStrengthMeter?: boolean;
}

export const AuthPasswordField: React.FC<AuthPasswordFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder = '••••••••••••',
  error,
  onForgotPassword,
  showStrengthMeter = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Strength score: 0 to 3
  const getStrengthScore = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getStrengthScore(value);
  const strengthLabels = ['Too Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#CBD5E1', '#EF4444', '#F59E0B', '#10B981'];

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {onForgotPassword && (
          <TouchableOpacity onPress={onForgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.inputWrapper, !!error && styles.inputError]}>
        <View style={styles.iconContainer}>
          <Feather name="lock" size={18} color={TransitColors.textMuted} />
        </View>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.eyeBtn}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>
      </View>

      {showStrengthMeter && value.length > 0 && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBarsRow}>
            <View
              style={[
                styles.strengthBar,
                { backgroundColor: strengthScore >= 1 ? strengthColors[strengthScore] : '#E2E8F0' },
              ]}
            />
            <View
              style={[
                styles.strengthBar,
                { backgroundColor: strengthScore >= 2 ? strengthColors[strengthScore] : '#E2E8F0' },
              ]}
            />
            <View
              style={[
                styles.strengthBar,
                { backgroundColor: strengthScore >= 3 ? strengthColors[strengthScore] : '#E2E8F0' },
              ]}
            />
          </View>
          <View style={styles.strengthLabelRow}>
            <Text style={styles.strengthHeader}>Security Strength</Text>
            <View style={styles.strengthBadge}>
              <Ionicons
                name={strengthScore === 3 ? 'shield-checkmark' : 'shield-outline'}
                size={13}
                color={strengthColors[strengthScore]}
              />
              <Text
                style={[
                  styles.strengthBadgeText,
                  { color: strengthColors[strengthScore] },
                ]}
              >
                {strengthLabels[strengthScore]}
              </Text>
            </View>
          </View>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    letterSpacing: -0.2,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D9488',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  iconContainer: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBarsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthHeader: {
    fontSize: 11,
    color: '#64748B',
  },
  strengthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  strengthBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
