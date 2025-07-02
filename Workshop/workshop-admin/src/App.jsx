import React, { useState, useEffect } from 'react';
import {
  login as apiLogin,
  fetchVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
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
  // value: 'dd/MM/yyyy HH:mm'
  // Convert to 'yyyy-MM-ddTHH:mm' for input
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
      style={{ fontSize: 18, padding: 4 }}
    />
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (res.success && res.role === 'admin') {
      setToken(res.token);
      localStorage.setItem('adminToken', res.token);
    } else {
      setError('Invalid credentials');
    }
    setLoading(false);
  }

  function handleEdit(v) {
    setForm({ ...v });
    setEditingId(v.id);
  }

  function handleCancel() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (editingId) {
      await updateVehicle(editingId, form, token);
    } else {
      await addVehicle(form, token);
    }
    setForm(initialForm);
    setEditingId(null);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this job?')) return;
    await deleteVehicle(id, token);
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: '120px auto', background: '#23232b', color: '#fff', padding: 32, borderRadius: 16 }}>
        <h2>Admin Login</h2>
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
      <header style={{ textAlign: 'center', padding: '32px 0 12px', fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>
        🛠️ Admin Panel
        <button onClick={() => { setToken(''); localStorage.removeItem('adminToken'); }} style={{ float: 'right', marginRight: 32, fontSize: 18, background: '#e11d48', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 700 }}>Logout</button>
      </header>
      <section style={{ maxWidth: 900, margin: '0 auto', background: '#23232b', borderRadius: 18, padding: 32, marginTop: 24 }}>
        <h2>{editingId ? 'Edit Job' : 'Add New Job'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'end' }}>
          <div>
            <label>Stock Number*</label><br />
            <input value={form.stockNumber} onChange={e => setForm(f => ({ ...f, stockNumber: e.target.value }))} required style={{ fontSize: 18, padding: 4, width: '100%' }} />
          </div>
          <div>
            <label>Brand*</label><br />
            <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required style={{ fontSize: 18, padding: 4, width: '100%' }}>
              <option value="">Select Brand</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label>Model*</label><br />
            <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} required style={{ fontSize: 18, padding: 4, width: '100%' }} />
          </div>
          <div>
            <label>Colour*</label><br />
            <input value={form.colour} onChange={e => setForm(f => ({ ...f, colour: e.target.value }))} required style={{ fontSize: 18, padding: 4, width: '100%' }} />
          </div>
          <div>
            <label>Customer Name</label><br />
            <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} style={{ fontSize: 18, padding: 4, width: '100%' }} />
          </div>
          <div>
            <label>Salesperson*</label><br />
            <select value={form.salespersonName} onChange={e => setForm(f => ({ ...f, salespersonName: e.target.value }))} required style={{ fontSize: 18, padding: 4, width: '100%' }}>
              <option value="">Select Salesperson</option>
              {SALESPERSONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>Date & Time Required*</label><br />
            <AUDateTimeInput value={form.dateTimeRequired} onChange={val => setForm(f => ({ ...f, dateTimeRequired: val }))} />
          </div>
          <div>
            <label>Purpose</label><br />
            <select value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} style={{ fontSize: 18, padding: 4, width: '100%' }}>
              <option value="">Select Purpose</option>
              {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1/3' }}>
            <label>Work Required</label><br />
            <input value={form.workRequired} onChange={e => setForm(f => ({ ...f, workRequired: e.target.value }))} style={{ fontSize: 18, padding: 4, width: '100%' }} />
          </div>
          <div style={{ gridColumn: '1/3' }}>
            <label>Additional Work</label><br />
            <input value={form.additionalWork} onChange={e => setForm(f => ({ ...f, additionalWork: e.target.value }))} style={{ fontSize: 18, padding: 4, width: '100%' }} />
          </div>
          <div style={{ gridColumn: '1/3', textAlign: 'right' }}>
            <button type="submit" style={{ fontSize: 20, padding: '8px 32px', background: '#22c55e', color: '#18181b', border: 'none', borderRadius: 8, fontWeight: 700 }} disabled={loading}>
              {editingId ? 'Save Changes' : 'Add Job'}
            </button>
            {editingId && <button type="button" onClick={handleCancel} style={{ fontSize: 20, marginLeft: 16, padding: '8px 24px', background: '#f59e42', color: '#18181b', border: 'none', borderRadius: 8, fontWeight: 700 }}>Cancel</button>}
          </div>
        </form>
      </section>
      <section style={{ maxWidth: 1200, margin: '32px auto', background: '#23232b', borderRadius: 18, padding: 32 }}>
        <h2>Current Queue</h2>
        <table style={{ width: '100%', fontSize: 18, borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr style={{ background: '#18181b', color: '#a3e635' }}>
              <th>Stock#</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Colour</th>
              <th>Customer</th>
              <th>Salesperson</th>
              <th>Date/Time</th>
              <th>Purpose</th>
              <th>Work</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} style={{ background: '#23232b', borderBottom: '1px solid #333' }}>
                <td>{v.stockNumber}</td>
                <td>{v.brand}</td>
                <td>{v.model}</td>
                <td>{v.colour}</td>
                <td>{v.customerName}</td>
                <td>{v.salespersonName}</td>
                <td>{v.dateTimeRequired}</td>
                <td>{v.purpose}</td>
                <td>{v.workRequired}</td>
                <td>
                  <button onClick={() => handleEdit(v)} style={{ fontSize: 16, marginRight: 8, background: '#fbbf24', color: '#23232b', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700 }}>Edit</button>
                  <button onClick={() => handleDelete(v.id)} style={{ fontSize: 16, marginRight: 8, background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700 }}>Delete</button>
                  <button onClick={() => handleDelete(v.id)} style={{ fontSize: 16, background: '#22c55e', color: '#18181b', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700 }}>Mark Complete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
