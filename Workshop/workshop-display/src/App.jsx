import React, { useEffect, useState } from 'react';
import { fetchVehicles, subscribeVehicles } from './api';
import './App.css';

function getUrgencyColor(dt) {
  const now = new Date();
  const [d, t] = dt.split(' ');
  const [day, month, year] = d.split('/').map(Number);
  const [hour, min] = t.split(':').map(Number);
  const due = new Date(year, month - 1, day, hour, min);
  const diff = (due - now) / 1000 / 60; // minutes
  if (diff < 0) return '#222'; // Past due
  if (diff < 60) return '#e11d48'; // <1h
  if (diff < 180) return '#f59e42'; // <3h
  return '#22c55e'; // Not urgent
}

function timeRemaining(dt) {
  const now = new Date();
  const [d, t] = dt.split(' ');
  const [day, month, year] = d.split('/').map(Number);
  const [hour, min] = t.split(':').map(Number);
  const due = new Date(year, month - 1, day, hour, min);
  let diff = Math.floor((due - now) / 1000);
  if (diff < 0) return 'Overdue';
  const h = Math.floor(diff / 3600);
  diff %= 3600;
  const m = Math.floor(diff / 60);
  return `${h}h ${m}m`;
}

export default function App() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetchVehicles().then(setVehicles);
    const unsub = subscribeVehicles(setVehicles);
    return unsub;
  }, []);

  return (
    <div style={{ background: '#18181b', minHeight: '100vh', color: '#fff', padding: 0, fontFamily: 'Inter, sans-serif' }}>
      <header style={{ textAlign: 'center', padding: '32px 0 12px', fontSize: 48, fontWeight: 800, letterSpacing: 2 }}>
        🚗 Workshop Get Ready Queue
      </header>
      <div style={{ textAlign: 'center', fontSize: 24, marginBottom: 24, color: '#a3e635' }}>
        {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in queue
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(540px, 1fr))',
        gap: 32,
        maxWidth: 1920,
        margin: '0 auto',
        padding: '0 32px 32px',
      }}>
        {vehicles.map(v => (
          <div key={v.id} style={{
            background: '#23232b',
            borderRadius: 18,
            boxShadow: '0 4px 32px #0008',
            padding: 32,
            fontSize: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            border: `4px solid ${getUrgencyColor(v.dateTimeRequired)}`,
            position: 'relative',
            minHeight: 320,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
              <span style={{ fontWeight: 900, fontSize: 40, color: '#a5b4fc' }}>#{v.stockNumber}</span>
              <span style={{ fontSize: 28, color: '#fbbf24' }}>{v.brand} {v.model}</span>
              <span style={{ fontSize: 28, color: '#f472b6' }}>{v.colour}</span>
            </div>
            <div style={{ display: 'flex', gap: 32, fontSize: 28 }}>
              <span>👤 {v.customerName || <em>—</em>}</span>
              <span>🧑‍💼 {v.salespersonName}</span>
            </div>
            <div style={{ display: 'flex', gap: 32, fontSize: 28 }}>
              <span>📅 {v.dateTimeRequired}</span>
              <span>⏳ <b style={{ color: getUrgencyColor(v.dateTimeRequired) }}>{timeRemaining(v.dateTimeRequired)}</b></span>
            </div>
            <button
              style={{
                fontSize: 32,
                padding: '16px 32px',
                borderRadius: 12,
                background: '#22c55e',
                color: '#18181b',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                marginTop: 16,
                alignSelf: 'flex-end',
                boxShadow: '0 2px 8px #0006',
                transition: 'background 0.2s',
              }}
              onClick={async () => {
                await fetch(`/api/vehicles/${v.id}`, { method: 'DELETE' });
              }}
            >
              ✅ Mark as Complete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
