// Fetches + renders coaches.html grid from Supabase.
const coachesGrid = document.getElementById('coachesGrid');

function renderState(message) {
  coachesGrid.innerHTML = `<p class="state-message">${message}</p>`;
}

function initials(name) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

function coachCardHTML(coach) {
  const certs = (coach.certs || []).map(c => `<span>${escapeHtml(c)}</span>`).join('');
  const photo = coach.photo_url
    ? `<div class="trainer-card__photo"><img src="${escapeHtml(coach.photo_url)}" alt="${escapeHtml(coach.name)}" /></div>`
    : `<div class="trainer-card__photo"><div class="trainer-card__avatar">${escapeHtml(initials(coach.name))}</div></div>`;

  return `
    <div class="trainer-card">
      ${photo}
      <div class="trainer-card__body">
        <h3 class="trainer-card__name">${escapeHtml(coach.name)}</h3>
        <p class="trainer-card__title">${escapeHtml(coach.title)}</p>
        <div class="trainer-card__certs">${certs}</div>
        <p class="trainer-card__bio">${escapeHtml(coach.bio)}</p>
      </div>
    </div>
  `;
}

async function loadCoaches() {
  if (!supabaseClient) {
    renderState('Coach profiles are on the way — check back soon.');
    return;
  }

  renderState('Loading coaches…');

  const { data, error } = await supabaseClient
    .from('coaches')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to load coaches:', error);
    renderState('Coach profiles are on the way — check back soon.');
    return;
  }

  if (!data || data.length === 0) {
    renderState('Coach profiles are on the way — check back soon.');
    return;
  }

  coachesGrid.innerHTML = data.map(coachCardHTML).join('');
}

loadCoaches();
