// Admin CRUD for the `workshops` table.

const workshopsTableBody = document.getElementById('workshopsTableBody');
const workshopModalBackdrop = document.getElementById('workshopModalBackdrop');
const workshopModalTitle = document.getElementById('workshopModalTitle');
const workshopForm = document.getElementById('workshopForm');
const addWorkshopBtn = document.getElementById('addWorkshopBtn');

let _workshops = [];

function openWorkshopModal(workshop) {
  workshopForm.reset();
  document.getElementById('workshopId').value = workshop ? workshop.id : '';
  document.getElementById('workshopTitle').value = workshop ? workshop.title : '';
  document.getElementById('workshopDescription').value = workshop ? (workshop.description || '') : '';
  document.getElementById('workshopDate').value = workshop ? workshop.date : '';
  document.getElementById('workshopTime').value = workshop ? (workshop.time || '') : '';
  document.getElementById('workshopLocation').value = workshop ? (workshop.location || '') : '';
  document.getElementById('workshopSignupLink').value = workshop ? (workshop.signup_link || '') : '';
  document.getElementById('workshopActive').checked = workshop ? workshop.active : true;
  workshopModalTitle.textContent = workshop ? 'Edit Workshop' : 'Add Workshop';
  workshopModalBackdrop.classList.add('show');
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderWorkshopsTable() {
  if (_workshops.length === 0) {
    workshopsTableBody.innerHTML = '<tr><td colspan="6" class="state-message">No workshops scheduled yet.</td></tr>';
    return;
  }

  workshopsTableBody.innerHTML = _workshops.map(w => `
    <tr>
      <td>${escapeHtml(w.title)}</td>
      <td>${formatDate(w.date)}</td>
      <td>${escapeHtml(w.time)}</td>
      <td>${escapeHtml(w.location)}</td>
      <td>${w.active ? '<span class="badge badge--active">Visible</span>' : '<span class="badge">Hidden</span>'}</td>
      <td class="actions">
        <button class="btn btn--outline btn--sm" data-edit="${w.id}">Edit</button>
        <button class="btn btn--danger btn--sm" data-delete="${w.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  workshopsTableBody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const workshop = _workshops.find(w => w.id === btn.dataset.edit);
      openWorkshopModal(workshop);
    });
  });
  workshopsTableBody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteWorkshop(btn.dataset.delete));
  });
}

async function loadWorkshopsAdmin() {
  const { data, error } = await supabaseClient
    .from('workshops')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Failed to load workshops:', error);
    workshopsTableBody.innerHTML = '<tr><td colspan="6" class="state-message">Failed to load workshops.</td></tr>';
    return;
  }

  _workshops = data || [];
  renderWorkshopsTable();
}

async function deleteWorkshop(id) {
  if (!confirm('Delete this workshop? This cannot be undone.')) return;
  const { error } = await supabaseClient.from('workshops').delete().eq('id', id);
  if (error) {
    alert('Failed to delete workshop: ' + error.message);
    return;
  }
  loadWorkshopsAdmin();
}

addWorkshopBtn.addEventListener('click', () => openWorkshopModal(null));

workshopForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('workshopId').value;
  const payload = {
    title: document.getElementById('workshopTitle').value.trim(),
    description: document.getElementById('workshopDescription').value.trim(),
    date: document.getElementById('workshopDate').value,
    time: document.getElementById('workshopTime').value.trim(),
    location: document.getElementById('workshopLocation').value.trim(),
    signup_link: document.getElementById('workshopSignupLink').value.trim() || null,
    active: document.getElementById('workshopActive').checked,
  };

  const { error } = id
    ? await supabaseClient.from('workshops').update(payload).eq('id', id)
    : await supabaseClient.from('workshops').insert(payload);

  if (error) {
    alert('Failed to save workshop: ' + error.message);
    return;
  }

  workshopModalBackdrop.classList.remove('show');
  loadWorkshopsAdmin();
});

onAdminAuthenticated(loadWorkshopsAdmin);
