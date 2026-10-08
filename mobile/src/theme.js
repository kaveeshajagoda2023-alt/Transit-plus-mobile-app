// Milestone 02 / Figma Visual Design System Palette
export const colors = {
  primaryDarkNavy: '#062A45',
  secondaryNavy: '#0B3B5C',
  tealCyan: '#00AFC1',
  activeCyan: '#00C7D4',
  white: '#FFFFFF',
  lightBackground: '#F5F7F9',
  primaryText: '#102A43',
  secondaryText: '#667085',
  border: '#E4E7EB',
  divider: '#CBD5E1',
};

export const theme = {
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    card: 16,
    button: 12,
    badge: 20,
    pill: 999,
  },
  shadows: {
    card: {
      shadowColor: '#062A45',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    button: {
      shadowColor: '#00AFC1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
  },
};

export default theme;
