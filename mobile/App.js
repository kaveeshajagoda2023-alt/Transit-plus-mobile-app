import './src/utils/polyfills'; // must stay first: TextEncoder for QR codes on Hermes
import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Only left/right here: tab screens and the tab bar handle top/bottom insets themselves */}
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDarkNavy} />
        <AuthProvider>
          <ToastProvider>
            <AppNavigator />
          </ToastProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDarkNavy,
  },
});
