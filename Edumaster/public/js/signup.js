document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            if (role === 'Instructor') {
                alert("Registration successful! Please wait for an Administrator to approve your instructor account.");
            } else {
                alert("Registration successful! You can now login.");
            }
            window.location.href = '/login.html';
        } else {
            alert(data.error || "Registration failed. Email might already be in use.");
        }
    } catch (err) {
        console.error("Signup Error:", err);
        alert("Server error. Please try again later.");
    }
});