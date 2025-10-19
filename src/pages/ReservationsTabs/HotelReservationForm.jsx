import React, { useEffect, useMemo, useState } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #444',
    borderRadius: '12px',
    width: 'min(1100px, 95vw)',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '20px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px'
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: 500,
    fontSize: '14px'
  },
  input: {
    marginTop: '6px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: '14px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#1b1b1b',
    border: '1px solid #333',
    marginTop: '16px'
  },
  th: {
    backgroundColor: '#242424',
    borderBottom: '1px solid #333',
    padding: '10px',
    textAlign: 'left',
    position: 'sticky',
    top: 0
  },
  td: {
    borderBottom: '1px solid #333',
    padding: 0
  },
  cellInput: {
    width: '100%',
    padding: '10px',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: 'white'
  },
  actionRow: {
    marginTop: '18px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  btn: (bg = '#6c757d') => ({
    backgroundColor: bg,
    color: 'white',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer'
  })
};

const normalize = (s) => {
  return (s || '')
    .toString()
    .toLowerCase()
    .replace(/hotel|resort|lodge|&|&/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const headerMapByLang = {
  English: ["From Date","To Date","Pax","SGL","DBL","TRP","Other","Meals","Notes","Room Type","Confirmation Number","Ref"],
  Arabic: ["من تاريخ","إلى تاريخ","أفراد","مفرد","مزدوج","ثلاثي","أخرى","الوجبات","ملاحظات","نوع الغرفة","رقم التأكيد","مرجع"],
  French: ["Du","Au","Pax","SGL","DBL","TRP","Autre","Repas","Notes","Type de chambre","N° de confirmation","Réf"],
  German: ["Von","Bis","Pax","EZ","DZ","TZ","Sonst.","Mahlzeiten","Notizen","Zimmertyp","Bestätigungsnr.","Ref"],
  Spanish: ["Desde","Hasta","Pax","SGL","DBL","TRP","Otro","Comidas","Notas","Tipo de Hab.","N° confirmación","Ref"]
};

export default function HotelReservationForm({ fileNo, reservation, hotel, onClose }) {
  const [facilities, setFacilities] = useState([]);
  const [toEmail, setToEmail] = useState('');
  const [tel, setTel] = useState('');

  const [formName] = useState('Hotel Reservation Form');
  const [groupName] = useState(reservation?.generalData?.groupName || reservation?.groupName || '');
  const [hotelName] = useState(hotel?.hotelName || '');
  const [gurCode, setGurCode] = useState('');
  const [att, setAtt] = useState('');
  const [theme, setTheme] = useState('Style 1');
  const [language, setLanguage] = useState('English');
  const [checked, setChecked] = useState({ reservation: true, amendment: false, cancellation: false });

  const [rows, setRows] = useState(() => {
    const r0 = {
      from: hotel?.checkIn || '',
      to: hotel?.checkOut || '',
      pax: hotel?.pax || '',
      sgl: hotel?.sgl || '',
      dbl: hotel?.dbl || '',
      trp: hotel?.trp || '',
      other: hotel?.other || '',
      meals: hotel?.meal || '',
      notes: hotel?.notes || '',
      roomType: hotel?.roomType || '',
      conf: hotel?.confNo || '',
      ref: hotel?.ref || ''
    };
    return [r0, { ...r0, notes: '' }, { ...r0, notes: '' }];
  });

  const subject = useMemo(() => {
    const from = rows?.[0]?.from || '';
    const to = rows?.[0]?.to || '';
    const parts = [
      hotelName || '',
      fileNo || '',
      groupName || '',
      from || '',
      to || ''
    ].filter(Boolean);
    return parts.join(' | ');
  }, [hotelName, fileNo, groupName, rows]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/data/Facilities.json?v=${Date.now()}`);
        const json = await res.json();
        if (!cancelled) setFacilities(Array.isArray(json) ? json : []);
      } catch (e) {
        console.warn('Failed to load Facilities.json', e);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hotelName || facilities.length === 0) return;
    const target = normalize(hotelName);
    let best = null;
    for (const f of facilities) {
      const name = normalize(f?.Account_Name);
      if (!name) continue;
      if (name === target) { best = f; break; }
      if (!best && (name.includes(target) || target.includes(name))) best = f;
    }
    const rawEmail = (best?.Email || '').toString();
    const chosenEmail = rawEmail.split(/[;,]/).map(s => s.trim()).filter(Boolean)[0] || '';
    setToEmail(chosenEmail);
    setTel((best?.Tel || best?.Mobile || '').toString());
  }, [hotelName, facilities]);

  const headerCells = headerMapByLang[language] || headerMapByLang.English;

  const updateCell = (i, key, value) => {
    setRows(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  };

  const buildHtml = () => {
    const palette = theme === 'Style 2'
      ? { headerBg: '#0d47a1', stripe: '#0f172a' }
      : theme === 'Style 3'
      ? { headerBg: '#2e7d32', stripe: '#1b3420' }
      : { headerBg: '#6c757d', stripe: '#232323' };

    const rowsHtml = rows.map(r => `
      <tr>
        <td>${r.from || ''}</td>
        <td>${r.to || ''}</td>
        <td>${r.pax || ''}</td>
        <td>${r.sgl || ''}</td>
        <td>${r.dbl || ''}</td>
        <td>${r.trp || ''}</td>
        <td>${r.other || ''}</td>
        <td>${r.meals || ''}</td>
        <td>${r.notes || ''}</td>
        <td>${r.roomType || ''}</td>
        <td>${r.conf || ''}</td>
        <td>${r.ref || ''}</td>
      </tr>
    `).join('');

    const checks = [
      checked.reservation ? 'Reservation' : null,
      checked.amendment ? 'Amendment' : null,
      checked.cancellation ? 'Cancellation' : null
    ].filter(Boolean).join(' | ');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>${subject}</title>
      </head>
      <body style="font-family:Segoe UI,Arial,sans-serif;background:#121212;color:#fff;">
        <div style="padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div>
              <div style="font-size:20px;font-weight:700;">${formName}</div>
              <div style="color:#ccc;margin-top:4px;">${hotelName}</div>
            </div>
            <div style="text-align:right;color:#ccc;">
              <div>${checks}</div>
              <div>Tel: ${tel || '-'}</div>
              <div>Email: ${toEmail || '-'}</div>
            </div>
          </div>

          <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:10px;color:#ddd;">
            <div>Group Name: <b>${groupName || '-'}</b></div>
            <div>File No: <b>${fileNo || '-'}</b></div>
            <div>Gur. Code: <b>${gurCode || '-'}</b></div>
            <div>ATT: <b>${att || '-'}</b></div>
          </div>

          <table style="width:100%;border-collapse:collapse;border:1px solid #333;">
            <thead>
              <tr style="background:${palette.headerBg};">
                ${headerCells.map(hc => `<th style="padding:10px;border-bottom:1px solid #333;text-align:left;">${hc}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
  };

  const downloadEml = () => {
    const html = buildHtml();
    const headers = [
      `To: ${toEmail || ''}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8'
    ].join('\r\n');
    const eml = `${headers}\r\n\r\n${html}`;
    const blob = new Blob([eml], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(hotelName || 'hotel').replace(/\s+/g,'_')}_${fileNo}_reservation.eml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openMailto = () => {
    const html = buildHtml();
    const textFallback = html
      .replace(/<style[\s\S]*?<\/style>/gi,'')
      .replace(/<[^>]+>/g,' ')
      .replace(/\s+/g,' ')
      .trim()
      .slice(0, 1500);
    const link = `mailto:${encodeURIComponent(toEmail || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textFallback)}`;
    window.location.href = link;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>Hotel Reservation – {hotelName}</h3>
          <button onClick={onClose} style={styles.btn('#c62828')}>Close</button>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={styles.grid}>
              <label style={styles.label}>
                Form Name
                <input style={styles.input} value={formName} readOnly />
              </label>
              <label style={styles.label}>
                Group Name
                <input style={styles.input} value={groupName} readOnly />
              </label>
              <label style={styles.label}>
                Hotel Name
                <input style={styles.input} value={hotelName} readOnly />
              </label>
              <label style={styles.label}>
                Gur. Code
                <input style={styles.input} value={gurCode} onChange={e => setGurCode(e.target.value)} />
              </label>
              <label style={styles.label}>
                ATT
                <input style={styles.input} value={att} onChange={e => setAtt(e.target.value)} />
              </label>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={styles.grid}>
              <label style={styles.label}>
                Tel
                <input style={styles.input} value={tel} onChange={e => setTel(e.target.value)} />
              </label>
              <label style={styles.label}>
                Email
                <input style={styles.input} value={toEmail} onChange={e => setToEmail(e.target.value)} />
              </label>
              <label style={styles.label}>
                Theme
                <select style={styles.input} value={theme} onChange={e => setTheme(e.target.value)}>
                  <option>Style 1</option>
                  <option>Style 2</option>
                  <option>Style 3</option>
                </select>
              </label>
              <label style={styles.label}>
                Language
                <select style={styles.input} value={language} onChange={e => setLanguage(e.target.value)}>
                  {Object.keys(headerMapByLang).map(l => (<option key={l}>{l}</option>))}
                </select>
              </label>
              <label style={styles.label}>
                Email Subject
                <input style={styles.input} value={subject} readOnly />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={checked.reservation} onChange={e => setChecked(s => ({ ...s, reservation: e.target.checked }))} />
                Reservation
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={checked.amendment} onChange={e => setChecked(s => ({ ...s, amendment: e.target.checked }))} />
                Amendment
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={checked.cancellation} onChange={e => setChecked(s => ({ ...s, cancellation: e.target.checked }))} />
                Cancellation
              </label>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {headerCells.map((h, i) => (<th key={i} style={styles.th}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={styles.td}><input type="date" style={styles.cellInput} value={r.from} onChange={e => updateCell(i,'from',e.target.value)} /></td>
                  <td style={styles.td}><input type="date" style={styles.cellInput} value={r.to} onChange={e => updateCell(i,'to',e.target.value)} /></td>
                  <td style={styles.td}><input type="number" style={styles.cellInput} value={r.pax} onChange={e => updateCell(i,'pax',e.target.value)} /></td>
                  <td style={styles.td}><input type="number" style={styles.cellInput} value={r.sgl} onChange={e => updateCell(i,'sgl',e.target.value)} /></td>
                  <td style={styles.td}><input type="number" style={styles.cellInput} value={r.dbl} onChange={e => updateCell(i,'dbl',e.target.value)} /></td>
                  <td style={styles.td}><input type="number" style={styles.cellInput} value={r.trp} onChange={e => updateCell(i,'trp',e.target.value)} /></td>
                  <td style={styles.td}><input type="number" style={styles.cellInput} value={r.other} onChange={e => updateCell(i,'other',e.target.value)} /></td>
                  <td style={styles.td}><input type="text" style={styles.cellInput} value={r.meals} onChange={e => updateCell(i,'meals',e.target.value)} /></td>
                  <td style={styles.td}><input type="text" style={styles.cellInput} value={r.notes} onChange={e => updateCell(i,'notes',e.target.value)} /></td>
                  <td style={styles.td}><input type="text" style={styles.cellInput} value={r.roomType} onChange={e => updateCell(i,'roomType',e.target.value)} /></td>
                  <td style={styles.td}><input type="text" style={styles.cellInput} value={r.conf} onChange={e => updateCell(i,'conf',e.target.value)} /></td>
                  <td style={styles.td}><input type="text" style={styles.cellInput} value={r.ref} onChange={e => updateCell(i,'ref',e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.actionRow}>
          <button onClick={downloadEml} style={styles.btn('#1976d2')}>Outlook (.eml)</button>
          <button onClick={openMailto} style={styles.btn('#6c757d')}>Open in Mail</button>
        </div>
      </div>
    </div>
  );
}