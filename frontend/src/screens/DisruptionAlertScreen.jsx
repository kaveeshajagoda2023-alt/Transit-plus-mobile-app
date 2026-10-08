import React, { useState } from 'react';
import { AlertTriangle, Send, ShieldAlert, CheckCircle, Clock, Navigation, X } from 'lucide-react';

export default function DisruptionAlertScreen() {
  const [incidentType, setIncidentType] = useState('Major Track Maintenance & Road Obstruction');
  const [affectedRoute, setAffectedRoute] = useState('Route 42 Eastbound (Central to University)');
  const [transportType, setTransportType] = useState('Bus & Train');
  const [severity, setSeverity] = useState('High');
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [rerouteText, setRerouteText] = useState('Reroute via Station Road Bypass. Expect 15-min delay.');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 'ALT-1092',
      incidentType: 'Major Track Maintenance & Water Main Burst',
      affectedRoute: 'Route 42 Eastbound (Central to University)',
      delayMinutes: 15,
      severity: 'High',
      broadcastAt: '10:15 AM',
      broadcastBy: 'Admin (IT23762572)'
    }
  ]);

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleBroadcastConfirmed = () => {
    const newAlert = {
      id: 'ALT-' + Math.floor(1000 + Math.random() * 9000),
      incidentType,
      affectedRoute,
      delayMinutes: parseInt(delayMinutes),
      severity,
      broadcastAt: 'Just Now',
      broadcastBy: 'Admin Coordinator (IT23762572)'
    };
    setActiveAlerts([newAlert, ...activeAlerts]);
    setShowConfirmModal(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>FR6, FR7, FR8 — Emergency Operations</div>
        <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#fff', fontWeight: '700' }}>Disruption Alert Composer</h2>
      </div>

      {/* Emergency Incident Form */}
      <form onSubmit={handleOpenConfirm} className="glass-card" style={{ padding: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#f43f5e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={16} />
          Compose System Push Notification
        </div>

        <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Incident Title / Reason</label>
        <input
          type="text"
          className="form-input"
          value={incidentType}
          onChange={(e) => setIncidentType(e.target.value)}
          required
        />

        <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Affected Transport Route</label>
        <select
          className="form-input"
          value={affectedRoute}
          onChange={(e) => setAffectedRoute(e.target.value)}
        >
          <option value="Route 42 Eastbound (Central to University)">Route 42 Eastbound (Central to University)</option>
          <option value="Route 18 Express Rail Line">Route 18 Express Rail Line</option>
          <option value="Route 105 BRT Bus Corridor">Route 105 BRT Bus Corridor</option>
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Severity Level</label>
            <select
              className="form-input"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Delay Duration (+mins)</label>
            <input
              type="number"
              className="form-input"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(e.target.value)}
              min="1"
              max="180"
            />
          </div>
        </div>

        <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Alternative Reroute Instructions</label>
        <textarea
          className="form-input"
          style={{ height: '60px', resize: 'none' }}
          value={rerouteText}
          onChange={(e) => setRerouteText(e.target.value)}
        />

        <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)' }}>
          <Send size={18} />
          Broadcast System Disruption Alert
        </button>
      </form>

      {/* Two-Step Error Prevention Confirmation Modal (UI-03 Solution) */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <ShieldAlert size={40} color="#f43f5e" style={{ margin: '0 auto 8px auto' }} />
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#fff' }}>Confirm Push Broadcast?</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                HCI Error Prevention (H5): Please verify broadcast parameters before dispatching push notifications to all commuters.
              </p>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', padding: '12px', fontSize: '12px', color: '#e2e8f0', marginBottom: '16px' }}>
              <div style={{ marginBottom: '4px' }}><strong>Incident:</strong> {incidentType}</div>
              <div style={{ marginBottom: '4px' }}><strong>Route:</strong> {affectedRoute}</div>
              <div style={{ marginBottom: '4px' }}><strong>Expected Delay:</strong> +{delayMinutes} minutes</div>
              <div><strong>Severity:</strong> <span style={{ color: '#f43f5e', fontWeight: '700' }}>{severity}</span></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'rgba(51, 65, 85, 0.8)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBroadcastConfirmed}
                style={{ background: '#f43f5e', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Yes, Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Broadcasts Feed */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '10px' }}>
          Active Broadcasted Alerts ({activeAlerts.length})
        </div>

        {activeAlerts.map((a) => (
          <div key={a.id} className="glass-card" style={{ padding: '12px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#f43f5e' }}>{a.id} • {a.incidentType}</span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>{a.broadcastAt}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Route: {a.affectedRoute} (+{a.delayMinutes} mins delay)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
