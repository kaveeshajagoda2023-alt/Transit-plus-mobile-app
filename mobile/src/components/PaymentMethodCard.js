import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, theme } from '../theme';

const PaymentMethodCard = ({ id, title, subtitle, icon, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.selectedCard,
      ]}
      onPress={() => onSelect(id)}
      activeOpacity={0.8}
    >
      <View style={styles.leftContainer}>
        <View style={[styles.iconCircle, isSelected && styles.selectedIconCircle]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, isSelected && styles.selectedTitle]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
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
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
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
  subtitle: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
