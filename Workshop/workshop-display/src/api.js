// API utility for workshop-display
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchVehicles() {
  const res = await fetch(`${API_BASE}/vehicles`);
  const data = await res.json();
  return data.vehicles || [];
}

export function subscribeVehicles(onUpdate) {
  const evtSource = new EventSource(`${API_BASE}/vehicles/subscribe`);
  evtSource.onmessage = (e) => {
    const { vehicles } = JSON.parse(e.data);
    onUpdate(vehicles);
  };
  return () => evtSource.close();
} 