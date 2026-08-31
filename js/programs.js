// Fetches + renders programs.html pricing grid from Supabase.
const pricingGrid = document.getElementById('pricingGrid');

function renderState(message) {
  pricingGrid.innerHTML = `<p class="state-message">${message}</p>`;
}

function formatPrice(priceCents) {
  return (priceCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

function intervalLabel(interval) {
  if (!interval) return '';
  return interval === 'one-time' ? 'one-time' : `/ ${interval}`;
}

const PROGRAM_ICON = {
  subscription: '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  program: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
};

function programCardHTML(program) {
  const features = (program.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('');
  const cta = program.stripe_link
    ? `<a href="${escapeHtml(program.stripe_link)}" class="btn btn--accent" target="_blank" rel="noopener">${program.type === 'subscription' ? 'Subscribe' : 'Enroll Now'}</a>`
    : `<a href="contact.html" class="btn btn--accent">Contact Us</a>`;
  const iconPath = PROGRAM_ICON[program.type] || PROGRAM_ICON.program;

  return `
    <div class="service-card">
      <div class="service-card__icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>
      </div>
      <h3 class="service-card__title">${escapeHtml(program.name)}</h3>
      <div class="pricing-card__price">
        <span class="amount">${formatPrice(program.price_cents)}</span>
        <span class="interval">${escapeHtml(intervalLabel(program.billing_interval))}</span>
      </div>
      <p class="service-card__desc">${escapeHtml(program.description)}</p>
      <ul class="service-card__list">${features}</ul>
      ${cta}
    </div>
  `;
}

async function loadPrograms() {
  if (!supabaseClient) {
    renderState('Program pricing is being finalized — check back soon or contact us directly.');
    return;
  }

  renderState('Loading programs…');

  const { data, error } = await supabaseClient
    .from('programs')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to load programs:', error);
    renderState('Program pricing is being finalized — check back soon or contact us directly.');
    return;
  }

  if (!data || data.length === 0) {
    renderState('Program pricing is being finalized — check back soon or contact us directly.');
    return;
  }

  pricingGrid.innerHTML = data.map(programCardHTML).join('');
}

loadPrograms();
