// Admin CRUD for the `coaches` table.

const coachesTableBody = document.getElementById('coachesTableBody');
const coachModalBackdrop = document.getElementById('coachModalBackdrop');
const coachModalTitle = document.getElementById('coachModalTitle');
const coachForm = document.getElementById('coachForm');
const addCoachBtn = document.getElementById('addCoachBtn');

let _coaches = [];

function openCoachModal(coach) {
  coachForm.reset();
  document.getElementById('coachId').value = coach ? coach.id : '';
  document.getElementById('coachName').value = coach ? coach.name : '';
  document.getElementById('coachTitle').value = coach ? (coach.title || '') : '';
  document.getElementById('coachCerts').value = coach ? (coach.certs || []).join(', ') : '';
  document.getElementById('coachPhotoUrl').value = coach ? (coach.photo_url || '') : '';
  document.getElementById('coachBio').value = coach ? (coach.bio || '') : '';
  document.getElementById('coachSortOrder').value = coach ? coach.sort_order : 0;
  document.getElementById('coachActive').checked = coach ? coach.active : true;
  coachModalTitle.textContent = coach ? 'Edit Coach' : 'Add Coach';
  coachModalBackdrop.classList.add('show');
}

function renderCoachesTable() {
  if (_coaches.length === 0) {
    coachesTableBody.innerHTML = '<tr><td colspan="6" class="state-message">No coaches yet — add your first one.</td></tr>';
    return;
  }

  coachesTableBody.innerHTML = _coaches.map(c => `
    <tr>
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.title)}</td>
      <td>${(c.certs || []).map(escapeHtml).join(', ')}</td>
      <td>${c.sort_order}</td>
      <td>${c.active ? '<span class="badge badge--active">Visible</span>' : '<span class="badge">Hidden</span>'}</td>
      <td class="actions">
        <button class="btn btn--outline btn--sm" data-edit="${c.id}">Edit</button>
        <button class="btn btn--danger btn--sm" data-delete="${c.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  coachesTableBody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const coach = _coaches.find(c => c.id === btn.dataset.edit);
      openCoachModal(coach);
    });
  });
  coachesTableBody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteCoach(btn.dataset.delete));
  });
}

async function loadCoachesAdmin() {
  const { data, error } = await supabaseClient
    .from('coaches')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to load coaches:', error);
    coachesTableBody.innerHTML = '<tr><td colspan="6" class="state-message">Failed to load coaches.</td></tr>';
    return;
  }

  _coaches = data || [];
  renderCoachesTable();
}

async function deleteCoach(id) {
  if (!confirm('Delete this coach? This cannot be undone.')) return;
  const { error } = await supabaseClient.from('coaches').delete().eq('id', id);
  if (error) {
    alert('Failed to delete coach: ' + error.message);
    return;
  }
  loadCoachesAdmin();
}

addCoachBtn.addEventListener('click', () => openCoachModal(null));

coachForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('coachId').value;
  const payload = {
    name: document.getElementById('coachName').value.trim(),
    title: document.getElementById('coachTitle').value.trim(),
    certs: document.getElementById('coachCerts').value.split(',').map(s => s.trim()).filter(Boolean),
    photo_url: document.getElementById('coachPhotoUrl').value.trim() || null,
    bio: document.getElementById('coachBio').value.trim(),
    sort_order: parseInt(document.getElementById('coachSortOrder').value, 10) || 0,
    active: document.getElementById('coachActive').checked,
  };

  const { error } = id
    ? await supabaseClient.from('coaches').update(payload).eq('id', id)
    : await supabaseClient.from('coaches').insert(payload);

  if (error) {
    alert('Failed to save coach: ' + error.message);
    return;
  }

  coachModalBackdrop.classList.remove('show');
  loadCoachesAdmin();
});

onAdminAuthenticated(loadCoachesAdmin);
