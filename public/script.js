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
  const formStatus = document.getElementById('form-status');

  let vehicles = [];
  let editingId = null;
  let inlineEditValues = {};

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

  // Toast notification
  function showToast(msg, type = 'success') {
    let toast = document.createElement('div');
    toast.textContent = msg;
    toast.className = 'form-status ' + type;
    toast.style.position = 'fixed';
    toast.style.top = '2.5rem';
    toast.style.right = '2.5rem';
    toast.style.zIndex = 9999;
    toast.style.background = '#232a34cc';
    toast.style.padding = '1em 2em';
    toast.style.borderRadius = '1em';
    toast.style.boxShadow = '0 4px 24px #0007';
    toast.style.fontSize = '1.2rem';
    toast.style.fontWeight = '700';
    toast.style.color = type === 'error' ? '#ff4136' : '#2ecc40';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  // Render admin vehicle list with inline editing
  function renderAdminList() {
    adminList.innerHTML = vehicles.map(vehicle => {
      if (editingId === vehicle.id) {
        // Inline edit form
        return `<form class="admin-vehicle-item editing" data-id="${vehicle.id}">
          <input class="inline-edit-input" name="stockNumber" value="${inlineEditValues.stockNumber ?? vehicle.stockNumber}" required />
          <input class="inline-edit-input" name="brand" value="${inlineEditValues.brand ?? vehicle.brand}" required />
          <input class="inline-edit-input" name="model" value="${inlineEditValues.model ?? vehicle.model}" required />
          <input class="inline-edit-input" name="colour" value="${inlineEditValues.colour ?? vehicle.colour}" required />
          <input class="inline-edit-input" name="customerName" value="${inlineEditValues.customerName ?? vehicle.customerName}" required />
          <input class="inline-edit-input" name="salespersonName" value="${inlineEditValues.salespersonName ?? vehicle.salespersonName}" required />
          <input class="inline-edit-input" name="dueDateTime" type="datetime-local" value="${vehicle.dueDateTime ? new Date(vehicle.dueDateTime).toISOString().slice(0,16) : ''}" required />
          <input class="inline-edit-input" name="workRequired" value="${(vehicle.workRequired||[]).join(', ')}" required />
          <div class="inline-edit-actions">
            <button type="submit">Save</button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>`;
      } else {
        return `<div class="admin-vehicle-item${vehicle.complete ? ' complete' : ''}" data-id="${vehicle.id}">
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
        </div>`;
      }
    }).join('');
    attachAdminEvents();
  }

  // Attach admin list events (inline editing)
  function attachAdminEvents() {
    // Inline edit form events
    adminList.querySelectorAll('form.admin-vehicle-item.editing').forEach(form => {
      // Save
      form.onsubmit = async e => {
        e.preventDefault();
        const id = form.dataset.id;
        const data = Object.fromEntries(new FormData(form));
        data.workRequired = parseWorkRequired(data.workRequired);
        try {
          const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error('Failed to save.');
          showToast('Saved!');
          editingId = null;
          inlineEditValues = {};
          fetchVehicles();
        } catch (err) {
          showToast(err.message || 'Error saving.', 'error');
        }
      };
      // Cancel
      form.querySelector('.cancel-btn').onclick = e => {
        editingId = null;
        inlineEditValues = {};
        renderAdminList();
      };
      // Track input changes for seamless editing
      form.querySelectorAll('.inline-edit-input').forEach(input => {
        input.oninput = e => {
          inlineEditValues[input.name] = input.value;
        };
      });
    });
    // Normal edit button
    adminList.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = e => {
        const id = btn.closest('.admin-vehicle-item').dataset.id;
        editingId = id;
        const v = vehicles.find(v => v.id === id);
        inlineEditValues = { ...v };
        renderAdminList();
      };
    });
    // Delete
    adminList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = async e => {
        const id = btn.closest('.admin-vehicle-item').dataset.id;
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchVehicles();
      };
    });
    // Complete
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

  // Poll for updates every 5 seconds
  setInterval(fetchVehicles, 5000);
} 