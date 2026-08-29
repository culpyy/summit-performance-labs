// Admin view + status update for `team_training_inquiries` (public INSERT-only table).

const inquiriesTableBody = document.getElementById('inquiriesTableBody');
const inquiryModalBackdrop = document.getElementById('inquiryModalBackdrop');
const inquiryDetails = document.getElementById('inquiryDetails');
const inquiryStatusForm = document.getElementById('inquiryStatusForm');

let _inquiries = [];

const STATUS_BADGE = {
  new: 'badge--status-new',
  contacted: 'badge--status-contacted',
  booked: 'badge--status-booked',
  closed: 'badge--status-closed',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function openInquiryModal(inquiry) {
  document.getElementById('inquiryId').value = inquiry.id;
  document.getElementById('inquiryStatus').value = inquiry.status;

  const rows = [
    ['Team / Unit', inquiry.org_name],
    ['Contact', inquiry.contact_name],
    ['Email', inquiry.email],
    ['Phone', inquiry.phone],
    ['Team Size', inquiry.team_size],
    ['Preferred Timeframe', inquiry.preferred_dates],
    ['Message', inquiry.message],
    ['Received', formatDate(inquiry.created_at)],
  ];

  inquiryDetails.innerHTML = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `<div><strong style="color: var(--color-white);">${escapeHtml(label)}:</strong> ${escapeHtml(value)}</div>`)
    .join('');

  inquiryModalBackdrop.classList.add('show');
}

function renderInquiriesTable() {
  if (_inquiries.length === 0) {
    inquiriesTableBody.innerHTML = '<tr><td colspan="6" class="state-message">No inquiries yet.</td></tr>';
    return;
  }

  inquiriesTableBody.innerHTML = _inquiries.map(i => `
    <tr>
      <td>${formatDate(i.created_at)}</td>
      <td>${escapeHtml(i.org_name)}</td>
      <td>${escapeHtml(i.contact_name)}</td>
      <td>${escapeHtml(i.email)}</td>
      <td><span class="badge ${STATUS_BADGE[i.status] || ''}">${escapeHtml(i.status)}</span></td>
      <td class="actions">
        <button class="btn btn--outline btn--sm" data-view="${i.id}">View</button>
      </td>
    </tr>
  `).join('');

  inquiriesTableBody.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const inquiry = _inquiries.find(i => i.id === btn.dataset.view);
      openInquiryModal(inquiry);
    });
  });
}

async function loadInquiriesAdmin() {
  const { data, error } = await supabaseClient
    .from('team_training_inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load inquiries:', error);
    inquiriesTableBody.innerHTML = '<tr><td colspan="6" class="state-message">Failed to load inquiries.</td></tr>';
    return;
  }

  _inquiries = data || [];
  renderInquiriesTable();
}

inquiryStatusForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('inquiryId').value;
  const status = document.getElementById('inquiryStatus').value;

  const { error } = await supabaseClient.from('team_training_inquiries').update({ status }).eq('id', id);

  if (error) {
    alert('Failed to update status: ' + error.message);
    return;
  }

  inquiryModalBackdrop.classList.remove('show');
  loadInquiriesAdmin();
});

onAdminAuthenticated(loadInquiriesAdmin);
