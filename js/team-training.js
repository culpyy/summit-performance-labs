// Calendly embed + team-training inquiry form.

// Set this once a Calendly account/event type exists (Calendly > event type > "Add to Website" > URL).
const CALENDLY_URL = 'https://calendly.com/YOUR_ACCOUNT/team-training';

const calendlyWidget = document.getElementById('calendlyWidget');

if (CALENDLY_URL.includes('YOUR_ACCOUNT')) {
  calendlyWidget.outerHTML = '<p class="state-message">Online scheduling is being set up — use the form to request a call in the meantime.</p>';
} else {
  calendlyWidget.dataset.url = CALENDLY_URL;
  const script = document.createElement('script');
  script.src = 'https://assets.calendly.com/assets/external/widget.js';
  script.async = true;
  document.body.appendChild(script);
}

// Inquiry form — inserts into Supabase `team_training_inquiries` (public INSERT-only via RLS).
const inquiryForm = document.getElementById('inquiryForm');
const inquirySuccess = document.getElementById('inquirySuccess');

if (inquiryForm) {
  inquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const required = inquiryForm.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#e53935';
        field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
      }
    });
    if (!valid) return;

    const payload = {
      org_name: inquiryForm.orgName.value.trim(),
      contact_name: inquiryForm.contactName.value.trim(),
      email: inquiryForm.email.value.trim(),
      phone: inquiryForm.phone.value.trim(),
      team_size: inquiryForm.teamSize.value.trim(),
      preferred_dates: inquiryForm.preferredDates.value.trim(),
      message: inquiryForm.message.value.trim(),
    };

    if (!supabaseClient) {
      console.warn('Supabase not configured — inquiry not saved:', payload);
      inquirySuccess.classList.add('show');
      return;
    }

    const submitBtn = inquiryForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const { error } = await supabaseClient.from('team_training_inquiries').insert(payload);

    submitBtn.disabled = false;

    if (error) {
      console.error('Failed to submit inquiry:', error);
      alert('Something went wrong submitting your request. Please try again or email us directly.');
      return;
    }

    inquirySuccess.classList.add('show');
    inquiryForm.reset();
  });
}
