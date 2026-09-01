// Admin CRUD for the `programs` table.

const programsTableBody = document.getElementById('programsTableBody');
const programModalBackdrop = document.getElementById('programModalBackdrop');
const programModalTitle = document.getElementById('programModalTitle');
const programForm = document.getElementById('programForm');
const addProgramBtn = document.getElementById('addProgramBtn');

let _programs = [];

function openProgramModal(program) {
  programForm.reset();
  document.getElementById('programId').value = program ? program.id : '';
  document.getElementById('programName').value = program ? program.name : '';
  document.getElementById('programType').value = program ? program.type : 'subscription';
  document.getElementById('programBillingInterval').value = program ? program.billing_interval : 'month';
  document.getElementById('programPrice').value = program ? (program.price_cents / 100).toFixed(2) : '';
  document.getElementById('programAudience').value = program ? (program.audience || '') : '';
  document.getElementById('programDescription').value = program ? (program.description || '') : '';
  document.getElementById('programFeatures').value = program ? (program.features || []).join('\n') : '';
  document.getElementById('programStripeLink').value = program ? (program.stripe_link || '') : '';
  document.getElementById('programSortOrder').value = program ? program.sort_order : 0;
  document.getElementById('programActive').checked = program ? program.active : true;
  programModalTitle.textContent = program ? 'Edit Program' : 'Add Program';
  programModalBackdrop.classList.add('show');
}

function formatPrice(priceCents) {
  return (priceCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

function renderProgramsTable() {
  if (_programs.length === 0) {
    programsTableBody.innerHTML = '<tr><td colspan="7" class="state-message">No programs yet — add your first one.</td></tr>';
    return;
  }

  programsTableBody.innerHTML = _programs.map(p => `
    <tr>
      <td>${escapeHtml(p.name)}</td>
      <td>${p.type === 'subscription' ? 'Subscription' : 'Set Program'}</td>
      <td>${formatPrice(p.price_cents)}${p.billing_interval !== 'one-time' ? ' / ' + escapeHtml(p.billing_interval) : ''}</td>
      <td>${p.stripe_link ? '<span class="badge badge--active">Linked</span>' : '<span class="badge">Not set</span>'}</td>
      <td>${p.sort_order}</td>
      <td>${p.active ? '<span class="badge badge--active">Visible</span>' : '<span class="badge">Hidden</span>'}</td>
      <td class="actions">
        <button class="btn btn--outline btn--sm" data-edit="${p.id}">Edit</button>
        <button class="btn btn--danger btn--sm" data-delete="${p.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  programsTableBody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const program = _programs.find(p => p.id === btn.dataset.edit);
      openProgramModal(program);
    });
  });
  programsTableBody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteProgram(btn.dataset.delete));
  });
}

async function loadProgramsAdmin() {
  const { data, error } = await supabaseClient
    .from('programs')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to load programs:', error);
    programsTableBody.innerHTML = '<tr><td colspan="7" class="state-message">Failed to load programs.</td></tr>';
    return;
  }

  _programs = data || [];
  renderProgramsTable();
}

async function deleteProgram(id) {
  if (!confirm('Delete this program? This cannot be undone.')) return;
  const { error } = await supabaseClient.from('programs').delete().eq('id', id);
  if (error) {
    alert('Failed to delete program: ' + error.message);
    return;
  }
  loadProgramsAdmin();
}

addProgramBtn.addEventListener('click', () => openProgramModal(null));

programForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('programId').value;
  const priceDollars = parseFloat(document.getElementById('programPrice').value);
  const payload = {
    name: document.getElementById('programName').value.trim(),
    type: document.getElementById('programType').value,
    billing_interval: document.getElementById('programBillingInterval').value,
    price_cents: Math.round(priceDollars * 100),
    audience: document.getElementById('programAudience').value.trim() || null,
    description: document.getElementById('programDescription').value.trim(),
    features: document.getElementById('programFeatures').value.split('\n').map(s => s.trim()).filter(Boolean),
    stripe_link: document.getElementById('programStripeLink').value.trim() || null,
    sort_order: parseInt(document.getElementById('programSortOrder').value, 10) || 0,
    active: document.getElementById('programActive').checked,
  };

  const { error } = id
    ? await supabaseClient.from('programs').update(payload).eq('id', id)
    : await supabaseClient.from('programs').insert(payload);

  if (error) {
    alert('Failed to save program: ' + error.message);
    return;
  }

  programModalBackdrop.classList.remove('show');
  loadProgramsAdmin();
});

onAdminAuthenticated(loadProgramsAdmin);
