import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'react-native-camera-kit';
import { colors, theme } from '../../theme';
import { validateQrTicket } from '../../services/api';
import Icon from '../../components/Icon';
import AppButton from '../../components/AppButton';

const QRScannerScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permanentlyDenied, setPermanentlyDenied] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [validating, setValidating] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [error, setError] = useState(null);

  const scanInProgress = useRef(false);

  const requestCameraPermission = useCallback(async () => {
    setError(null);
    setPermissionDenied(false);
    setPermanentlyDenied(false);
    setCameraReady(false);
    setScanning(false);

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Camera access',
          message: 'TransitPulse needs the camera to scan ticket QR codes.',
          buttonPositive: 'Allow',
        });

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionDenied(true);
          setPermanentlyDenied(granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);
          return;
        }
      }

      setCameraReady(true);
      setScanning(true);
    } catch (permissionError) {
      setPermissionDenied(true);
      setError('Camera permission was denied. Allow camera access and try again.');
    }
  }, []);

  useEffect(() => {
    requestCameraPermission();
  }, [requestCameraPermission]);

  // Ready for the next scan whenever the passenger/conductor returns to this tab
  useFocusEffect(
    useCallback(() => {
      scanInProgress.current = false;
      setScanning(true);
      setValidating(false);
      return () => setTorchOn(false);
    }, [])
  );

  const handleScan = useCallback(
    async (event) => {
      const scannedValue = event?.nativeEvent?.codeStringValue || event?.data || '';

      // Prevent empty scans and duplicate scans
      if (!scannedValue || scanInProgress.current) {
        return;
      }

      scanInProgress.current = true;
      setScanning(false);
      setValidating(true);
      setError(null);

      try {
        const response = await validateQrTicket(scannedValue.trim());
        navigation.navigate('ScanResult', { ...response.data, message: response.message });
      } catch (scanError) {
        // Network/server problems: stay on the scanner and let the user retry
        setError(scanError.message || 'Unable to validate the scanned ticket.');
        scanInProgress.current = false;
        setScanning(true);
      } finally {
        setValidating(false);
      }
    },
    [navigation]
  );

  const deniedView = (
    <View style={styles.cameraLoading}>
      <Icon name="camera" size={40} color={colors.white} />
      <Text style={styles.deniedTitle}>Camera access is off</Text>
      <Text style={styles.cameraLoadingText}>
        {permanentlyDenied
          ? 'Turn on the camera permission for TransitPulse in Settings to scan tickets.'
          : 'Allow camera access to scan ticket QR codes.'}
      </Text>
      <AppButton
        title={permanentlyDenied ? 'Open settings' : 'Allow camera'}
        icon={permanentlyDenied ? 'arrow-right' : 'camera'}
        onPress={permanentlyDenied ? () => Linking.openSettings() : requestCameraPermission}
        style={styles.deniedButton}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerText}>
          <Text style={styles.screenTitle} accessibilityRole="header">
            Scan TransitPass Ticket
          </Text>
          <Text style={styles.screenSubtitle}>Position the QR code inside the scanner frame.</Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('ScanHistory')}
          accessibilityRole="button"
          accessibilityLabel="Scan history"
        >
          <Icon name="list" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox} accessibilityLiveRegion="polite">
          <Icon name="alert-circle" size={16} color="#FFB3B3" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.cameraContainer}>
        {permissionDenied ? (
          deniedView
        ) : cameraReady && isFocused ? (
          <>
            <Camera
              style={StyleSheet.absoluteFillObject}
              cameraType={CameraType.Back}
              scanBarcode={scanning}
              allowedBarcodeTypes={['qr']}
              onReadCode={handleScan}
              torchMode={torchOn ? 'on' : 'off'}
            />

            <View style={styles.scanFrame} pointerEvents="none">
              <View style={styles.frameBox}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>

              <Text style={styles.scanHint}>
                {validating ? 'Checking ticket...' : 'Align the QR code within the frame'}
              </Text>
            </View>

            {validating ? (
              <View style={styles.validating} accessibilityLiveRegion="polite">
                <ActivityIndicator size="large" color={colors.white} />
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.cameraLoading}>
            <ActivityIndicator color={colors.white} />
            <Text style={styles.cameraLoadingText}>Requesting camera permission...</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.torchButton, torchOn && styles.torchOn]}
          onPress={() => setTorchOn((t) => !t)}
          disabled={!cameraReady || permissionDenied}
          accessibilityRole="switch"
          accessibilityState={{ checked: torchOn, disabled: !cameraReady || permissionDenied }}
          accessibilityLabel="Flashlight"
        >
          <Icon name={torchOn ? 'zap' : 'zap-off'} size={22} color={torchOn ? colors.primaryDarkNavy : colors.white} />
          <Text style={[styles.torchText, torchOn && styles.torchTextOn]}>{torchOn ? 'Light on' : 'Light off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.torchButton}
          onPress={() => navigation.navigate('ScanHistory')}
          accessibilityRole="button"
          accessibilityLabel="View scan history"
        >
          <Icon name="list" size={22} color={colors.white} />
          <Text style={styles.torchText}>Scan log</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CORNER = {
  position: 'absolute',
  width: 32,
  height: 32,
  borderColor: colors.activeCyan,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDarkNavy,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  headerText: {
    flex: 1,
  },

  headerButton: {
    width: theme.touch,
    height: theme.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
  },

  screenSubtitle: {
    color: '#C6D6E2',
    fontSize: 13,
    marginTop: 4,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },

  errorText: {
    color: '#FFB3B3',
    marginLeft: 6,
    flex: 1,
  },

  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  scanFrame: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  frameBox: {
    width: 230,
    height: 230,
  },

  cornerTL: { ...CORNER, top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 12 },
  cornerTR: { ...CORNER, top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 12 },
  cornerBL: { ...CORNER, bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 12 },
  cornerBR: { ...CORNER, bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 12 },

  scanHint: {
    position: 'absolute',
    bottom: 24,
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(6,42,69,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },

  validating: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,42,69,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  deniedTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },

  cameraLoadingText: {
    color: '#C6D6E2',
    marginTop: 10,
    textAlign: 'center',
  },

  deniedButton: {
    marginTop: 18,
    alignSelf: 'stretch',
  },

  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  torchButton: {
    flex: 1,
    flexDirection: 'row',
    minHeight: theme.touch,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1.5,
    borderColor: colors.tealCyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },

  torchOn: {
    backgroundColor: colors.activeCyan,
  },

  torchText: {
    color: colors.white,
    fontWeight: '700',
    marginLeft: 8,
  },

  torchTextOn: {
    color: colors.primaryDarkNavy,
  },
});

export default QRScannerScreen;
