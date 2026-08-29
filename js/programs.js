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

function programCardHTML(program) {
  const features = (program.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('');
  const cta = program.stripe_link
    ? `<a href="${escapeHtml(program.stripe_link)}" class="btn btn--accent" target="_blank" rel="noopener">${program.type === 'subscription' ? 'Subscribe' : 'Enroll Now'}</a>`
    : `<a href="contact.html" class="btn btn--accent">Contact Us</a>`;

  return `
    <div class="service-card">
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
