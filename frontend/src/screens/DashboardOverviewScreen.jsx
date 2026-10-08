import React from 'react';
import { Bus, Route, Ticket, AlertTriangle, ChevronRight, Activity, Zap } from 'lucide-react';

export default function DashboardOverviewScreen({ onNavigate }) {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Operations Center Dashboard
        </div>
        <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#fff', fontWeight: '700' }}>
          Fleet Status Overview
        </h2>
      </div>

      {/* 2x2 Operational Metrics Grid (Requirement: Visibility of System Status) */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Active Fleet</span>
            <Bus size={18} color="#0ea5e9" />
          </div>
          <div className="metric-val">142</div>
          <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
            ↑ 94.2% On-Time
          </div>
        </div>

        <div className="metric-card emerald">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Active Routes</span>
            <Route size={18} color="#10b981" />
          </div>
          <div className="metric-val">24</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Bus & BRT & Rail
          </div>
        </div>

        <div className="metric-card amber">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Passes Issued</span>
            <Ticket size={18} color="#f59e0b" />
          </div>
          <div className="metric-val">18.4K</div>
          <div style={{ fontSize: '11px', color: '#f59e0b' }}>
            Rs 520,400 Today
          </div>
        </div>

        <div className="metric-card rose" onClick={() => onNavigate('audit')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Flagged Anomalies</span>
            <AlertTriangle size={18} color="#f43f5e" />
          </div>
          <div className="metric-val" style={{ color: '#f43f5e' }}>23</div>
          <div style={{ fontSize: '11px', color: '#f43f5e' }}>
            Tap to Audit Hub →
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="glass-card" onClick={() => onNavigate('radar')} style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#0ea5e9' }}>
          <Zap size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Live Fleet Telemetry Radar</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Track 45 active buses/trains with pull-up bottom sheet</div>
        </div>
        <ChevronRight size={20} color="#94a3b8" />
      </div>

      <div className="glass-card" onClick={() => onNavigate('disruption')} style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f43f5e' }}>
          <AlertTriangle size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Emergency Disruption Alert</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Broadcast service alerts with error-prevention modal</div>
        </div>
        <ChevronRight size={20} color="#94a3b8" />
      </div>

      {/* Operational Logs Stream */}
      <div className="glass-card">
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={16} color="#0ea5e9" />
          Live Operations Log Stream
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <span style={{ color: '#38bdf8', fontWeight: '600' }}>#TN-0824</span>
              <span style={{ color: '#94a3b8' }}> • Route 42 Eastbound</span>
            </div>
            <span style={{ color: '#f59e0b', fontWeight: '600' }}>Delayed (+15m)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <span style={{ color: '#38bdf8', fontWeight: '600' }}>#TK-9830</span>
              <span style={{ color: '#94a3b8' }}> • Conductor CND-77492</span>
            </div>
            <span style={{ color: '#f43f5e', fontWeight: '600' }}>Flagged Anomaly</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#38bdf8', fontWeight: '600' }}>#TN-0830</span>
              <span style={{ color: '#94a3b8' }}> • Route 18 Express Train</span>
            </div>
            <span style={{ color: '#10b981', fontWeight: '600' }}>On Time (65km/h)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
