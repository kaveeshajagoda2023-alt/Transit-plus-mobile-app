import React from 'react';
import { Polyline } from 'react-native-maps';
import { TransitRoute } from '@/types/route';

interface RoutePolylineProps {
  route: TransitRoute;
}

export const RoutePolyline: React.FC<RoutePolylineProps> = ({ route }) => {
  const isDashed = route.linePattern === 'dashed';

  return (
    <Polyline
      coordinates={route.coordinates}
      strokeColor={route.color}
      strokeWidth={4.5}
      lineDashPattern={isDashed ? [8, 6] : undefined}
      lineCap="round"
      lineJoin="round"
      zIndex={1}
    />
  );
};
