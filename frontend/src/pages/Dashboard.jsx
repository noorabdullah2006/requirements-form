import React, { useState, useEffect } from 'react';
import {
    fetchStats, fetchProjects, fetchProject,
    updateStatus, addNote, deleteProject,
    fetchAdmins, createSubAdmin, deleteSubAdmin
} from '../services/adminService';
import './Dashboard.css';

// Status config: color tag and label
const STATUS_CONFIG = {
    NEW:         { color: '#6366f1', bg: '#eef2ff', label: 'New' },
    REVIEWING:   { color: '#f59e0b', bg: '#fffbeb', label: 'Reviewing' },
    QUOTED:      { color: '#8b5cf6', bg: '#f5f3ff', label: 'Quoted' },
    APPROVED:    { color: '#10b981', bg: '#ecfdf5', label: 'Approved' },
    IN_PROGRESS: { color: '#3b82f6', bg: '#eff6ff', label: 'In Progress' },
    COMPLETED:   { color: '#22c55e', bg: '#f0fdf4', label: 'Completed' },
    CANCELLED:   { color: '#ef4444', bg: '#fef2f2', label: 'Cancelled' },
};
const STATUS_ORDER = ['NEW','REVIEWING','QUOTED','APPROVED','IN_PROGRESS','COMPLETED','CANCELLED'];

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || { color: '#888', bg: '#f5f5f5', label: status };
    return (
        <span style={{
            padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
            color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}22`
        }}>
            {cfg.label}
        </span>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="stat-card">
            <span className="stat-value" style={{ color }}>{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    );
}

function SidebarNav({ user, isSuperAdmin, tab, setTab, onLogout, setView }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleTabClick = (newTab) => {
        setTab(newTab);
        if (setView) setView('list');
        setMobileOpen(false);
    };

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="mobile-header">
                <button
                    className="mobile-hamburger"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    ☰
                </button>
                <div className="mobile-brand">Admin Panel</div>
            </div>

            {/* Sidebar (Desktop Sidebar + Mobile Side Slide Drawer) */}
            <aside className={`dash-sidebar ${mobileOpen ? 'mobile-show' : ''}`}>
                <div className="sidebar-brand-wrap">
                    <div className="sidebar-brand">Admin Panel</div>
                    <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>✕</button>
                </div>
                <div className="sidebar-user">
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: isSuperAdmin ? '#10b981' : '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                        {isSuperAdmin ? '👑 Super Admin' : '🛡️ Sub-Admin'}
                    </div>
                </div>
                <nav className="sidebar-menu">
                    <button
                        className={`sidebar-link ${tab === 'projects' ? 'active' : ''}`}
                        onClick={() => handleTabClick('projects')}
                    >
                        📋 Projects
                    </button>
                    {isSuperAdmin && (
                        <button
                            className={`sidebar-link ${tab === 'team' ? 'active' : ''}`}
                            onClick={() => handleTabClick('team')}
                        >
                            👥 Team Management
                        </button>
                    )}
                    <button className="sidebar-link logout-btn" onClick={onLogout}>
                        ⏻ Logout
                    </button>
                </nav>
            </aside>
            {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
        </>
    );
}

export default function Dashboard({ user, token, onLogout }) {
    const isSuperAdmin = user?.role === 'super_admin' || user?.email === 'noorabdullah.qr10@gmail.com';

    const [tab, setTab]             = useState('projects'); // 'projects' | 'team'
    const [view, setView]           = useState('list');     // 'list' | 'detail'
    const [stats, setStats]         = useState(null);
    const [projects, setProjects]   = useState([]);
    const [selected, setSelected]   = useState(null);       // full project detail
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');

    // Status update state
    const [newStatus, setNewStatus] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);

    // Note state
    const [noteText, setNoteText]   = useState('');
    const [noteLoading, setNoteLoading] = useState(false);

    // Filter + search
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [search, setSearch]             = useState('');

    // ── Team Management state ──────────────────────────────────────────────
    const [admins, setAdmins]               = useState([]);
    const [teamLoading, setTeamLoading]     = useState(false);
    const [teamError, setTeamError]         = useState('');

    // Add sub-admin form state
    const [newAdminName, setNewAdminName]         = useState('');
    const [newAdminEmail, setNewAdminEmail]       = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [addAdminLoading, setAddAdminLoading]   = useState(false);
    const [addAdminMsg, setAddAdminMsg]           = useState({ type: '', text: '' });

    // ── Load project data ───────────────────────────────────────────────────
    useEffect(() => {
        loadDashboard();
        if (isSuperAdmin) {
            loadTeam();
        }
    }, [token]);

    const loadDashboard = async () => {
        setLoading(true);
        setError('');
        try {
            const [statsRes, projRes] = await Promise.all([
                fetchStats(token),
                fetchProjects(token)
            ]);
            setStats(statsRes.data);
            setProjects(projRes.data);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('denied') || err.message.includes('token')) onLogout();
        } finally {
            setLoading(false);
        }
    };

    const loadTeam = async () => {
        setTeamLoading(true);
        setTeamError('');
        try {
            const res = await fetchAdmins(token);
            setAdmins(res.data);
        } catch (err) {
            setTeamError(err.message);
        } finally {
            setTeamLoading(false);
        }
    };

    const handleCreateSubAdmin = async (e) => {
        e.preventDefault();
        if (!newAdminName || !newAdminEmail || !newAdminPassword) {
            setAddAdminMsg({ type: 'error', text: 'All fields are required' });
            return;
        }
        setAddAdminLoading(true);
        setAddAdminMsg({ type: '', text: '' });
        try {
            const res = await createSubAdmin({
                name: newAdminName,
                email: newAdminEmail,
                password: newAdminPassword
            }, token);
            setAddAdminMsg({ type: 'success', text: `Sub-Admin '${res.data.name}' added successfully!` });
            setNewAdminName('');
            setNewAdminEmail('');
            setNewAdminPassword('');
            loadTeam();
        } catch (err) {
            setAddAdminMsg({ type: 'error', text: err.message });
        } finally {
            setAddAdminLoading(false);
        }
    };

    const handleDeleteSubAdmin = async (id, name, email) => {
        if (email === 'noorabdullah.qr10@gmail.com') {
            alert('Super Admin (abdullah) cannot be deleted!');
            return;
        }
        if (!window.confirm(`Are you sure you want to remove sub-admin '${name}'?`)) return;

        try {
            await deleteSubAdmin(id, token);
            setAdmins(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const openProject = async (id) => {
        setLoading(true);
        try {
            const res = await fetchProject(id, token);
            setSelected(res.data);
            setNewStatus(res.data.status);
            setView('detail');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!newStatus || newStatus === selected.status) return;
        setStatusLoading(true);
        try {
            await updateStatus(selected.id, newStatus, token);
            setSelected(p => ({ ...p, status: newStatus }));
            setProjects(ps => ps.map(p => p.id === selected.id ? { ...p, status: newStatus } : p));
            fetchStats(token).then(r => setStats(r.data)).catch(() => {});
        } catch (err) {
            alert(err.message);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        setNoteLoading(true);
        try {
            const res = await addNote(selected.id, noteText, token);
            setSelected(p => ({
                ...p,
                notes: [{ ...res.data, admin_name: user.name }, ...p.notes]
            }));
            setNoteText('');
        } catch (err) {
            alert(err.message);
        } finally {
            setNoteLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project brief? This cannot be undone.')) return;
        try {
            await deleteProject(id, token);
            setProjects(ps => ps.filter(p => p.id !== id));
            fetchStats(token).then(r => setStats(r.data)).catch(() => {});
            if (view === 'detail') { setView('list'); setSelected(null); }
        } catch (err) {
            alert(err.message);
        }
    };

    // ── Filtered project list ───────────────────────────────────────────────
    const filtered = projects.filter(p => {
        const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
        const q = search.toLowerCase();
        const matchSearch = !q || p.client_name?.toLowerCase().includes(q) ||
            p.client_email?.toLowerCase().includes(q) ||
            p.company_name?.toLowerCase().includes(q) ||
            p.project_type?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    // ── Render: Detail View ─────────────────────────────────────────────────
    if (tab === 'projects' && view === 'detail' && selected) {
        return (
            <div className="dash-layout">
                <SidebarNav user={user} isSuperAdmin={isSuperAdmin} tab={tab} setTab={setTab} onLogout={onLogout} setView={setView} />

                <main className="dash-main">
                    <div className="dash-topbar">
                        <button className="btn-back-dash" onClick={() => { setView('list'); setSelected(null); }}>
                            ← All Projects
                        </button>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <StatusBadge status={selected.status} />
                            {isSuperAdmin && (
                                <button className="btn-danger-sm" onClick={() => handleDelete(selected.id)}>Delete</button>
                            )}
                        </div>
                    </div>

                    <div className="detail-grid">
                        {/* Left column */}
                        <div className="detail-col">
                            {/* Client */}
                            <div className="detail-card">
                                <h3 className="detail-card-title">👤 Client Information</h3>
                                <Row label="Name"    value={selected.client_name} />
                                <Row label="Email"   value={selected.client_email} />
                                <Row label="Phone"   value={selected.client_phone} />
                                <Row label="Company" value={selected.company_name} />
                                <Row label="Industry" value={selected.business_type} />
                            </div>

                            {/* Project */}
                            <div className="detail-card">
                                <h3 className="detail-card-title">📁 Project Information</h3>
                                <Row label="Type"  value={selected.project_type} />
                                <Row label="Goal"  value={selected.project_goal} />
                                <Row label="About" value={selected.business_description} multiline />
                            </div>

                            {/* Pages & Features */}
                            <div className="detail-card">
                                <h3 className="detail-card-title">📄 Pages</h3>
                                <TagList items={selected.pages} empty="None selected" />
                            </div>
                            <div className="detail-card">
                                <h3 className="detail-card-title">⚙️ Features</h3>
                                <TagList items={selected.features} empty="None selected" />
                            </div>

                            {/* Design */}
                            <div className="detail-card">
                                <h3 className="detail-card-title">🎨 Design</h3>
                                <Row label="Style"    value={selected.design_style} />
                                <Row label="Colors"   value={selected.preferred_colors} />
                                <Row label="Branding" value={selected.branding_status} />
                                <Row label="References" value={selected.reference_urls} multiline />
                            </div>

                            {/* Budget */}
                            <div className="detail-card">
                                <h3 className="detail-card-title">💰 Budget & Timeline</h3>
                                <Row label="Budget"   value={selected.budget} />
                                <Row label="Deadline" value={selected.deadline ? new Date(selected.deadline).toLocaleDateString() : 'Not set'} />
                                <Row label="Urgency"  value={selected.urgency} />
                            </div>

                             {/* Domain & Hosting */}
                            <div className="detail-card">
                                <h3 className="detail-card-title">🌐 Domain & Hosting</h3>
                                <Row label="Domain"  value={selected.domain_status} />
                                {selected.domain && <Row label="Domain Name" value={selected.domain} />}
                                <Row label="Hosting" value={selected.hosting_status} />
                                {selected.hosting_details && <Row label="Provider" value={selected.hosting_details} />}
                            </div>

                            {/* Additional */}
                            <div className="detail-card">
                                <h3 className="detail-card-title">📝 Additional Info</h3>
                                <Row label="Notes"         value={selected.additional_information || 'None'} multiline />
                                <Row label="Contact Via"   value={selected.communication_method} />
                            </div>

                            {/* Files */}
                            {selected.files?.length > 0 && (
                                <div className="detail-card">
                                    <h3 className="detail-card-title">📎 Uploaded Files</h3>
                                    {selected.files.map(f => (
                                        <a key={f.id}
                                            href={`http://localhost:5000${f.file_path}`}
                                            target="_blank" rel="noreferrer"
                                            className="file-link">
                                            📄 {f.file_name} <span className="file-size">({Math.round(f.file_size / 1024)}KB)</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right column */}
                        <div className="detail-col detail-col-right">
                            {/* Status Management */}
                            <div className="detail-card">
                                <h3 className="detail-card-title">🔄 Update Status</h3>
                                <p className="detail-hint">Current: <StatusBadge status={selected.status} /></p>
                                <select
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                    className="status-select"
                                >
                                    {STATUS_ORDER.map(s => (
                                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                    ))}
                                </select>
                                <button
                                    className="btn-primary"
                                    onClick={handleStatusUpdate}
                                    disabled={statusLoading || newStatus === selected.status}
                                >
                                    {statusLoading ? 'Saving...' : 'Update Status'}
                                </button>
                            </div>

                            {/* Private Notes */}
                            <div className="detail-card">
                                <h3 className="detail-card-title">🔒 Private Notes</h3>
                                <p className="detail-hint">Only you can see these — never visible to clients.</p>
                                <form onSubmit={handleAddNote} className="note-form">
                                    <textarea
                                        value={noteText}
                                        onChange={e => setNoteText(e.target.value)}
                                        placeholder="e.g. Client wants dark theme. Call Thursday."
                                        rows={3}
                                        className="note-textarea"
                                    />
                                    <button type="submit" className="btn-primary" disabled={noteLoading || !noteText.trim()}>
                                        {noteLoading ? 'Adding...' : '+ Add Note'}
                                    </button>
                                </form>
                                <div className="notes-list">
                                    {selected.notes?.length === 0 && (
                                        <p className="detail-hint">No notes yet.</p>
                                    )}
                                    {selected.notes?.map(n => (
                                        <div key={n.id} className="note-item">
                                            <p className="note-text">{n.note}</p>
                                            <span className="note-meta">
                                                {n.admin_name || 'Admin'} · {new Date(n.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ── Render: Team Management View (Super Admin Only) ──────────────────────
    if (tab === 'team' && isSuperAdmin) {
        return (
            <div className="dash-layout">
                <SidebarNav user={user} isSuperAdmin={isSuperAdmin} tab={tab} setTab={setTab} onLogout={onLogout} setView={setView} />

                <main className="dash-main">
                    <div className="dash-topbar">
                        <h1 className="dash-title">👥 Team / Admin Management</h1>
                        <button className="btn-refresh" onClick={loadTeam}>↺ Refresh Team</button>
                    </div>

                    {teamError && <p className="dash-error">{teamError}</p>}

                    <div className="detail-grid" style={{ gridTemplateColumns: '1fr 360px' }}>
                        {/* Admin List */}
                        <div className="detail-card">
                            <h3 className="detail-card-title">Existing Admin Users</h3>
                            {teamLoading ? (
                                <p className="dash-loading">Loading admin list...</p>
                            ) : (
                                <table className="project-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map(a => {
                                            const isSelfOrOwner = a.email === 'noorabdullah.qr10@gmail.com' || a.role === 'super_admin';
                                            return (
                                                <tr key={a.id}>
                                                    <td className="td-id">#{a.id}</td>
                                                    <td className="td-name">{a.name}</td>
                                                    <td className="td-email">{a.email}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                                                            color: isSelfOrOwner ? '#10b981' : '#3b82f6',
                                                            backgroundColor: isSelfOrOwner ? '#ecfdf5' : '#eff6ff'
                                                        }}>
                                                            {isSelfOrOwner ? '👑 Super Admin' : '🛡️ Sub-Admin'}
                                                        </span>
                                                    </td>
                                                    <td className="td-date">{new Date(a.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        {isSelfOrOwner ? (
                                                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Protected</span>
                                                        ) : (
                                                            <button
                                                                className="btn-danger-sm"
                                                                onClick={() => handleDeleteSubAdmin(a.id, a.name, a.email)}
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Add Sub-Admin Form */}
                        <div className="detail-card">
                            <h3 className="detail-card-title">➕ Add New Sub-Admin</h3>
                            <p className="detail-hint">Sub-admins can view project requests, update status, and add notes, but cannot manage other admin accounts.</p>

                            {addAdminMsg.text && (
                                <p style={{
                                    fontSize: '13px', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px',
                                    backgroundColor: addAdminMsg.type === 'error' ? '#fef2f2' : '#ecfdf5',
                                    color: addAdminMsg.type === 'error' ? '#ef4444' : '#10b981',
                                    border: `1px solid ${addAdminMsg.type === 'error' ? '#fca5a5' : '#a7f3d0'}`
                                }}>
                                    {addAdminMsg.text}
                                </p>
                            )}

                            <form onSubmit={handleCreateSubAdmin} className="note-form">
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Full Name</label>
                                <input
                                    type="text"
                                    className="search-input"
                                    style={{ width: '100%', marginBottom: '8px' }}
                                    placeholder="e.g. John Doe"
                                    value={newAdminName}
                                    onChange={e => setNewAdminName(e.target.value)}
                                    required
                                />

                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="search-input"
                                    style={{ width: '100%', marginBottom: '8px' }}
                                    placeholder="e.g. john@agency.com"
                                    value={newAdminEmail}
                                    onChange={e => setNewAdminEmail(e.target.value)}
                                    required
                                />

                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Password (min 6 chars)</label>
                                <input
                                    type="password"
                                    className="search-input"
                                    style={{ width: '100%', marginBottom: '14px' }}
                                    placeholder="••••••••"
                                    value={newAdminPassword}
                                    onChange={e => setNewAdminPassword(e.target.value)}
                                    required
                                />

                                <button type="submit" className="btn-primary" disabled={addAdminLoading}>
                                    {addAdminLoading ? 'Adding...' : '+ Add Sub-Admin'}
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ── Render: Projects List View ─────────────────────────────────────────
    return (
        <div className="dash-layout">
            <SidebarNav user={user} isSuperAdmin={isSuperAdmin} tab={tab} setTab={setTab} onLogout={onLogout} setView={setView} />

            <main className="dash-main">
                <div className="dash-topbar">
                    <h1 className="dash-title">Dashboard</h1>
                    <button className="btn-refresh" onClick={loadDashboard}>↺ Refresh</button>
                </div>

                {error && <p className="dash-error">{error}</p>}

                {/* Stats */}
                {stats && (
                    <div className="stats-grid">
                        <StatCard label="Total"       value={stats.total}       color="#1e293b" />
                        <StatCard label="New"         value={stats.new}         color="#6366f1" />
                        <StatCard label="Reviewing"   value={stats.reviewing}   color="#f59e0b" />
                        <StatCard label="Quoted"      value={stats.quoted}      color="#8b5cf6" />
                        <StatCard label="Approved"    value={stats.approved}    color="#10b981" />
                        <StatCard label="In Progress" value={stats.in_progress} color="#3b82f6" />
                        <StatCard label="Completed"   value={stats.completed}   color="#22c55e" />
                    </div>
                )}

                {/* Filters */}
                <div className="filter-bar">
                    <input
                        className="search-input"
                        placeholder="Search by name, email, company..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="ALL">All Statuses</option>
                        {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                    </select>
                </div>

                {/* Project Table */}
                {loading ? (
                    <p className="dash-loading">Loading projects...</p>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <p>No projects found.</p>
                    </div>
                ) : (
                    <div className="project-table-wrap">
                        <table className="project-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Client</th>
                                    <th>Company</th>
                                    <th>Project Type</th>
                                    <th>Budget</th>
                                    <th>Urgency</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(p => (
                                    <tr key={p.id} onClick={() => openProject(p.id)} style={{ cursor: 'pointer' }}>
                                        <td className="td-id">#{p.id}</td>
                                        <td>
                                            <div className="td-name">{p.client_name}</div>
                                            <div className="td-email">{p.client_email}</div>
                                        </td>
                                        <td>{p.company_name || '—'}</td>
                                        <td>{p.project_type}</td>
                                        <td>{p.budget || '—'}</td>
                                        <td>{p.urgency || '—'}</td>
                                        <td><StatusBadge status={p.status} /></td>
                                        <td className="td-date">{new Date(p.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

// ── Small helper components ──────────────────────────────────────────────────
function Row({ label, value, multiline }) {
    if (!value) return null;
    return (
        <div className="detail-row">
            <span className="detail-label">{label}</span>
            <span className={`detail-value ${multiline ? 'multiline' : ''}`}>{value}</span>
        </div>
    );
}

function TagList({ items, empty }) {
    if (!items?.length) return <p className="detail-hint">{empty}</p>;
    return (
        <div className="tag-list">
            {items.map((item, i) => <span key={i} className="tag">{item}</span>)}
        </div>
    );
}
