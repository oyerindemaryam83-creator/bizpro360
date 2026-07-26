const SUPABASE_URL = "https://irnvtcljxxrfmoqwpvft.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlybnZ0Y2xqeHhyZm1vcXdwdmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDgyMDYsImV4cCI6MjA5ODQ4NDIwNn0.x3yghXofeg8Zlw8MPAbbBQNeuUeuFQr98n2iC37yk80";

const { createClient } = window.supabase;
window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function normalizeRole(roleValue) {
  return roleValue ? String(roleValue).trim().toLowerCase() : null;
}

async function getCurrentUserProfile() {
  const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await window.supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!error && data) {
    return {
      ...data,
      role: normalizeRole(data.role)
    };
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || null,
    role: normalizeRole(user?.user_metadata?.role || user?.app_metadata?.role)
  };
}

async function requireRole(requiredRole) {
  const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
  if (userError || !user) {
    window.location.href = 'index.html';
    return null;
  }

  const { data, error } = await window.supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const profile = (!error && data)
    ? { ...data, role: normalizeRole(data.role) }
    : {
        id: user.id,
        email: user.email,
        full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || null,
        role: normalizeRole(user?.user_metadata?.role || user?.app_metadata?.role)
      };

  if (!profile || (requiredRole && normalizeRole(profile.role) !== normalizeRole(requiredRole))) {
    window.location.href = 'index.html';
    return null;
  }

  return profile;
}

async function signOut() {
  await window.supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}
