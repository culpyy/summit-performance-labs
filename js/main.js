// Nav: add scrolled class + hamburger toggle
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Stat counter animation
const counters = document.querySelectorAll('.stat__num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.4 });

counters.forEach(c => counterObserver.observe(c));

// Contact form: client-side validation + success state
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const required = form.querySelectorAll('[required]');
  let valid = true;

  required.forEach(field => {
    if (!field.value.trim()) {
      valid = false;
      field.style.borderColor = '#e53935';
      field.addEventListener('input', () => {
        field.style.borderColor = '';
      }, { once: true });
    }
  });

  if (!valid) return;

  // TODO: wire up to a backend / Netlify Forms / Formspree by adding
  //   action="https://formspree.io/f/YOUR_ID" method="POST"
  //   or Netlify's data-netlify="true" attribute on the <form> tag.
  //   Remove the e.preventDefault() call and submit handler once wired.
  formSuccess.classList.add('show');
});
