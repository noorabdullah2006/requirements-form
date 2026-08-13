const API_URL = `${import.meta.env.VITE_API_URL}/api/tasks`;

// Get all tasks for logged-in user
export const fetchTasks = async (token) => {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tasks');
    }
    return data;
};

// Create task
export const createTask = async (title, description, token) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to create task');
    }
    return data;
};

// Update task
export const updateTask = async (taskId, updatedFields, token) => {
    const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to update task');
    }
    return data;
};

// Delete task
export const deleteTask = async (taskId, token) => {
    const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete task');
    }
    return data;
};
