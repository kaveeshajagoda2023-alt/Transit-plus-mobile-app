import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

interface AuthSocialButtonsProps {
  onApplePress: () => void;
  onGooglePress: () => void;
  isLoading?: boolean;
  activeProvider?: 'APPLE' | 'GOOGLE' | null;
}

export const AuthSocialButtons: React.FC<AuthSocialButtonsProps> = ({
  onApplePress,
  onGooglePress,
  isLoading = false,
  activeProvider = null,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.socialButton, styles.appleButton]}
        onPress={onApplePress}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading && activeProvider === 'APPLE' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.btnContent}>
            <Ionicons name="logo-apple" size={19} color="#FFFFFF" style={styles.icon} />
            <Text style={styles.appleText}>Apple ID</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.socialButton, styles.googleButton]}
        onPress={onGooglePress}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading && activeProvider === 'GOOGLE' ? (
          <ActivityIndicator size="small" color="#0F172A" />
        ) : (
          <View style={styles.btnContent}>
            <FontAwesome name="google" size={17} color="#EA4335" style={styles.icon} />
            <Text style={styles.googleText}>Google</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  appleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  googleText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
});
