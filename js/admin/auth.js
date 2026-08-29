// Admin auth: login, logout, session check, tab switching, generic modal close.
// Other admin/*.js modules register work to run once a session exists via onAdminAuthenticated().

const loginView = document.getElementById('adminLogin');
const shellView = document.getElementById('adminShell');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

const _authCallbacks = [];
let _authenticated = false;

function onAdminAuthenticated(callback) {
  if (_authenticated) callback();
  else _authCallbacks.push(callback);
}

function showShell() {
  _authenticated = true;
  loginView.style.display = 'none';
  shellView.classList.add('show');
  _authCallbacks.forEach(cb => cb());
  _authCallbacks.length = 0;
}

function showLogin(message) {
  _authenticated = false;
  shellView.classList.remove('show');
  loginView.style.display = 'flex';
  if (message) {
    loginError.textContent = message;
    loginError.classList.add('show');
  }
}

async function checkSession() {
  if (!supabaseClient) {
    showLogin('Supabase is not configured yet — see js/supabase-client.js.');
    loginForm.querySelector('button').disabled = true;
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) showShell();
  else showLogin();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.remove('show');

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    loginError.textContent = 'Invalid email or password.';
    loginError.classList.add('show');
    return;
  }

  loginForm.reset();
  showShell();
});

logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});

// Tabs
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
  });
});

// Generic modal close (Cancel/Close buttons + backdrop click)
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.close).classList.remove('show');
  });
});
document.querySelectorAll('.admin-modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.remove('show');
  });
});

checkSession();
