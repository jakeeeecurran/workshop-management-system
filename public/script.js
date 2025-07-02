// script.js - Shared logic for Workshop Display and Admin Portal

const API_URL = '/api/vehicles';
const AU_LOCALE = 'en-AU';
const AU_DATE_OPTIONS = {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: false
};

// Utility: Format date/time in AU format
function formatDateTimeAU(dt) {
  if (!dt) return '';
  const date = typeof dt === 'string' ? new Date(dt) : dt;
  return date.toLocaleString(AU_LOCALE, AU_DATE_OPTIONS).replace(',', '');
}

// Utility: Parse work required string to array
function parseWorkRequired(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

// Utility: Render tags
function renderTags(tags) {
  return tags.map(tag => `<span class="tag">${tag}</span>`).join(' ');
}

// --- WORKSHOP DISPLAY PAGE LOGIC ---
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
  const tilesGrid = document.getElementById('vehicle-tiles');
  let vehicles = [];
  let editingId = null;

  // Fetch and render vehicles
  async function fetchVehicles() {
    const res = await fetch(API_URL);
    vehicles = await res.json();
    renderTiles();
  }

  // Render all vehicle tiles
  function renderTiles() {
    tilesGrid.innerHTML = vehicles.map(vehicle =>
      editingId === vehicle.id ? renderEditTile(vehicle) : renderVehicleTile(vehicle)
    ).join('');
    attachTileEvents();
  }

  // Render a single vehicle tile
  function renderVehicleTile(vehicle) {
    return `<div class="vehicle-tile${vehicle.complete ? ' complete' : ''}" data-id="${vehicle.id}">
      <div class="tile-header">${vehicle.stockNumber} - ${vehicle.brand} ${vehicle.model}</div>
      <div><b>Colour:</b> ${vehicle.colour}</div>
      <div><b>Customer:</b> ${vehicle.customerName}</div>
      <div><b>Salesperson:</b> ${vehicle.salespersonName}</div>
      <div><b>Due:</b> ${formatDateTimeAU(vehicle.dueDateTime)}</div>
      <div class="tags">${renderTags(vehicle.workRequired || [])}</div>
      <div class="tile-actions">
        <button class="complete-btn" ${vehicle.complete ? 'disabled' : ''}>✅ Complete</button>
        <button class="edit-btn">✏️ Edit</button>
      </div>
    </div>`;
  }

  // Render edit form in-place
  function renderEditTile(vehicle) {
    return `<form class="vehicle-tile edit-tile" data-id="${vehicle.id}">
      <div class="tile-header">Edit: ${vehicle.stockNumber}</div>
      <input type="text" name="stockNumber" value="${vehicle.stockNumber}" required />
      <input type="text" name="brand" value="${vehicle.brand}" required />
      <input type="text" name="model" value="${vehicle.model}" required />
      <input type="text" name="colour" value="${vehicle.colour}" required />
      <input type="text" name="customerName" value="${vehicle.customerName}" required />
      <input type="text" name="salespersonName" value="${vehicle.salespersonName}" required />
      <input type="datetime-local" name="dueDateTime" value="${vehicle.dueDateTime ? new Date(vehicle.dueDateTime).toISOString().slice(0,16) : ''}" required />
      <input type="text" name="workRequired" value="${(vehicle.workRequired||[]).join(', ')}" required />
      <div class="tile-actions">
        <button type="submit" class="complete-btn">💾 Save</button>
        <button type="button" class="edit-cancel-btn edit-btn">Cancel</button>
      </div>
    </form>`;
  }

  // Attach event listeners to tile buttons
  function attachTileEvents() {
    document.querySelectorAll('.vehicle-tile .complete-btn:not([disabled])').forEach(btn => {
      btn.onclick = async e => {
        const id = btn.closest('.vehicle-tile').dataset.id;
        await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complete: true })
        });
        fetchVehicles();
      };
    });
    document.querySelectorAll('.vehicle-tile .edit-btn').forEach(btn => {
      btn.onclick = e => {
        const id = btn.closest('.vehicle-tile').dataset.id;
        editingId = id;
        renderTiles();
      };
    });
    document.querySelectorAll('.edit-tile').forEach(form => {
      form.onsubmit = async e => {
        e.preventDefault();
        const id = form.dataset.id;
        const data = Object.fromEntries(new FormData(form));
        data.workRequired = parseWorkRequired(data.workRequired);
        await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        editingId = null;
        fetchVehicles();
      };
      form.querySelector('.edit-cancel-btn').onclick = e => {
        editingId = null;
        renderTiles();
      };
    });
  }

  // Poll for updates every 5 seconds
  setInterval(fetchVehicles, 5000);
  fetchVehicles();
}

// --- ADMIN PORTAL LOGIC ---
if (window.location.pathname.endsWith('admin.html')) {
  const loginSection = document.getElementById('login-section');
  const adminSection = document.getElementById('admin-section');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const vehicleForm = document.getElementById('vehicle-form');
  const adminList = document.getElementById('admin-vehicles-list');
  const cancelEditBtn = document.getElementById('cancel-edit');

  let vehicles = [];
  let editingId = null;

  // Simple login using localStorage
  function isLoggedIn() {
    return localStorage.getItem('workshopAdmin') === 'true';
  }
  function setLoggedIn(val) {
    localStorage.setItem('workshopAdmin', val ? 'true' : 'false');
  }
  function showAdmin() {
    loginSection.style.display = 'none';
    adminSection.style.display = '';
    fetchVehicles();
  }
  function showLogin() {
    loginSection.style.display = '';
    adminSection.style.display = 'none';
  }

  // Login form handler
  loginForm.onsubmit = e => {
    e.preventDefault();
    const pw = document.getElementById('admin-password').value;
    if (pw === 'workshop') {
      setLoggedIn(true);
      showAdmin();
    } else {
      loginError.style.display = '';
    }
  };

  // On load, check login
  if (isLoggedIn()) showAdmin();
  else showLogin();

  // Fetch and render vehicles
  async function fetchVehicles() {
    const res = await fetch(API_URL);
    vehicles = await res.json();
    renderAdminList();
    vehicleForm.reset();
    editingId = null;
    cancelEditBtn.style.display = 'none';
  }

  // Render admin vehicle list
  function renderAdminList() {
    adminList.innerHTML = vehicles.map(vehicle =>
      `<div class="admin-vehicle-item${vehicle.complete ? ' complete' : ''}" data-id="${vehicle.id}">
        <b>${vehicle.stockNumber} - ${vehicle.brand} ${vehicle.model}</b>
        <span>Colour: ${vehicle.colour}</span>
        <span>Customer: ${vehicle.customerName}</span>
        <span>Sales: ${vehicle.salespersonName}</span>
        <span>Due: ${formatDateTimeAU(vehicle.dueDateTime)}</span>
        <span class="tags">${renderTags(vehicle.workRequired || [])}</span>
        <div class="admin-actions">
          <button class="edit-btn">✏️ Edit</button>
          <button class="delete-btn">🗑️ Delete</button>
          <button class="complete-btn" ${vehicle.complete ? 'disabled' : ''}>✅ Complete</button>
        </div>
      </div>`
    ).join('');
    attachAdminEvents();
  }

  // Attach admin list events
  function attachAdminEvents() {
    adminList.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = e => {
        const id = btn.closest('.admin-vehicle-item').dataset.id;
        startEdit(id);
      };
    });
    adminList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = async e => {
        const id = btn.closest('.admin-vehicle-item').dataset.id;
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchVehicles();
      };
    });
    adminList.querySelectorAll('.complete-btn:not([disabled])').forEach(btn => {
      btn.onclick = async e => {
        const id = btn.closest('.admin-vehicle-item').dataset.id;
        await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complete: true })
        });
        fetchVehicles();
      };
    });
  }

  // Start editing a vehicle
  function startEdit(id) {
    const v = vehicles.find(v => v.id === id);
    if (!v) return;
    editingId = id;
    document.getElementById('vehicle-id').value = v.id;
    document.getElementById('stock-number').value = v.stockNumber;
    document.getElementById('brand').value = v.brand;
    document.getElementById('model').value = v.model;
    document.getElementById('colour').value = v.colour;
    document.getElementById('customer-name').value = v.customerName;
    document.getElementById('salesperson-name').value = v.salespersonName;
    document.getElementById('due-datetime').value = v.dueDateTime ? new Date(v.dueDateTime).toISOString().slice(0,16) : '';
    document.getElementById('work-required').value = (v.workRequired||[]).join(', ');
    cancelEditBtn.style.display = '';
  }

  // Cancel edit
  cancelEditBtn.onclick = e => {
    vehicleForm.reset();
    editingId = null;
    cancelEditBtn.style.display = 'none';
  };

  // Handle add/edit vehicle form
  vehicleForm.onsubmit = async e => {
    e.preventDefault();
    const id = document.getElementById('vehicle-id').value;
    const data = {
      stockNumber: document.getElementById('stock-number').value,
      brand: document.getElementById('brand').value,
      model: document.getElementById('model').value,
      colour: document.getElementById('colour').value,
      customerName: document.getElementById('customer-name').value,
      salespersonName: document.getElementById('salesperson-name').value,
      dueDateTime: document.getElementById('due-datetime').value,
      workRequired: parseWorkRequired(document.getElementById('work-required').value)
    };
    if (id) {
      // Edit
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      // Add
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    fetchVehicles();
  };

  // Poll for updates every 5 seconds
  setInterval(fetchVehicles, 5000);
} 