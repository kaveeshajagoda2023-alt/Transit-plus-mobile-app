import React from 'react';
import { UserCheck, Shield, Download, Moon, Lock, LogOut, Award } from 'lucide-react';

export default function AdminProfileScreen({ user, onLogout }) {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Member 4 Staff Profile</div>
        <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#fff', fontWeight: '700' }}>Coordinator Profile</h2>
      </div>

      {/* Staff Identity Card */}
      <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          justify-content: 'center',
          align-items: 'center',
          margin: '0 auto 12px auto',
          color: '#fff',
          fontSize: '24px',
          fontWeight: '700',
          boxShadow: '0 6px 20px rgba(2, 132, 199, 0.4)'
        }}>
          KJ
        </div>

        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#fff' }}>K. K. Jagoda</h3>
        <div style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: '600', marginBottom: '8px' }}>
          Student ID: IT23762572 • Group WE_121
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          borderRadius: '20px',
          padding: '4px 12px',
          fontSize: '11px',
          color: '#10b981',
          fontWeight: '600'
        }}>
          <Award size={14} />
          Transport Operations Coordinator (Tier 3)
        </div>
      </div>

      {/* Settings & System Tools */}
      <div className="glass-card" style={{ padding: '8px 14px' }}>
        <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} color="#0ea5e9" />
            <span style={{ fontSize: '13px', color: '#fff' }}>Security Clearance Level</span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Tier 3 Master</span>
        </div>

        <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={18} color="#10b981" />
            <span style={{ fontSize: '13px', color: '#fff' }}>Export System Audit Logs</span>
          </div>
          <span style={{ fontSize: '11px', color: '#10b981' }}>CSV / JSON</span>
        </div>

        <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Moon size={18} color="#f59e0b" />
            <span style={{ fontSize: '13px', color: '#fff' }}>OLED Glassmorphism Theme</span>
          </div>
          <span style={{ fontSize: '11px', color: '#f59e0b' }}>Dark Mode Active</span>
        </div>
      </div>

      {/* Sign Out Action */}
      <button
        type="button"
        onClick={onLogout}
        className="btn-primary"
        style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid #f43f5e',
          color: '#f43f5e',
          marginTop: '10px',
          boxShadow: 'none'
        }}
      >
        <LogOut size={18} />
        Sign Out of Ops Portal
      </button>
    </div>
  );
}
