// Function to handle login
async function loginUser(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
        // Store the token and role
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        // Redirect based on role (Requirement: Role-Based Access)
        if (data.role === 'Administrator') {
            window.location.href = '/admin.html';
        } else if (data.role === 'Instructor') {
            window.location.href = '/instructor.html';
        } else {
            window.location.href = '/student.html';
        }
    } else {
        alert(data.error);
    }
}

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store JWT and Role for role-based access [cite: 9, 37]
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);

            // Redirect based on the user's role [cite: 21]
            if (data.role === 'Administrator') window.location.href = '/admin.html';
            else if (data.role === 'Instructor') window.location.href = '/instructor.html';
            else window.location.href = '/student.html';
        } else {
            alert(data.error || "Login failed");
        }
    } catch (err) {
        console.error("Auth Error:", err);
    }
});

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}