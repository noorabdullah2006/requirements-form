const API = 'http://localhost:5000/api/admin';

const headers = (token) => ({ 'Authorization': `Bearer ${token}` });
const authFetch = async (url, token, opts = {}) => {
    const res = await fetch(url, { ...opts, headers: { ...headers(token), ...(opts.headers || {}) } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
};

export const fetchStats    = (token)     => authFetch(`${API}/stats`, token);
export const fetchProjects = (token)     => authFetch(`${API}/projects`, token);
export const fetchProject  = (id, token) => authFetch(`${API}/projects/${id}`, token);
export const updateStatus  = (id, status, token) =>
    authFetch(`${API}/projects/${id}/status`, token, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
export const addNote = (id, note, token) =>
    authFetch(`${API}/projects/${id}/notes`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
    });
export const deleteProject = (id, token) =>
    authFetch(`${API}/projects/${id}`, token, { method: 'DELETE' });

// ── Team / Sub-Admin Management Services (Super Admin Only) ──────────────────
export const fetchAdmins = (token) => authFetch(`${API}/users`, token);
export const createSubAdmin = (data, token) =>
    authFetch(`${API}/users`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
export const deleteSubAdmin = (id, token) =>
    authFetch(`${API}/users/${id}`, token, { method: 'DELETE' });

