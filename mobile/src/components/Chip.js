import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, theme } from '../theme';
import Icon from './Icon';

// Selectable pill (filters, passenger type, date/time slots)
const Chip = ({ label, sublabel, selected, onPress, icon, style, accessibilityLabel }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityRole="radio"
    accessibilityState={{ selected: !!selected, checked: !!selected }}
    accessibilityLabel={accessibilityLabel || [label, sublabel].filter(Boolean).join(', ')}
    style={[styles.chip, selected && styles.selected, style]}
  >
    <View style={styles.row}>
      {selected ? <Icon name="check" size={14} color={colors.primaryDarkNavy} strokeWidth={3} /> : null}
      {!selected && icon ? <Icon name={icon} size={14} color={colors.secondaryText} /> : null}
      <Text style={[styles.label, selected && styles.selectedLabel, (selected || icon) && styles.labelGap]}>{label}</Text>
    </View>
    {sublabel ? <Text style={[styles.sublabel, selected && styles.selectedSub]}>{sublabel}</Text> : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    minHeight: theme.touch,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    borderColor: colors.tealCyan,
    backgroundColor: colors.tealTint,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
  },
  labelGap: {
    marginLeft: 4,
  },
  selectedLabel: {
    color: colors.primaryDarkNavy,
    fontWeight: '700',
  },
  sublabel: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 1,
  },
  selectedSub: {
    color: colors.tealText,
  },
});

export default Chip;
