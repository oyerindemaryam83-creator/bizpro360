document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value; // must be "admin" or "customer"
    const message = document.getElementById("message");

    // Get existing users from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email already exists
    if (users.some(user => user.email === email)) {
        message.style.color = "red";
        message.textContent = "Account already exists with this email.";
        return;
    }

    // Save new user
    users.push({ name, email, password, role });
    localStorage.setItem("users", JSON.stringify(users));

    message.style.color = "green";
    message.textContent = "Account created successfully! Redirecting to login...";

    setTimeout(() => {
        window.location.href = "indexlogin.html";
    }, 2000);
});

