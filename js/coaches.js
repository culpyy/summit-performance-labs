// Fetches + renders coaches.html grid from Supabase.
const coachesGrid = document.getElementById('coachesGrid');

function renderState(message) {
  coachesGrid.innerHTML = `<p class="state-message">${message}</p>`;
}

function initials(name) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

// Shown until Supabase is configured with live coach data — mirrors the real
// team currently listed on summitperformancelab.vercel.app so the site
// never looks empty in the meantime.
const FALLBACK_COACHES = [
  {
    name: 'Coach Andy', title: 'Head Coach & Founder',
    certs: [],
    bio: 'Founder of Summit Performance Lab with extensive tactical fitness experience. Dedicated to building world-class training programs that help first responders and military personnel perform at their peak while preventing injuries and extending careers. "Train like your life depends on it."',
    photo_url: null,
  },
  {
    name: 'Coach Jones', title: 'Tactical Strength & Conditioning Specialist',
    certs: ['CSCS', 'TSAC-F', 'USAW Sports Performance Coach', 'USR Certified Speed Coach'],
    bio: 'Provides world-class tactical strength & conditioning to first responders and military in Alaska. Over 10 years coaching Army, Air Force, collegiate, and private sectors — including top-10 Army Best Ranger & Best Sapper teams, Special Forces candidates, and F-22 pilot performance programs. "Maximize performance, build resilience, stay mission-ready."',
    photo_url: null,
  },
  {
    name: 'Coach Nic', title: 'Military Fitness Specialist & Youth Development Coach',
    certs: [],
    bio: 'With 12 years of military experience maintaining the F-22 Raptor across multiple deployments, Nic is a dedicated Physical Training Leader who has programmed and managed the Fitness Improvement Program. Also experienced in adult strength coaching, 1:1 personal training, and youth sports development. "Live for something greater than yourself."',
    photo_url: null,
  },
];

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
    coachesGrid.innerHTML = FALLBACK_COACHES.map(coachCardHTML).join('');
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
    coachesGrid.innerHTML = FALLBACK_COACHES.map(coachCardHTML).join('');
    return;
  }

  if (!data || data.length === 0) {
    renderState('Coach profiles are on the way — check back soon.');
    return;
  }

  coachesGrid.innerHTML = data.map(coachCardHTML).join('');
}

loadCoaches();
