// Fetches + renders the "Upcoming Workshops" section on index.html from Supabase.
const workshopsGrid = document.getElementById('workshopsGrid');

function renderState(message) {
  workshopsGrid.innerHTML = `<p class="state-message">${message}</p>`;
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function workshopCardHTML(workshop) {
  const cta = workshop.signup_link
    ? `<a href="${escapeHtml(workshop.signup_link)}" class="btn btn--accent" target="_blank" rel="noopener">Sign Up</a>`
    : `<a href="contact.html" class="btn btn--accent">Ask About This</a>`;

  return `
    <div class="guide-card">
      <h3>${escapeHtml(workshop.title)}</h3>
      <p>${escapeHtml(workshop.description)}</p>
      <p style="color: var(--color-silver); font-size: .85rem; font-weight: 600;">
        ${formatDate(workshop.date)}${workshop.time ? ' · ' + escapeHtml(workshop.time) : ''}${workshop.location ? ' · ' + escapeHtml(workshop.location) : ''}
      </p>
      ${cta}
    </div>
  `;
}

async function loadWorkshops() {
  if (!supabaseClient) {
    renderState('No workshops scheduled yet — check back soon.');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseClient
    .from('workshops')
    .select('*')
    .eq('active', true)
    .gte('date', today)
    .order('date', { ascending: true });

  if (error) {
    console.error('Failed to load workshops:', error);
    renderState('No workshops scheduled yet — check back soon.');
    return;
  }

  if (!data || data.length === 0) {
    renderState('No workshops scheduled yet — check back soon.');
    return;
  }

  workshopsGrid.innerHTML = data.map(workshopCardHTML).join('');
}

loadWorkshops();
