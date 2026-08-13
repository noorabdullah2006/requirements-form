const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

// Send register payload to backend
export const registerUser = async (name, email, password) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
    }
    
    return data;
};

// Send login payload to backend
export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }
    
    return data;
};
