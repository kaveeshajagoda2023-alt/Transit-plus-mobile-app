import React from 'react';
import { ShieldCheck, Wifi, Bell } from 'lucide-react';

export default function AdminHeader({ activeAlertsCount = 1, coordinatorName = "K. K. Jagoda" }) {
  return (
    <div style={{
      padding: '12px 16px',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      justify-content: 'space-between',
      align-items: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          justify-content: 'center',
          align-items: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
        }}>
          <ShieldCheck size={20} />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', letterSpacing: '-0.3px' }}>
            Transit<span style={{ color: '#0ea5e9' }}>Plus</span> Ops
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            Live WebSocket Online
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          position: 'relative',
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '8px',
          color: '#e2e8f0',
          cursor: 'pointer'
        }}>
          <Bell size={18} />
          {activeAlertsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#f43f5e',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '700',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              justify-content: 'center',
              align-items: 'center'
            }}>
              {activeAlertsCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
