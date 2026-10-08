import { Tabs } from 'expo-router';
import AdminHeader from '../../components/admin/AdminHeader';
import { LayoutDashboard, Radio, ClipboardList, AlertTriangle, UserCheck } from 'lucide-react-native';
import React from 'react';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <AdminHeader activeAlertsCount={1} />,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
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
        name="fleet-radar"
        options={{
          title: 'Fleet Radar',
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
