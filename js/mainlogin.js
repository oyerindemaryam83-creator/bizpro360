document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const message = document.getElementById("message");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        message.style.color = "red";
        message.textContent = error.message;
        return;
    }

    const profile = await getCurrentUserProfile();

    if (!profile || profile.role !== role) {
        message.style.color = "red";
        message.textContent = `This account is not registered as ${role}.`;
        return;
    }

    message.style.color = "green";
    message.textContent = `${role} login successful! Redirecting...`;

    if (role === "admin") {
        setTimeout(() => window.location.href = "admin.html", 1500);
    } else if (role === "customer") {
        setTimeout(() => window.location.href = "customer.html", 1500);
    }
});
