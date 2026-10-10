import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import Icon from './Icon';

// "Label ........ value" row used on details / receipt screens
const InfoRow = ({ label, value, icon, bold = false, valueColor }) => (
  <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
    <View style={styles.labelWrap}>
      {icon ? <Icon name={icon} size={16} color={colors.secondaryText} /> : null}
      <Text style={[styles.label, icon && styles.labelGap]}>{label}</Text>
    </View>
    <Text style={[styles.value, bold && styles.bold, valueColor && { color: valueColor }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  labelGap: {
    marginLeft: 6,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: colors.primaryText,
    textAlign: 'right',
    fontWeight: '500',
  },
  bold: {
    fontWeight: '700',
    fontSize: 15,
  },
});

export default InfoRow;
