// Supabase project config.
// Fill these in once the Supabase project exists (Project Settings > API).
// The anon key is safe to expose in client-side code — Row Level Security
// policies (see supabase/schema.sql) control what it can actually read/write.
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const SUPABASE_CONFIGURED = !SUPABASE_URL.startsWith('YOUR_') && !SUPABASE_ANON_KEY.startsWith('YOUR_');

const supabaseClient = SUPABASE_CONFIGURED
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!SUPABASE_CONFIGURED) {
  console.warn('Supabase is not configured yet — set SUPABASE_URL and SUPABASE_ANON_KEY in js/supabase-client.js');
}

// Shared helper: escape user/DB-sourced strings before dropping them into innerHTML.
// Matters most for team_training_inquiries, which anonymous visitors write to directly —
// this prevents stored XSS from a malicious inquiry submission rendering in the admin panel.
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
