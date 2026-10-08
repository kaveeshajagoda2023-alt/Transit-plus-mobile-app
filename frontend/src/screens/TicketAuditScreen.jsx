import React, { useState } from 'react';
import { Search, AlertOctagon, CheckCircle2, XCircle, Filter, FileText, ChevronRight, X } from 'lucide-react';

export default function TicketAuditScreen() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const ticketAudits = [
    { ticketId: '#TK-9824-B01', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Elena Rosiera', scannedAt: '10:42 AM', conductorId: 'CND-77492', status: 'valid', anomalyReason: '' },
    { ticketId: '#TK-9827-C18', passType: 'Metro Rapid Monthly Pass', routeId: 'Route 18', fare: 680.00, passengerName: 'Kasun Wickrama', scannedAt: '10:38 AM', conductorId: 'CND-88201', status: 'valid', anomalyReason: '' },
    { ticketId: '#TK-9830-D42', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Unknown Commuter', scannedAt: '10:25 AM', conductorId: 'CND-77492', status: 'flagged', anomalyReason: 'Outdoor QR Glare / Low Contrast Scan Retry (UI-01)' },
    { ticketId: '#TK-9833-A05', passType: 'Day Pass (All Routes)', routeId: 'Route 105', fare: 250.00, passengerName: 'Dinuka Fernando', scannedAt: '10:15 AM', conductorId: 'CND-30112', status: 'invalid', anomalyReason: 'Expired Pass Timestamp (Expired 12 mins prior)' },
    { ticketId: '#TK-9838-B12', passType: 'Single Journey Pass', routeId: 'Route 42', fare: 65.00, passengerName: 'Unknown Commuter', scannedAt: '09:55 AM', conductorId: 'CND-77492', status: 'flagged', anomalyReason: 'Duplicate Scan Verification Attempt' },
    { ticketId: '#TK-9842-C09', passType: 'Student Transit Pass', routeId: 'Route 18', fare: 40.00, passengerName: 'Saman Kumara', scannedAt: '09:40 AM', conductorId: 'CND-88201', status: 'valid', anomalyReason: '' }
  ];

  const filteredTickets = ticketAudits.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch = t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.anomalyReason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>US09 — Ticket Financial Audit</div>
        <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#fff', fontWeight: '700' }}>Ticket Audit Hub</h2>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
        <input
          type="text"
          className="form-input"
          placeholder="Search ticket ID, conductor, or anomaly..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '38px', marginBottom: 0 }}
        />
      </div>

      {/* Quick Filter Chips (UI-02 Solution: Quick Filter Chips for Fast Auditing) */}
      <div className="chip-row">
        {[
          { id: 'all', label: 'All Transactions' },
          { id: 'flagged', label: '⚠️ Flagged Only' },
          { id: 'invalid', label: '❌ Invalid Scans' },
          { id: 'valid', label: '✓ Valid Scans' }
        ].map((c) => (
          <button
            key={c.id}
            className={`chip ${filterStatus === c.id ? 'active' : ''}`}
            onClick={() => setFilterStatus(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Vertically Scrollable Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTickets.map((t) => (
          <div
            key={t.ticketId}
            className="glass-card"
            style={{
              padding: '14px',
              marginBottom: 0,
              cursor: 'pointer',
              borderLeft: t.status === 'flagged' ? '4px solid #f59e0b' : t.status === 'invalid' ? '4px solid #f43f5e' : '4px solid #10b981'
            }}
            onClick={() => setSelectedTicket(t)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{t.ticketId}</div>
              <div style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '8px',
                background: t.status === 'flagged' ? 'rgba(245, 158, 11, 0.2)' : t.status === 'invalid' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: t.status === 'flagged' ? '#f59e0b' : t.status === 'invalid' ? '#f43f5e' : '#10b981'
              }}>
                {t.status.toUpperCase()}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>{t.passType} • {t.routeId}</span>
              <span style={{ color: '#fff', fontWeight: '600' }}>Rs {t.fare.toFixed(2)}</span>
            </div>

            {t.anomalyReason && (
              <div style={{ fontSize: '11px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 8px', borderRadius: '6px', marginTop: '6px' }}>
                ⚠️ Anomaly: {t.anomalyReason}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Ticket Audit Details</div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Ticket Reference ID</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0ea5e9', marginBottom: '10px' }}>{selectedTicket.ticketId}</div>

              <div style={{ fontSize: '12px', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Passenger:</strong> {selectedTicket.passengerName}</div>
                <div><strong>Route:</strong> {selectedTicket.routeId}</div>
                <div><strong>Fare Paid:</strong> Rs {selectedTicket.fare.toFixed(2)}</div>
                <div><strong>Scanned Time:</strong> {selectedTicket.scannedAt}</div>
                <div><strong>Conductor Staff ID:</strong> {selectedTicket.conductorId}</div>
              </div>
            </div>

            <button className="btn-primary" onClick={() => setSelectedTicket(null)}>
              Dismiss Audit Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
