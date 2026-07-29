document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const message = document.getElementById("message");

  const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    message.style.color = "red";
    message.textContent = error.message;
    return;
  }

  const profile = await getCurrentUserProfile();
  const selectedRole = role.toLowerCase();
  const profileRole = normalizeRole(profile?.role);

  // Strictly block login if account has no assigned role or role doesn't match
  if (!profileRole || profileRole !== selectedRole) {
    message.style.color = "red";
    message.textContent = `This account is not registered as ${selectedRole}.`;
    return;
  }

  sessionStorage.setItem("userRole", selectedRole);
  message.style.color = "green";
  message.textContent = `${selectedRole} login successful! Redirecting...`;

  if (selectedRole === "admin") {
    setTimeout(() => window.location.assign("admin.html"), 1500);
  } else if (selectedRole === "customer") {
    setTimeout(() => window.location.assign("customer.html"), 1500);
  }
});