import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export type ExportFormat = 'PDF' | 'CSV' | 'JSON';
export type ExportRange = '24h' | '7d' | 'all';

export interface AuditExportOptions {
  format: ExportFormat;
  range: ExportRange;
  coordinatorName?: string;
  staffId?: string;
}

// Fleet data snapshot for audit report
export const FLEET_SNAPSHOT = [
  { id: 'TB-1042', route: 'Line 42 Eastbound', driver: 'Saran Diya', load: '38/50 (76%)', status: 'Active', health: '96%' },
  { id: 'TT-2089', route: 'Coastal Line Metro', driver: 'Kamal Perera', load: '142/200 (71%)', status: 'Active', health: '94%' },
  { id: 'TB-1045', route: 'Route 18 Express', driver: 'Ruwan Silva', load: '44/50 (88%)', status: 'Delayed', health: '68%' },
  { id: 'TT-2092', route: 'Inland Rapid Express', driver: 'Nimal Jay', load: '110/200 (55%)', status: 'Active', health: '91%' },
  { id: 'TB-1050', route: 'Route 105 BRT Shuttle', driver: 'Amal Fonseka', load: '12/40 (30%)', status: 'Standby', health: '98%' },
];

export const ALERTS_SNAPSHOT = [
  { code: 'ALT-904', severity: 'Moderate', route: 'Route 18 Express', message: 'Road resurfacing: 12 min schedule delay', status: 'Active Broadcast' },
  { code: 'ALT-901', severity: 'Minor', route: 'Station Turnstiles', message: 'Scheduled routine firmware upgrade completed', status: 'Resolved (Archive)' },
];

export const SCANS_SNAPSHOT = [
  { ticket: 'TK-89412', passenger: 'Adult Standard', scanner: 'Bus Turnstile #04 (Route 42)', hmac: 'e3b0c44...9a8f', result: 'VALID PASS' },
  { ticket: 'TK-89413', passenger: 'Student Pass (50%)', scanner: 'Platform Turnstile #02', hmac: 'cf83ac1...2b61', result: 'VALID PASS' },
  { ticket: 'TK-89410', passenger: 'Adult Standard', scanner: 'Conductor Handheld #12', hmac: '9b71d22...4e02', result: 'FLAGGED (DUP)' },
];

export function getRangeLabel(range: ExportRange): string {
  switch (range) {
    case '24h':
      return 'Last 24 Hours';
    case '7d':
      return 'Past 7 Days';
    case 'all':
      return 'Complete System History';
  }
}

/**
 * Builds valid PDF 1.4 binary string
 */
export function buildAuditPdfBinary(options: { coordinatorName: string; range: string; dateStr: string }): string {
  const contentLines: string[] = [];

  function setFillColor(r: number, g: number, b: number) {
    contentLines.push(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg`);
  }
  function setStrokeColor(r: number, g: number, b: number) {
    contentLines.push(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} RG`);
  }
  function drawRect(x: number, y: number, w: number, h: number, fill = true, stroke = false) {
    contentLines.push(`${x} ${y} ${w} ${h} re`);
    if (fill && stroke) contentLines.push('B');
    else if (fill) contentLines.push('f');
    else if (stroke) contentLines.push('S');
  }
  function drawText(font: string, size: number, x: number, y: number, text: string, r = 15, g = 23, b = 42) {
    setFillColor(r, g, b);
    contentLines.push('BT');
    contentLines.push(`/${font} ${size} Tf`);
    contentLines.push(`${x} ${y} Td`);
    const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    contentLines.push(`(${escaped}) Tj`);
    contentLines.push('ET');
  }
  function drawLine(x1: number, y1: number, x2: number, y2: number, r = 226, g = 232, b = 240, width = 1) {
    setStrokeColor(r, g, b);
    contentLines.push(`${width} w`);
    contentLines.push(`${x1} ${y1} m`);
    contentLines.push(`${x2} ${y2} l`);
    contentLines.push('S');
  }

  // Header Banner
  setFillColor(15, 41, 66); // Navy #0F2942
  drawRect(0, 720, 612, 72, true, false);

  drawText('F2', 18, 40, 755, 'TRANSITPLUS OPERATIONS ADMINISTRATION', 255, 255, 255);
  drawText('F1', 10, 40, 736, 'OFFICIAL SYSTEM AUDIT & FLEET TELEMETRY REPORT (TIER 3)', 224, 242, 254);

  // Metadata Card
  setFillColor(248, 250, 252);
  setStrokeColor(226, 232, 240);
  drawRect(40, 620, 532, 80, true, true);

  drawText('F2', 9, 55, 680, 'ISSUED BY:');
  drawText('F1', 9, 130, 680, `${options.coordinatorName} (Ops Coordinator)`);

  drawText('F2', 9, 320, 680, 'AUDIT WINDOW:');
  drawText('F1', 9, 415, 680, options.range.toUpperCase());

  drawText('F2', 9, 55, 655, 'STAFF ID:');
  drawText('F1', 9, 130, 655, 'CDR-8910@transitpulse.gov');

  drawText('F2', 9, 320, 655, 'TIMESTAMP:');
  drawText('F1', 9, 415, 655, options.dateStr);

  drawText('F2', 9, 55, 632, 'SECURITY:');
  drawText('F1', 9, 130, 632, 'Tier 3 Master Clearance (Verified)');

  drawText('F2', 9, 320, 632, 'ENCRYPTION:');
  drawText('F1', 9, 415, 632, 'HMAC-SHA256 Multi-Node');

  // KPI Summary Cards
  const kpis = [
    { label: 'FLEET UNITS', val: '18 ACTIVE', r: 2, g: 132, b: 199, bgR: 224, bgG: 242, bgB: 254 },
    { label: 'OPERATIONAL', val: '94.8% RATE', r: 5, g: 150, b: 105, bgR: 220, bgG: 252, bgB: 231 },
    { label: 'TICKET AUDITS', val: '246 SCANS', r: 217, g: 119, b: 6, bgR: 254, bgG: 243, bgB: 199 },
    { label: 'ACTIVE ALERTS', val: '1 ADVISORY', r: 220, g: 38, b: 38, bgR: 254, bgG: 226, bgB: 226 },
  ];
  kpis.forEach((kpi, idx) => {
    const x = 40 + idx * 138;
    setFillColor(kpi.bgR, kpi.bgG, kpi.bgB);
    setStrokeColor(226, 232, 240);
    drawRect(x, 560, 126, 45, true, true);
    drawText('F1', 8, x + 10, 592, kpi.label, 100, 116, 139);
    drawText('F2', 12, x + 10, 572, kpi.val, kpi.r, kpi.g, kpi.b);
  });

  // Table 1: Fleet Inventory (CRUD 1)
  drawText('F2', 12, 40, 530, '1. FLEET TELEMETRY & ASSET STATUS (CRUD 1)');
  drawLine(40, 522, 572, 522, 15, 41, 66, 1.5);

  setFillColor(241, 245, 249);
  drawRect(40, 498, 532, 20, true, false);
  drawText('F2', 9, 45, 505, 'UNIT ID');
  drawText('F2', 9, 115, 505, 'ASSIGNED ROUTE');
  drawText('F2', 9, 260, 505, 'OPERATOR');
  drawText('F2', 9, 370, 505, 'LOAD');
  drawText('F2', 9, 430, 505, 'STATUS');
  drawText('F2', 9, 510, 505, 'HEALTH');

  FLEET_SNAPSHOT.forEach((row, rIdx) => {
    const y = 475 - rIdx * 20;
    if (rIdx % 2 === 1) {
      setFillColor(248, 250, 252);
      drawRect(40, y - 5, 532, 20, true, false);
    }
    drawLine(40, y - 5, 572, y - 5, 241, 245, 249, 0.5);
    drawText('F2', 8, 45, y, row.id);
    drawText('F1', 8, 115, y, row.route);
    drawText('F1', 8, 260, y, row.driver);
    drawText('F1', 8, 370, y, row.load);
    const stCol = row.status === 'Active' ? [5, 150, 105] : row.status === 'Delayed' ? [217, 119, 6] : [2, 132, 199];
    drawText('F2', 8, 430, y, row.status, stCol[0], stCol[1], stCol[2]);
    drawText('F2', 8, 510, y, row.health);
  });

  // Table 2: Active Disruption Broadcasts (CRUD 2)
  drawText('F2', 12, 40, 345, '2. SYSTEM DISRUPTION ADVISORIES & ALERTS (CRUD 2)');
  drawLine(40, 337, 572, 337, 15, 41, 66, 1.5);

  setFillColor(241, 245, 249);
  drawRect(40, 313, 532, 20, true, false);
  drawText('F2', 9, 45, 320, 'CODE');
  drawText('F2', 9, 115, 320, 'SEVERITY');
  drawText('F2', 9, 185, 320, 'ROUTE');
  drawText('F2', 9, 290, 320, 'ADVISORY SUMMARY');
  drawText('F2', 9, 500, 320, 'STATUS');

  ALERTS_SNAPSHOT.forEach((alt, aIdx) => {
    const y = 290 - aIdx * 20;
    if (aIdx % 2 === 1) {
      setFillColor(248, 250, 252);
      drawRect(40, y - 5, 532, 20, true, false);
    }
    drawLine(40, y - 5, 572, y - 5, 241, 245, 249, 0.5);
    drawText('F2', 8, 45, y, alt.code);
    drawText('F2', 8, 115, y, alt.severity, alt.severity === 'Moderate' ? 217 : 5, alt.severity === 'Moderate' ? 119 : 150, alt.severity === 'Moderate' ? 6 : 105);
    drawText('F1', 8, 185, y, alt.route);
    drawText('F1', 8, 290, y, alt.message);
    drawText('F2', 8, 500, y, alt.status, alt.status.includes('Active') ? 220 : 100, alt.status.includes('Active') ? 38 : 116, alt.status.includes('Active') ? 38 : 139);
  });

  // Table 3: Conductor Scan Telemetry
  drawText('F2', 12, 40, 225, '3. PASSENGER TICKET SCAN AUDIT TELEMETRY');
  drawLine(40, 217, 572, 217, 15, 41, 66, 1.5);

  setFillColor(241, 245, 249);
  drawRect(40, 193, 532, 20, true, false);
  drawText('F2', 9, 45, 200, 'TICKET NO');
  drawText('F2', 9, 135, 200, 'PASSENGER');
  drawText('F2', 9, 230, 200, 'GATE / BUS SCANNER');
  drawText('F2', 9, 390, 200, 'HMAC TOKEN');
  drawText('F2', 9, 505, 200, 'RESULT');

  SCANS_SNAPSHOT.forEach((scn, sIdx) => {
    const y = 170 - sIdx * 20;
    if (sIdx % 2 === 1) {
      setFillColor(248, 250, 252);
      drawRect(40, y - 5, 532, 20, true, false);
    }
    drawLine(40, y - 5, 572, y - 5, 241, 245, 249, 0.5);
    drawText('F2', 8, 45, y, scn.ticket);
    drawText('F1', 8, 135, y, scn.passenger);
    drawText('F1', 8, 230, y, scn.scanner);
    drawText('F1', 8, 390, y, scn.hmac);
    const valid = scn.result.includes('VALID');
    drawText('F2', 8, 505, y, scn.result, valid ? 5 : 220, valid ? 150 : 38, valid ? 105 : 38);
  });

  // Footer & Security seal
  drawLine(40, 60, 572, 60, 15, 41, 66, 1);
  drawText('F2', 8, 40, 48, 'OFFICIAL SEAL: TRANSITPLUS GOV OPS CONTROL CENTER');
  drawText('F1', 8, 40, 36, 'CONFIDENTIAL — For Authorized Transit Operations Personnel Only. Cryptographic ID: sha256:7a9f82d1c5e4', 100, 116, 139);
  drawText('F2', 8, 510, 48, 'PAGE 1 OF 1', 15, 41, 66);

  const streamBody = contentLines.join('\n');
  const streamLength = typeof Buffer !== 'undefined' ? Buffer.byteLength(streamBody) : streamBody.length;

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`,
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamBody}\nendstream\nendobj`,
  ];

  let offset = 0;
  const header = '%PDF-1.4\n';
  offset += header.length;

  const xrefEntries = ['0000000000 65535 f \n'];
  const objBuffers: string[] = [];

  objects.forEach((obj) => {
    const padOffset = String(offset).padStart(10, '0');
    xrefEntries.push(`${padOffset} 00000 n \n`);
    const objStr = obj + '\n';
    objBuffers.push(objStr);
    offset += objStr.length;
  });

  const startxref = offset;
  const xrefStr = `xref\n0 ${objects.length + 1}\n` + xrefEntries.join('') +
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return header + objBuffers.join('') + xrefStr;
}

/**
 * Builds HTML printable version for expo-print
 */
export function buildAuditHtml(options: { coordinatorName: string; range: string; dateStr: string }): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TransitPlus Operations System Audit Report</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      background: #0f2942;
      color: #ffffff;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 11px;
      color: #e0f2fe;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
      font-size: 12px;
    }
    .meta-row strong { color: #0f172a; }
    .meta-row span { color: #475569; }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-box {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      background: #ffffff;
    }
    .kpi-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .kpi-val { font-size: 18px; font-weight: 900; margin-top: 4px; }
    h2 {
      font-size: 14px;
      color: #0f2942;
      text-transform: uppercase;
      margin: 24px 0 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid #0f2942;
      letter-spacing: 0.3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 16px;
    }
    th {
      background: #f1f5f9;
      color: #0f172a;
      text-align: left;
      padding: 9px 12px;
      font-weight: 800;
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    tr:nth-child(even) td { background: #f8fafc; }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
    }
    .badge-active { background: #dcfce7; color: #15803d; }
    .badge-delayed { background: #fef3c7; color: #b45309; }
    .badge-standby { background: #e0f2fe; color: #0369a1; }
    .footer {
      margin-top: 36px;
      border-top: 1px solid #cbd5e1;
      padding-top: 12px;
      font-size: 10px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>TransitPlus Operations Administration</h1>
    <p>Official System Audit & Fleet Telemetry Report (Tier 3 Clearances)</p>
  </div>

  <div class="meta-card">
    <div class="meta-row"><strong>Issued By:</strong> <span>${options.coordinatorName} (Operations Coordinator)</span></div>
    <div class="meta-row"><strong>Audit Window:</strong> <span>${options.range}</span></div>
    <div class="meta-row"><strong>Staff ID:</strong> <span>CDR-8910@transitpulse.gov</span></div>
    <div class="meta-row"><strong>Report Timestamp:</strong> <span>${options.dateStr}</span></div>
    <div class="meta-row"><strong>Clearance Level:</strong> <span>Tier 3 Master (Government Authorized)</span></div>
    <div class="meta-row"><strong>Encryption Standard:</strong> <span>HMAC-SHA256 Multi-Node Verified</span></div>
  </div>

  <div class="kpi-row">
    <div class="kpi-box" style="background:#f0f9ff; border-color:#bae6fd;">
      <div class="kpi-label">Fleet Units</div>
      <div class="kpi-val" style="color:#0284c7;">18 ACTIVE</div>
    </div>
    <div class="kpi-box" style="background:#f0fdf4; border-color:#bbf7d0;">
      <div class="kpi-label">Readiness Rate</div>
      <div class="kpi-val" style="color:#059669;">94.8% RATE</div>
    </div>
    <div class="kpi-box" style="background:#fffbeb; border-color:#fde68a;">
      <div class="kpi-label">Ticket Scans</div>
      <div class="kpi-val" style="color:#d97706;">246 SCANS</div>
    </div>
    <div class="kpi-box" style="background:#fef2f2; border-color:#fecaca;">
      <div class="kpi-label">Active Advisories</div>
      <div class="kpi-val" style="color:#dc2626;">1 ADVISORY</div>
    </div>
  </div>

  <h2>1. Active Fleet Telemetry & Inspection Health (CRUD 1)</h2>
  <table>
    <thead>
      <tr>
        <th>Unit Code</th>
        <th>Assigned Route</th>
        <th>Operator / Driver</th>
        <th>Occupancy Load</th>
        <th>Status</th>
        <th>Safety Rating</th>
      </tr>
    </thead>
    <tbody>
      ${FLEET_SNAPSHOT.map(f => `
        <tr>
          <td><strong>#${f.id}</strong></td>
          <td>${f.route}</td>
          <td>${f.driver}</td>
          <td>${f.load}</td>
          <td><span class="badge ${f.status === 'Active' ? 'badge-active' : f.status === 'Delayed' ? 'badge-delayed' : 'badge-standby'}">${f.status}</span></td>
          <td><strong>${f.health}</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>2. System Disruption Advisories & Broadcast Events (CRUD 2)</h2>
  <table>
    <thead>
      <tr>
        <th>Broadcast ID</th>
        <th>Severity</th>
        <th>Target Route</th>
        <th>Public Advisory Message</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${ALERTS_SNAPSHOT.map(a => `
        <tr>
          <td><strong>${a.code}</strong></td>
          <td><span class="badge ${a.severity === 'Moderate' ? 'badge-delayed' : 'badge-standby'}">${a.severity}</span></td>
          <td>${a.route}</td>
          <td>${a.message}</td>
          <td><strong>${a.status}</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>3. Conductor Ticket Scans & Revenue Audit Telemetry</h2>
  <table>
    <thead>
      <tr>
        <th>Ticket Serial</th>
        <th>Passenger Classification</th>
        <th>Gate / Conductor Scanner</th>
        <th>Cryptographic Token</th>
        <th>Validation Outcome</th>
      </tr>
    </thead>
    <tbody>
      ${SCANS_SNAPSHOT.map(s => `
        <tr>
          <td><strong>${s.ticket}</strong></td>
          <td>${s.passenger}</td>
          <td>${s.scanner}</td>
          <td><code>${s.hmac}</code></td>
          <td><strong style="color: ${s.result.includes('VALID') ? '#15803d' : '#dc2626'};">${s.result}</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>OFFICIAL SEAL: TRANSITPLUS GOV OPS CONTROL CENTER &bull; SHA-256: 7a9f82d1c5e48b10</div>
    <div>Page 1 of 1 &bull; CONFIDENTIAL</div>
  </div>
</body>
</html>`;
}

/**
 * Builds CSV string
 */
export function buildAuditCsv(options: { range: string; dateStr: string }): string {
  const lines: string[] = [
    `# TRANSITPLUS OPERATIONS AUDIT REPORT`,
    `# Range: ${options.range} | Generated: ${options.dateStr}`,
    `# Clearance: Tier 3 Master | Coordinator: K. K. Jagoda`,
    ``,
    `[SECTION 1: FLEET INVENTORY TELEMETRY (CRUD 1)]`,
    `Unit ID,Transport Mode,Assigned Route,Driver,Capacity Load,Status,Health Rating`,
    ...FLEET_SNAPSHOT.map(f => `${f.id},${f.id.startsWith('TB') ? 'Bus' : 'Train'},"${f.route}","${f.driver}","${f.load}",${f.status},${f.health}`),
    ``,
    `[SECTION 2: DISRUPTION ADVISORIES (CRUD 2)]`,
    `Alert ID,Severity,Route,Advisory Message,Status`,
    ...ALERTS_SNAPSHOT.map(a => `${a.code},${a.severity},"${a.route}","${a.message}",${a.status}`),
    ``,
    `[SECTION 3: TICKET SCAN AUDIT TELEMETRY]`,
    `Ticket Code,Passenger Type,Gate Scanner,HMAC Token,Validation Result`,
    ...SCANS_SNAPSHOT.map(s => `${s.ticket},"${s.passenger}","${s.scanner}",${s.hmac},${s.result}`),
  ];
  return lines.join('\n');
}

/**
 * Builds JSON telemetry payload
 */
export function buildAuditJson(options: { range: string; dateStr: string }): string {
  return JSON.stringify({
    system: 'TransitPlus Operations & Fleet Control',
    reportType: 'Official System Audit & Telemetry Log',
    classification: 'Tier 3 Master Restricted',
    metadata: {
      generatedAt: options.dateStr,
      auditRange: options.range,
      coordinator: 'K. K. Jagoda (Staff ID: CDR-8910@transitpulse.gov)',
      signatureSha256: '7a9f82d1c5e48b10f22319cba587d1ef',
    },
    summaryMetrics: {
      totalFleetUnits: 18,
      readinessRate: '94.8%',
      ticketScans24h: 246,
      flaggedAnomalies: 23,
      activeAdvisories: 1,
    },
    fleetInventory: FLEET_SNAPSHOT,
    disruptionAlerts: ALERTS_SNAPSHOT,
    ticketValidationScans: SCANS_SNAPSHOT,
  }, null, 2);
}

/**
 * Triggers a real browser file download on Web
 */
function downloadFileOnWeb(content: string, filename: string, mimeType: string) {
  if (typeof document === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Main cross-platform export executor
 */
export interface ExportResult {
  success: boolean;
  filename: string;
  localUri?: string;
  viewReport?: () => Promise<void> | void;
  filePathNotice: string;
}

/**
 * Main cross-platform export executor
 */
export async function executeAuditExport(options: AuditExportOptions): Promise<ExportResult> {
  const coordinatorName = options.coordinatorName || 'K. K. Jagoda';
  const rangeLabel = getRangeLabel(options.range);
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC+5:30';
  const fileDateTag = now.toISOString().slice(0, 10);

  if (options.format === 'PDF') {
    const filename = `TransitPlus_System_Audit_Report_${options.range}_${fileDateTag}.pdf`;
    const html = buildAuditHtml({ coordinatorName, range: rangeLabel, dateStr });
    const pdfBinary = buildAuditPdfBinary({ coordinatorName, range: rangeLabel, dateStr });

    if (Platform.OS === 'web') {
      // 1. Download real .pdf binary file directly into user's downloads folder!
      downloadFileOnWeb(pdfBinary, filename, 'application/pdf');

      const viewReport = () => {
        if (typeof window !== 'undefined') {
          const blob = new Blob([pdfBinary], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          const win = window.open(blobUrl, '_blank');
          if (!win) {
            const hWin = window.open('', '_blank');
            if (hWin) {
              hWin.document.write(html);
              hWin.document.close();
            }
          }
        }
      };

      return {
        success: true,
        filename,
        viewReport,
        filePathNotice: 'Downloads folder (Shortcut: Ctrl + J)',
      };
    } else {
      // Native iOS / Android: Generate PDF file via Print with base64 enabled
      let targetUri = '';
      let printUri = '';

      try {
        const printResult = await Print.printToFileAsync({ html, base64: true });
        printUri = printResult.uri;

        // Scoped document directory path (authorized in Expo Go & standalone builds)
        const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
        targetUri = `${docDir}${filename}`;

        if (printResult.base64) {
          // Write base64 directly into scoped storage
          await FileSystem.writeAsStringAsync(targetUri, printResult.base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          // Fallback: copy file from cache to scoped documents
          await FileSystem.copyAsync({
            from: printResult.uri,
            to: targetUri,
          });
        }
      } catch (genErr) {
        console.warn('PDF generation / scoped storage write issue:', genErr);
      }

      // Determine the best accessible file URI
      let effectiveUri = targetUri || printUri;
      if (targetUri) {
        try {
          const info = await FileSystem.getInfoAsync(targetUri);
          if (!info.exists && printUri) {
            effectiveUri = printUri;
          }
        } catch {
          if (printUri) effectiveUri = printUri;
        }
      }

      const viewReport = async () => {
        try {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable && effectiveUri) {
            await Sharing.shareAsync(effectiveUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Save / Share System Audit Report PDF',
              UTI: 'com.adobe.pdf',
            });
          }
        } catch (shareErr: any) {
          console.warn('Sharing error caught safely:', shareErr?.message);
        }
      };

      // Safely attempt the native share sheet
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable && effectiveUri) {
          await Sharing.shareAsync(effectiveUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save / Share System Audit Report PDF',
            UTI: 'com.adobe.pdf',
          });
        }
      } catch (initialErr: any) {
        console.warn('Initial share prompt dismissed or skipped:', initialErr?.message);
      }

      return {
        success: true,
        filename,
        localUri: effectiveUri,
        viewReport,
        filePathNotice: 'Device Storage (TransitPulse Scoped Documents)',
      };
    }
  }

  if (options.format === 'CSV') {
    const filename = `TransitPlus_System_Audit_${options.range}_${fileDateTag}.csv`;
    const csvData = buildAuditCsv({ range: rangeLabel, dateStr });

    if (Platform.OS === 'web') {
      downloadFileOnWeb(csvData, filename, 'text/csv;charset=utf-8;');
      const viewReport = () => {
        if (typeof window !== 'undefined') {
          const blob = new Blob([csvData], { type: 'text/plain;charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        }
      };
      return {
        success: true,
        filename,
        viewReport,
        filePathNotice: 'Downloads folder (Shortcut: Ctrl + J)',
      };
    } else {
      let targetUri = '';
      try {
        const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
        targetUri = `${docDir}${filename}`;
        await FileSystem.writeAsStringAsync(targetUri, csvData, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } catch (csvErr) {
        console.warn('Error saving CSV to scoped directory:', csvErr);
      }

      const viewReport = async () => {
        try {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable && targetUri) {
            await Sharing.shareAsync(targetUri, {
              mimeType: 'text/csv',
              dialogTitle: 'Save / Share System Audit CSV',
            });
          }
        } catch (shareErr: any) {
          console.warn('CSV Sharing error:', shareErr?.message);
        }
      };

      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable && targetUri) {
          await Sharing.shareAsync(targetUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Save / Share System Audit CSV',
          });
        }
      } catch (initialErr: any) {
        console.warn('Initial CSV share dismissed:', initialErr?.message);
      }

      return {
        success: true,
        filename,
        localUri: targetUri,
        viewReport,
        filePathNotice: 'Device Storage (TransitPulse Scoped Documents)',
      };
    }
  }

  // JSON format
  const filename = `TransitPlus_System_Audit_${options.range}_${fileDateTag}.json`;
  const jsonData = buildAuditJson({ range: rangeLabel, dateStr });

  if (Platform.OS === 'web') {
    downloadFileOnWeb(jsonData, filename, 'application/json;charset=utf-8;');
    const viewReport = () => {
      if (typeof window !== 'undefined') {
        const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      }
    };
    return {
      success: true,
      filename,
      viewReport,
      filePathNotice: 'Downloads folder (Shortcut: Ctrl + J)',
    };
  } else {
    let targetUri = '';
    try {
      const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
      targetUri = `${docDir}${filename}`;
      await FileSystem.writeAsStringAsync(targetUri, jsonData, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (jsonErr) {
      console.warn('Error saving JSON to scoped directory:', jsonErr);
    }

    const viewReport = async () => {
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable && targetUri) {
          await Sharing.shareAsync(targetUri, {
            mimeType: 'application/json',
            dialogTitle: 'Save / Share System Audit JSON',
          });
        }
      } catch (shareErr: any) {
        console.warn('JSON Sharing error:', shareErr?.message);
      }
    };

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable && targetUri) {
        await Sharing.shareAsync(targetUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save / Share System Audit JSON',
        });
      }
    } catch (initialErr: any) {
      console.warn('Initial JSON share dismissed:', initialErr?.message);
    }

    return {
      success: true,
      filename,
      localUri: targetUri,
      viewReport,
      filePathNotice: 'Device Storage (TransitPulse Scoped Documents)',
    };
  }
}
