import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

// Title block used at the top of tab screens (same style as the Milestone 02 screens)
const ScreenHeader = ({ title, subtitle, right, dark = false, style }) => (
  <View style={[styles.container, style]}>
    <View style={styles.textBlock}>
      <Text style={[styles.title, dark && styles.titleDark]} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={[styles.subtitle, dark && styles.subtitleDark]}>{subtitle}</Text> : null}
    </View>
    {right}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryDarkNavy,
  },
  titleDark: {
    color: colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 4,
  },
  subtitleDark: {
    color: '#C6D6E2',
  },
});

export default ScreenHeader;
