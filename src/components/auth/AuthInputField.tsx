import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { TransitColors } from '@/constants/transitTheme';

interface AuthInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  iconName?: keyof typeof Feather.glyphMap | keyof typeof Ionicons.glyphMap;
  isIonicons?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string | null;
  helperText?: string;
  onClear?: () => void;
  prefix?: React.ReactNode;
  editable?: boolean;
}

export const AuthInputField: React.FC<AuthInputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  iconName,
  isIonicons = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  helperText,
  onClear,
  prefix,
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, !!error && styles.inputError]}>
        {prefix ? (
          <View style={styles.prefixContainer}>{prefix}</View>
        ) : iconName ? (
          <View style={styles.iconContainer}>
            {isIonicons ? (
              <Ionicons name={iconName as any} size={18} color={TransitColors.textMuted} />
            ) : (
              <Feather name={iconName as any} size={18} color={TransitColors.textMuted} />
            )}
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          autoCorrect={false}
        />

        {value.length > 0 && onClear && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    letterSpacing: -0.2,
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
  prefixContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    color: '#64748B',
    fontSize: 11.5,
    marginTop: 4,
    lineHeight: 16,
  },
});
