document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const message = document.getElementById("message");

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name, role }
        }
    });

    if (authError) {
        message.style.color = "red";
        message.textContent = authError.message;
        return;
    }

    if (authData?.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            full_name: name,
            role,
            email
        });

        if (profileError) {
            message.style.color = "red";
            message.textContent = profileError.message;
            return;
        }
    }

    message.style.color = "green";
    message.textContent = "Account created successfully. Please check your email to confirm it, then sign in.";

    setTimeout(() => {
        window.location.href = "indexlogin.html";
    }, 2500);
});

