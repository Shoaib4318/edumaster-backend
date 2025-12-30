// Use this function for any protected data (e.g., getting courses or enrolling)
async function authorizedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        ...options.headers,
        'Authorization': token, // Send the JWT
        'Content-Type': 'application/json'
    };

    return fetch(url, { ...options, headers });
}