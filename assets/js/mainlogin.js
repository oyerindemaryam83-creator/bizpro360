document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value; // must match "admin" or "customer"
    const message = document.getElementById("message");

    // Get users from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Find matching user
    const user = users.find(u => u.email === email && u.password === password && u.role === role);

    if (user) {
        message.style.color = "green";
        message.textContent = `${role} login successful! Redirecting...`;

        if (role === "admin") {
            setTimeout(() => window.location.href = "admin.html", 1500);
        } else if (role === "customer") {
            setTimeout(() => window.location.href = "customer.html", 1500);
        }
    } else {
        message.style.color = "red";
        message.textContent = "Invalid credentials. Try again.";
    }
});
