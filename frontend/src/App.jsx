import React, { useState } from 'react';
import AdminHeader from './components/AdminHeader';
import AdminTabBar from './components/AdminTabBar';
import AdminLoginScreen from './screens/AdminLoginScreen';
import DashboardOverviewScreen from './screens/DashboardOverviewScreen';
import FleetRadarScreen from './screens/FleetRadarScreen';
import TicketAuditScreen from './screens/TicketAuditScreen';
import DisruptionAlertScreen from './screens/DisruptionAlertScreen';
import AdminProfileScreen from './screens/AdminProfileScreen';

export default function App() {
  const [currentUser, setCurrentUser] = useState({
    staffId: 'CDR-8910@transitpulse.gov',
    name: 'K. K. Jagoda',
    studentId: 'IT23762572',
    role: 'Transport Coordinator'
  });
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="mobile-device-shell">
      {/* Mobile Device Status Notch */}
      <div className="mobile-notch-header">
        <span>9:41</span>
        <div style={{ width: '90px', height: '18px', background: '#000', borderRadius: '10px' }}></div>
        <span>5G 100%</span>
      </div>

      {!currentUser ? (
        <AdminLoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />
      ) : (
        <>
          <AdminHeader coordinatorName={currentUser.name} activeAlertsCount={1} />

          <div className="screen-container">
            {activeTab === 'overview' && <DashboardOverviewScreen onNavigate={(tab) => setActiveTab(tab)} />}
            {activeTab === 'radar' && <FleetRadarScreen />}
            {activeTab === 'audit' && <TicketAuditScreen />}
            {activeTab === 'disruption' && <DisruptionAlertScreen />}
            {activeTab === 'profile' && <AdminProfileScreen user={currentUser} onLogout={() => setCurrentUser(null)} />}
          </div>

          <AdminTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}
    </div>
  );
}
