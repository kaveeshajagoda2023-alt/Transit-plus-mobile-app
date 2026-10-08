import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Fingerprint, UserCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginScreen({ onLoginSuccess }) {
  const [role, setRole] = useState('Transport Coordinator');
  const [isRegistering, setIsRegistering] = useState(false);
  const [staffId, setStaffId] = useState('CDR-8910@transitpulse.gov');
  const [passcode, setPasscode] = useState('••••••••');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    if (!staffId) {
      setErrorMsg('Please enter your official Staff ID.');
      return;
    }
    // Authenticate Admin Coordinator
    onLoginSuccess({
      staffId: staffId,
      name: 'K. K. Jagoda',
      studentId: 'IT23762572',
      role: role,
      clearance: 'Tier 3 (Master Operations Passcode)'
    });
  };

  return (
    <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          justify-content: 'center',
          align-items: 'center',
          margin: '0 auto 14px auto',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)'
        }}>
          <Shield size={32} color="#fff" />
        </div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', color: '#fff', fontWeight: '700' }}>
          Transit<span style={{ color: '#0ea5e9' }}>Plus</span> Ops Portal
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
          Restricted Administrative Access & Fleet Control (FR1)
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '4px',
        display: 'flex',
        marginBottom: '20px'
      }}>
        {['Passenger', 'Driver / Conductor', 'Transport Coordinator'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: '11px',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              background: role === r ? '#0ea5e9' : 'transparent',
              color: role === r ? '#fff' : '#94a3b8',
              transition: 'all 0.2s ease'
            }}
          >
            {r.split(' ')[0]}
          </button>
        ))}
      </div>

      <form onSubmit={handleAuth} className="glass-card" style={{ padding: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#38bdf8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={16} />
          {isRegistering ? 'New Coordinator Registration' : 'Staff Login & Clearance Verification'}
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', borderRadius: '10px', padding: '10px', fontSize: '12px', color: '#f43f5e', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>
          Official Staff Email / ID
        </label>
        <input
          type="text"
          className="form-input"
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          placeholder="e.g. CDR-8910@transitpulse.gov"
          required
        />

        <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>
          Master Security Passcode
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPasscode ? 'text' : 'password'}
            className="form-input"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter security passcode"
            required
            style={{ paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowPasscode(!showPasscode)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '12px',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
          <Lock size={18} />
          {isRegistering ? 'Register Admin Account' : 'Authenticate Secure Portal'}
        </button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <button
          type="button"
          onClick={() => onLoginSuccess({ staffId: 'CDR-8910@transitpulse.gov', name: 'K. K. Jagoda', role: 'Transport Coordinator' })}
          style={{
            background: 'none',
            border: 'none',
            color: '#0ea5e9',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Fingerprint size={18} />
          Quick Biometric Face ID
        </button>

        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}
        >
          {isRegistering ? 'Back to Login' : 'Register Staff Account'}
        </button>
      </div>
    </div>
  );
}
