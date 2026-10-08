import React from 'react';
import { LayoutDashboard, Radio, ClipboardList, AlertTriangle, UserCheck } from 'lucide-react';

export default function AdminTabBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'radar', label: 'Fleet Radar', icon: Radio },
    { id: 'audit', label: 'Ticket Audit', icon: ClipboardList },
    { id: 'disruption', label: 'Disruptions', icon: AlertTriangle },
    { id: 'profile', label: 'Profile', icon: UserCheck }
  ];

  return (
    <div className="bottom-nav-bar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon size={20} color={isActive ? '#0ea5e9' : '#94a3b8'} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
