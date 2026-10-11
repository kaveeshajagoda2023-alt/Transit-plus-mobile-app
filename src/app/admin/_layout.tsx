import { Tabs, usePathname } from 'expo-router';
import AdminHeader from '../../components/admin/AdminHeader';
import { LayoutDashboard, Bus, Radio, ClipboardList, AlertTriangle, UserCheck } from 'lucide-react-native';
import React from 'react';

export default function AdminLayout() {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';
  return (
    <Tabs
      screenOptions={{
        header: () => <AdminHeader activeAlertsCount={1} />,
        tabBarStyle: isLogin ? { display: 'none' } : {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#0F2942',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <LayoutDashboard size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehicles',
          tabBarIcon: ({ color }) => <Bus size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fleet-radar"
        options={{
          title: 'Radar',
          tabBarIcon: ({ color }) => <Radio size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ticket-audit"
        options={{
          title: 'Ticket Audit',
          tabBarIcon: ({ color }) => <ClipboardList size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Disruptions',
          tabBarIcon: ({ color }) => <AlertTriangle size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserCheck size={20} color={color} />,
        }}
      />
      {/* Hide the login screen from the tab bar */}
      <Tabs.Screen
        name="login"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
