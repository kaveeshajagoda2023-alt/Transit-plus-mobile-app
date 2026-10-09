import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { colors, theme } from '../../theme';
import { validateQrTicket } from '../../services/api';

const QRScannerScreen = ({ navigation }) => {
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(null);

  const scanInProgress = useRef(false);

  const requestCameraPermission = useCallback(async () => {
    setError(null);
    setPermissionDenied(false);
    setCameraReady(false);
    setScanning(false);

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionDenied(true);
          return;
        }
      }

      setCameraReady(true);
      setScanning(true);
    } catch (permissionError) {
      setPermissionDenied(true);
      setError(
        'Camera permission was denied. Allow camera access and try again.'
      );
    }
  }, []);

  useEffect(() => {
    requestCameraPermission();
  }, [requestCameraPermission]);

  const handleScan = useCallback(
    async (event) => {
      const scannedValue =
        event?.nativeEvent?.codeStringValue ||
        event?.data ||
        '';

      // Prevent empty scans and duplicate scans
      if (!scannedValue || scanInProgress.current) {
        return;
      }

      scanInProgress.current = true;
      setScanning(false);

      try {
        const response = await validateQrTicket(scannedValue.trim());

        if (response.success && response.status === 'VALID') {
          const ticket = response.ticket;

          const ticketId =
            ticket.ticketId || scannedValue.trim();

          Alert.alert(
            'QR Ticket Valid',
            `Ticket ID: ${ticketId}\nPassenger: ${
              ticket.passengerName || ticket.passengerId
            }\nRoute: ${ticket.route || 'Transit route'}`
          );

          navigation.navigate('DigitalQRPass', {
            ticket: {
              ...ticket,
              ticketId,
            },
          });
        } else {
          const statusMessages = {
            EXPIRED: 'TICKET EXPIRED',
            CANCELLED: 'TICKET CANCELLED',
            ALREADY_USED: 'TICKET ALREADY USED',
            INVALID: 'INVALID TICKET',
          };

          Alert.alert(
            statusMessages[response.status] || 'INVALID TICKET',
            response.message ||
              'This ticket cannot be validated.'
          );
        }
      } catch (scanError) {
        setError(
          scanError.message ||
            'Unable to validate the scanned ticket.'
        );

        Alert.alert(
          'Scan Error',
          scanError.message ||
            'Unable to validate the scanned ticket.'
        );
      } finally {
        scanInProgress.current = false;
        setScanning(true);
      }
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>
          Scan TransitPass Ticket
        </Text>

        <Text style={styles.screenSubtitle}>
          Position the QR code inside the scanner frame.
        </Text>
      </View>

      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      <View style={styles.cameraContainer}>
        {cameraReady ? (
          <>
            <Camera
              style={StyleSheet.absoluteFillObject}
              cameraType={CameraType.Back}
              scanBarcode
              allowedBarcodeTypes={['qr']}
              onReadCode={handleScan}
            />

            <View
              style={styles.scanFrame}
              pointerEvents="none"
            >
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />

              <Text style={styles.scanHint}>
                Align the QR code within the frame
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.cameraLoading}>
            <ActivityIndicator color={colors.white} />

            <Text style={styles.cameraLoadingText}>
              {permissionDenied
                ? 'Camera access was denied.'
                : 'Requesting camera permission...'}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={requestCameraPermission}
        disabled={!permissionDenied}
      >
        <Text style={styles.retryText}>
          {permissionDenied
            ? 'Retry Camera'
            : 'Camera Ready'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDarkNavy,
  },

  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
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

  errorText: {
    color: '#FFB3B3',
    paddingHorizontal: 20,
    marginTop: 8,
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
    borderWidth: 2,
    borderColor: colors.activeCyan,
  },

  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.white,
  },

  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.white,
  },

  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.white,
  },

  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.white,
  },

  scanHint: {
    position: 'absolute',
    bottom: 24,
    color: colors.white,
    fontSize: 13,
  },

  cameraLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraLoadingText: {
    color: colors.white,
    marginTop: 10,
    textAlign: 'center',
  },

  retryButton: {
    margin: 20,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.button,
    backgroundColor: colors.tealCyan,
    alignItems: 'center',
  },

  retryText: {
    color: colors.white,
    fontWeight: '700',
  },
});

export default QRScannerScreen;
