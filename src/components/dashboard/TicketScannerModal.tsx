import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { TicketScannerScreen } from '@/screens/TicketScannerScreen';
import { ScanValidationResponse } from '@/types/trip';

interface TicketScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onValidateTicket?: (ticketId: string, method?: 'QR' | 'NFC') => Promise<ScanValidationResponse>;
  mode?: 'QR' | 'NFC';
}

export const TicketScannerModal: React.FC<TicketScannerModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TicketScannerScreen onClose={onClose} activeTripNumber="42" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071220',
  },
});
