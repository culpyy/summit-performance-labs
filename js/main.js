// Nav: scrolled state + hamburger + backdrop
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navBackdrop = document.getElementById('navBackdrop');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// iOS-safe scroll lock: position:fixed preserves scroll position
let savedScrollY = 0;
function lockScroll() {
  savedScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.width = '100%';
}
function unlockScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, savedScrollY);
}

function closeNav() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  navBackdrop.classList.remove('open');
  unlockScroll();
}

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  navBackdrop.classList.toggle('open', isOpen);
  isOpen ? lockScroll() : unlockScroll();
});

navBackdrop.addEventListener('click', closeNav);

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
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

// Contact form: client-side validation + success state (only present on contact.html)
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (form) {
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
}
