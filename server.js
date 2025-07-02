// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'vehicles.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Read vehicles from file
function readVehicles() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: Write vehicles to file
function writeVehicles(vehicles) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(vehicles, null, 2));
}

// GET all vehicles
app.get('/api/vehicles', (req, res) => {
  const vehicles = readVehicles();
  res.json(vehicles);
});

// POST new vehicle
app.post('/api/vehicles', (req, res) => {
  const vehicles = readVehicles();
  const newVehicle = {
    ...req.body,
    id: Date.now().toString(), // Simple unique ID
    complete: false
  };
  vehicles.push(newVehicle);
  writeVehicles(vehicles);
  res.status(201).json(newVehicle);
});

// PUT update vehicle
app.put('/api/vehicles/:id', (req, res) => {
  const vehicles = readVehicles();
  const idx = vehicles.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  vehicles[idx] = { ...vehicles[idx], ...req.body };
  writeVehicles(vehicles);
  res.json(vehicles[idx]);
});

// DELETE vehicle
app.delete('/api/vehicles/:id', (req, res) => {
  let vehicles = readVehicles();
  const idx = vehicles.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = vehicles.splice(idx, 1);
  writeVehicles(vehicles);
  res.json(removed[0]);
});

// Fallback: serve index.html for any other route (for SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 