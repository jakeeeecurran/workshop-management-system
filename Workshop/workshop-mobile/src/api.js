// API utility for workshop-mobile
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function fetchVehicles(token) {
  const res = await fetch(`${API_BASE}/vehicles`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.vehicles || [];
}

export async function addVehicle(vehicle, token) {
  const res = await fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(vehicle)
  });
  return res.json();
}

export async function markComplete(id, token) {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export function subscribeVehicles(onUpdate) {
  const evtSource = new EventSource(`${API_BASE}/vehicles/subscribe`);
  evtSource.onmessage = (e) => {
    const { vehicles } = JSON.parse(e.data);
    onUpdate(vehicles);
  };
  return () => evtSource.close();
} 