import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

// Line icons drawn with react-native-svg (no icon font to link).
// Shapes follow the Feather icon set (MIT licence), written as path data.
const circle = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const line = (x1, y1, x2, y2) => `M${x1} ${y1}L${x2} ${y2}`;
const poly = (points, close = false) => `M${points.trim().split(/\s+/).join('L').replace(/,/g, ' ')}${close ? 'Z' : ''}`;
const rect = (x, y, w, h, r = 0) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

const ICONS = {
  home: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', poly('9,22 9,12 15,12 15,22')],
  ticket: [
    'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z',
    'M14 5v2M14 11v2M14 17v2',
  ],
  'plus-circle': [circle(12, 12, 10), line(12, 8, 12, 16), line(8, 12, 16, 12)],
  plus: [line(12, 5, 12, 19), line(5, 12, 19, 12)],
  minus: [line(5, 12, 19, 12)],
  scan: ['M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2', line(7, 12, 17, 12)],
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', circle(12, 7, 4)],
  users: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', circle(9, 7, 4), 'M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'],
  check: [poly('20,6 9,17 4,12')],
  'check-circle': ['M22 11.08V12a10 10 0 1 1-5.93-9.14', poly('22,4 12,14.01 9,11.01')],
  'check-double': ['M2 13l4 4L16 7', 'M11 16l1 1 10-10'],
  x: [line(18, 6, 6, 18), line(6, 6, 18, 18)],
  'x-circle': [circle(12, 12, 10), line(15, 9, 9, 15), line(9, 9, 15, 15)],
  'alert-circle': [circle(12, 12, 10), line(12, 8, 12, 12), line(12, 16, 12.01, 16)],
  'alert-triangle': [
    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    line(12, 9, 12, 13),
    line(12, 17, 12.01, 17),
  ],
  info: [circle(12, 12, 10), line(12, 16, 12, 12), line(12, 8, 12.01, 8)],
  clock: [circle(12, 12, 10), poly('12,6 12,12 16,14')],
  hourglass: ['M6 2h12M6 22h12M7 2v3a5 5 0 0 0 10 0V2M7 22v-3a5 5 0 0 1 10 0v3'],
  refund: [poly('1,4 1,10 7,10'), 'M3.51 15a9 9 0 1 0 2.13-9.36L1 10'],
  refresh: [poly('23,4 23,10 17,10'), 'M20.49 15a9 9 0 1 1-2.12-9.36L23 10'],
  card: [rect(1, 4, 22, 16, 2), line(1, 10, 23, 10)],
  wallet: ['M21 12V7H5a2 2 0 0 1 0-4h14v4', 'M3 5v14a2 2 0 0 0 2 2h16v-5', 'M18 12a2 2 0 0 0 0 4h4v-4z'],
  cash: [rect(2, 6, 20, 12, 2), circle(12, 12, 2.5), 'M6 12h.01M18 12h.01'],
  trash: [poly('3,6 5,6 21,6'), 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'],
  star: [poly('12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26', true)],
  'chevron-right': [poly('9,18 15,12 9,6')],
  'chevron-left': [poly('15,18 9,12 15,6')],
  'chevron-down': [poly('6,9 12,15 18,9')],
  'arrow-right': [line(5, 12, 19, 12), poly('12,5 19,12 12,19')],
  'arrow-down': [line(12, 5, 12, 19), poly('19,12 12,19 5,12')],
  search: [circle(11, 11, 8), line(21, 21, 16.65, 16.65)],
  zap: [poly('13,2 3,14 12,14 11,22 21,10 12,10', true)],
  'zap-off': [poly('13,2 3,14 12,14 11,22 21,10 12,10', true), line(2, 2, 22, 22)],
  'log-out': ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', poly('16,17 21,12 16,7'), line(21, 12, 9, 12)],
  edit: ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'],
  qr: [rect(3, 3, 7, 7, 1), rect(14, 3, 7, 7, 1), rect(3, 14, 7, 7, 1), 'M14 14h3v3M21 14v.01M14 21h3M21 18v3'],
  bus: [rect(4, 3, 16, 16, 2), 'M4 11h16M8 19v2M16 19v2M8 15h.01M16 15h.01'],
  map: [poly('1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2', true), line(8, 2, 8, 18), line(16, 6, 16, 22)],
  'map-pin': ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', circle(12, 10, 3)],
  navigation: [poly('3,11 22,2 13,21 11,13', true)],
  calendar: [rect(3, 4, 18, 18, 2), line(16, 2, 16, 6), line(8, 2, 8, 6), line(3, 10, 21, 10)],
  receipt: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', poly('14,2 14,8 20,8'), line(16, 13, 8, 13), line(16, 17, 8, 17)],
  list: [line(8, 6, 21, 6), line(8, 12, 21, 12), line(8, 18, 21, 18), 'M3 6h.01M3 12h.01M3 18h.01'],
  'eye-off': [
    'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24',
    line(1, 1, 23, 23),
  ],
  eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', circle(12, 12, 3)],
  camera: ['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z', circle(12, 13, 4)],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  lock: [rect(3, 11, 18, 11, 2), 'M7 11V7a5 5 0 0 1 10 0v4'],
  mail: ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', poly('22,6 12,13 2,6')],
  globe: [circle(12, 12, 10), line(2, 12, 22, 12), 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  'wifi-off': [line(1, 1, 23, 23), 'M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01'],
};

const Icon = ({ name, size = 24, color = colors.primaryText, strokeWidth = 2, fill = 'none' }) => {
  const paths = ICONS[name] || ICONS['alert-circle'];
  return (
    // Icons are decorative: the surrounding control carries the accessibilityLabel
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false} importantForAccessibility="no">
      {paths.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={fill}
        />
      ))}
    </Svg>
  );
};

export default Icon;
