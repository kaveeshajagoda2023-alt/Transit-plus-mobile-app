import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, theme } from '../theme';
import Icon from './Icon';

// Selectable payment option (radio style). `icon` is an Icon name.
const PaymentMethodCard = ({ id, title, subtitle, icon, isSelected, onSelect, badge }) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={() => onSelect(id)}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ checked: !!isSelected, selected: !!isSelected }}
      accessibilityLabel={[title, subtitle, badge].filter(Boolean).join(', ')}
    >
      <View style={styles.leftContainer}>
        <View style={[styles.iconCircle, isSelected && styles.selectedIconCircle]}>
          <Icon name={icon} size={20} color={isSelected ? colors.tealText : colors.secondaryNavy} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isSelected && styles.selectedTitle]}>{title}</Text>
            {badge ? <Text style={styles.badge}>{badge}</Text> : null}
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={[styles.radioOuter, isSelected && styles.selectedRadioOuter]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 14,
    minHeight: 64,
    borderRadius: theme.borderRadius.card,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...theme.shadows.card,
  },
  selectedCard: {
    borderColor: colors.tealCyan,
    backgroundColor: '#F0FDFA', // Soft cyan tint
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.lightBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedIconCircle: {
    backgroundColor: '#E6FFFA',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryText,
  },
  selectedTitle: {
    color: colors.primaryDarkNavy,
    fontWeight: '700',
  },
  badge: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '700',
    color: colors.tealText,
    backgroundColor: colors.tealTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  subtitle: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.secondaryText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioOuter: {
    borderColor: colors.tealCyan,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.tealCyan,
  },
});

export default PaymentMethodCard;
