import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../theme';
import Icon from '../components/Icon';

const ToastContext = createContext({ show: () => {} });

const TYPES = {
  success: { icon: 'check-circle', accent: colors.activeCyan },
  error: { icon: 'alert-circle', accent: '#FF8A80' },
  info: { icon: 'info', accent: colors.white },
};

// Snackbar-style feedback shown after actions: toast.show('Saved', 'success')
export const ToastProvider = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const hide = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setToast(null));
  }, [anim]);

  const show = useCallback(
    (message, type = 'success', duration = 3000) => {
      clearTimeout(timer.current);
      setToast({ message, type });
      AccessibilityInfo.announceForAccessibility(message);
      Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, duration);
    },
    [anim, hide]
  );

  const value = useMemo(() => ({ show }), [show]);
  const config = TYPES[toast?.type] || TYPES.info;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.wrapper,
            { bottom: insets.bottom + 84 },
            { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
          ]}
        >
          <View style={styles.toast} accessibilityLiveRegion="polite" accessibilityRole="alert">
            <Icon name={config.icon} size={20} color={config.accent} />
            <Text style={styles.text}>{toast.message}</Text>
            <TouchableOpacity onPress={hide} style={styles.close} accessibilityRole="button" accessibilityLabel="Dismiss message">
              <Icon name="x" size={18} color="#C6D6E2" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDarkNavy,
    borderRadius: theme.borderRadius.button,
    paddingLeft: 14,
    minHeight: theme.touch + 4,
    ...theme.shadows.card,
    elevation: 8,
  },
  text: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    paddingVertical: 10,
  },
  close: {
    width: theme.touch,
    height: theme.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ToastContext;
