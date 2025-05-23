const form = document.getElementById('engine-form');
const list = document.getElementById('engine-list');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const engine = {
    serialNumber: document.getElementById('serialNumber').value.trim(),
    model: document.getElementById('model').value.trim(),
    year: document.getElementById('year').value.trim(),
  };

  try {
    const res = await fetch('/api/engines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(engine),
    });

    if (res.ok) {
      form.reset();
      await loadEngines();
    }
  } catch (err) {
    console.error('Error adding engine:', err);
  }
});

const loadEngines = async () => {
  try {
    const res = await fetch('/api/engines');
    const engines = await res.json();

    list.innerHTML = '';
    engines.forEach(({ id, serialNumber, model, year }) => {
      const li = document.createElement('li');

      li.innerHTML = `
        <span><strong>${serialNumber}</strong></span>
        <img class="qr" src="/api/qr/${id}" width="80" />
        <input type="text" value="${model || ''}" placeholder="Model" id="model-${id}" />
        <input type="number" value="${year || ''}" placeholder="Year" id="year-${id}" />
        <button onclick="updateEngine('${id}')">✏️</button>
        <button onclick="deleteEngine('${id}')">🗑️</button>
      `;

      list.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading engines:', err);
  }
};

// Edit Engine
window.updateEngine = async (id) => {
  const model = document.getElementById(`model-${id}`).value.trim();
  const year = document.getElementById(`year-${id}`).value.trim();

  try {
    const res = await fetch(`/api/engines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, year }),
    });

    if (res.ok) {
      alert('Engine updated!');
      await loadEngines();
    }
  } catch (err) {
    console.error('Error updating engine:', err);
  }
};

// Delete Engine
window.deleteEngine = async (id) => {
  if (!confirm('Are you sure you want to delete this engine?')) return;

  try {
    const res = await fetch(`/api/engines/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      await loadEngines();
    }
  } catch (err) {
    console.error('Error deleting engine:', err);
  }
};

document.addEventListener('DOMContentLoaded', loadEngines);
