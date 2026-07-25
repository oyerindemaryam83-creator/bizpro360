const SUPABASE_URL = "https://irnvtcljxxrfmoqwpvft.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlybnZ0Y2xqeHhyZm1vcXdwdmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDgyMDYsImV4cCI6MjA5ODQ4NDIwNn0.x3yghXofeg8Zlw8MPAbbBQNeuUeuFQr98n2iC37yk80";

const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getCurrentUserProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data;
}

async function requireRole(requiredRole) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    window.location.href = 'index.html';
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data || (requiredRole && data.role !== requiredRole)) {
    window.location.href = 'index.html';
    return null;
  }

  return data;
}

async function signOut() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}
