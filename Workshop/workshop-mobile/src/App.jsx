import React, { useState, useEffect } from 'react';
import {
  login as apiLogin,
  fetchVehicles,
  addVehicle,
  markComplete,
  subscribeVehicles
} from './api';

const initialForm = {
  stockNumber: '',
  brand: '',
  model: '',
  colour: '',
  customerName: '',
  salespersonName: '',
  dateTimeRequired: '',
  purpose: '',
  workRequired: '',
  workItems: [],
  additionalWork: ''
};

const BRANDS = [
  'VOLVO', 'MG', 'JEEP', 'LDV', 'POLESTAR', 'LEAPMOTOR', 'OTHER/USED'
];
const SALESPERSONS = [
  'Jake C', 'Keith C', 'Michael R', 'Jason B', 'Mark K', 'Wendy B', 'Charles R', 'Other'
];
const PURPOSES = [
  'Retail', 'Mark as Priority', 'Showroom', 'Other'
];

function AUDateTimeInput({ value, onChange }) {
  function toInput(dt) {
    if (!dt) return '';
    const [d, t] = dt.split(' ');
    const [day, month, year] = d.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${t}`;
  }
  function fromInput(val) {
    if (!val) return '';
    const [date, time] = val.split('T');
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year} ${time}`;
  }
  return (
    <input
      type="datetime-local"
      value={toInput(value)}
      onChange={e => onChange(fromInput(e.target.value))}
      required
      style={{ fontSize: 18, padding: 4, width: '100%' }}
    />
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('salesToken') || '');
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchVehicles(token).then(setVehicles);
    const unsub = subscribeVehicles(setVehicles);
    return unsub;
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await apiLogin(e.target.username.value, e.target.password.value);
    if (res.success && res.role === 'sales') {
      setToken(res.token);
      setUser(res.username);
      localStorage.setItem('salesToken', res.token);
    } else {
      setError('Invalid credentials');
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await addVehicle({ ...form, salespersonName: user }, token);
    setForm(initialForm);
    setAdding(false);
    setLoading(false);
  }

  async function handleMarkComplete(id) {
    await markComplete(id, token);
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', background: '#23232b', color: '#fff', padding: 24, borderRadius: 16 }}>
        <h2>Sales Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ margin: '16px 0' }}>
            <input name="username" placeholder="Username" required style={{ fontSize: 18, width: '100%', padding: 8 }} />
          </div>
          <div style={{ margin: '16px 0' }}>
            <input name="password" type="password" placeholder="Password" required style={{ fontSize: 18, width: '100%', padding: 8 }} />
          </div>
          {error && <div style={{ color: '#e11d48', marginBottom: 8 }}>{error}</div>}
          <button type="submit" style={{ fontSize: 20, padding: '8px 24px', background: '#a3e635', color: '#23232b', border: 'none', borderRadius: 8, fontWeight: 700 }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: '#18181b', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', paddingBottom: 64 }}>
      <header style={{ textAlign: 'center', padding: '24px 0 8px', fontSize: 32, fontWeight: 800, letterSpacing: 2 }}>
        📱 Sales Queue
        <button onClick={() => { setToken(''); localStorage.removeItem('salesToken'); }} style={{ float: 'right', marginRight: 16, fontSize: 16, background: '#e11d48', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 14px', fontWeight: 700 }}>Logout</button>
      </header>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 8 }}>
        <button onClick={() => setAdding(a => !a)} style={{ width: '100%', fontSize: 20, padding: '12px 0', background: '#22c55e', color: '#18181b', border: 'none', borderRadius: 10, fontWeight: 700, margin: '16px 0' }}>
          {adding ? 'Cancel' : '+ Add New Job'}
        </button>
        {adding && (
          <form onSubmit={handleSubmit} style={{ background: '#23232b', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ marginBottom: 10 }}>
              <label>Stock Number*</label><br />
              <input value={form.stockNumber} onChange={e => setForm(f => ({ ...f, stockNumber: e.target.value }))} required style={{ fontSize: 18, padding: 4, width: '100%' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Brand*</label><br />
              <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required style={{ fontSize: 18, padding: 4, width: '100%' }}>
                <option value="">Select Brand</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Model*</label><br />
              <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} required style={{ fontSize: 18, padding: 4, width: '100%' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Colour*</label><br />
              <input value={form.colour} onChange={e => setForm(f => ({ ...f, colour: e.target.value }))} required style={{ fontSize: 18, padding: 4, width: '100%' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Customer Name</label><br />
              <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} style={{ fontSize: 18, padding: 4, width: '100%' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Date & Time Required*</label><br />
              <AUDateTimeInput value={form.dateTimeRequired} onChange={val => setForm(f => ({ ...f, dateTimeRequired: val }))} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Purpose</label><br />
              <select value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} style={{ fontSize: 18, padding: 4, width: '100%' }}>
                <option value="">Select Purpose</option>
                {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Work Required</label><br />
              <input value={form.workRequired} onChange={e => setForm(f => ({ ...f, workRequired: e.target.value }))} style={{ fontSize: 18, padding: 4, width: '100%' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Additional Work</label><br />
              <input value={form.additionalWork} onChange={e => setForm(f => ({ ...f, additionalWork: e.target.value }))} style={{ fontSize: 18, padding: 4, width: '100%' }} />
            </div>
            <button type="submit" style={{ width: '100%', fontSize: 20, padding: '10px 0', background: '#a3e635', color: '#23232b', border: 'none', borderRadius: 8, fontWeight: 700 }} disabled={loading}>
              {loading ? 'Adding...' : 'Add Job'}
            </button>
          </form>
        )}
        <div style={{ marginTop: 24 }}>
          {vehicles.map(v => (
            <div key={v.id} style={{ background: '#23232b', borderRadius: 12, padding: 16, marginBottom: 18, fontSize: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: '#a5b4fc' }}>#{v.stockNumber} {v.brand} {v.model}</div>
              <div style={{ color: '#f472b6' }}>{v.colour}</div>
              <div>👤 {v.customerName || <em>—</em>}</div>
              <div>📅 {v.dateTimeRequired}</div>
              <div>🧑‍💼 {v.salespersonName}</div>
              <div>Purpose: {v.purpose}</div>
              <div>Work: {v.workRequired}</div>
              <button onClick={() => handleMarkComplete(v.id)} style={{ marginTop: 8, fontSize: 18, background: '#22c55e', color: '#18181b', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 700 }}>
                ✅ Mark as Complete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
