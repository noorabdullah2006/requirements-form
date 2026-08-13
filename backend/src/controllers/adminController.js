const db = require('../db');

// ── GET all projects (with client info) ──────────────────────────────────────
const getProjects = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                p.id, p.project_type, p.budget, p.deadline, p.urgency,
                p.status, p.created_at,
                c.name  AS client_name,
                c.email AS client_email,
                c.company_name
            FROM projects p
            JOIN clients c ON p.client_id = c.id
            ORDER BY p.created_at DESC
        `);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        console.error('getProjects error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET single project with full details ─────────────────────────────────────
const getProjectById = async (req, res) => {
    const { id } = req.params;
    try {
        // Main project + client info
        const projResult = await db.query(`
            SELECT p.*, c.name AS client_name, c.email AS client_email,
                   c.phone AS client_phone, c.company_name, c.business_type
            FROM projects p
            JOIN clients c ON p.client_id = c.id
            WHERE p.id = $1
        `, [id]);

        if (projResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const project = projResult.rows[0];

        // Pages
        const pagesResult = await db.query(
            'SELECT page_name FROM project_pages WHERE project_id = $1', [id]
        );

        // Features
        const featResult = await db.query(
            'SELECT feature_name FROM project_features WHERE project_id = $1', [id]
        );

        // Files
        const filesResult = await db.query(
            'SELECT id, file_name, file_path, file_type, file_size, created_at FROM project_files WHERE project_id = $1', [id]
        );

        // Notes (private admin notes)
        const notesResult = await db.query(`
            SELECT n.id, n.note, n.created_at, u.name AS admin_name
            FROM project_notes n
            LEFT JOIN users u ON n.admin_id = u.id
            WHERE n.project_id = $1
            ORDER BY n.created_at DESC
        `, [id]);

        res.json({
            success: true,
            data: {
                ...project,
                pages:    pagesResult.rows.map(r => r.page_name),
                features: featResult.rows.map(r => r.feature_name),
                files:    filesResult.rows,
                notes:    notesResult.rows
            }
        });
    } catch (err) {
        console.error('getProjectById error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── PUT update project status ─────────────────────────────────────────────────
const VALID_STATUSES = ['NEW', 'REVIEWING', 'QUOTED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
        });
    }

    try {
        const result = await db.query(
            `UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status`,
            [status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json({ success: true, message: 'Status updated', data: result.rows[0] });
    } catch (err) {
        console.error('updateStatus error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST add private admin note ───────────────────────────────────────────────
const addNote = async (req, res) => {
    const { id } = req.params;
    const { note } = req.body;
    const adminId = req.user.id; // set by authenticateToken middleware

    if (!note?.trim()) {
        return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    try {
        const result = await db.query(
            `INSERT INTO project_notes (project_id, admin_id, note)
             VALUES ($1, $2, $3) RETURNING id, note, created_at`,
            [id, adminId, note.trim()]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('addNote error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── DELETE project (Super Admin Only) ───────────────────────────────────────────
const deleteProject = async (req, res) => {
    const { id } = req.params;
    const isSuperAdmin = req.user?.role === 'super_admin' || req.user?.email === 'noorabdullah.qr10@gmail.com';

    if (!isSuperAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Only Super Admin can delete project briefs.'
        });
    }

    try {
        const result = await db.query(
            'DELETE FROM projects WHERE id = $1 RETURNING id', [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json({ success: true, message: 'Project deleted' });
    } catch (err) {
        console.error('deleteProject error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET dashboard stats ───────────────────────────────────────────────────────
const getStats = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                COUNT(*)                                              AS total,
                COUNT(*) FILTER (WHERE status = 'NEW')               AS new,
                COUNT(*) FILTER (WHERE status = 'REVIEWING')         AS reviewing,
                COUNT(*) FILTER (WHERE status = 'QUOTED')            AS quoted,
                COUNT(*) FILTER (WHERE status = 'APPROVED')         AS approved,
                COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')      AS in_progress,
                COUNT(*) FILTER (WHERE status = 'COMPLETED')        AS completed,
                COUNT(*) FILTER (WHERE status = 'CANCELLED')        AS cancelled
            FROM projects
        `);
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── TEAM / ADMIN MANAGEMENT (Super Admin Only) ──────────────────────────────
const bcrypt = require('bcrypt');

const getAdmins = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, name, email, role, created_at FROM users ORDER BY created_at ASC`
        );
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        console.error('getAdmins error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const createSubAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    try {
        // Check if user already exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ($1, $2, $3, 'admin')
             RETURNING id, name, email, role, created_at`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'Sub-Admin added successfully',
            data: newUser.rows[0]
        });
    } catch (err) {
        console.error('createSubAdmin error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteSubAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch target user to prevent Super Admin deletion
        const userRes = await db.query('SELECT * FROM users WHERE id = $1', [id]);

        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const targetUser = userRes.rows[0];

        // CRITICAL PROTECTION: Cannot delete Super Admin (abdullah)
        if (targetUser.email === 'noorabdullah.qr10@gmail.com' || targetUser.role === 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Super Admin (abdullah) cannot be deleted or demoted!'
            });
        }

        await db.query('DELETE FROM users WHERE id = $1', [id]);

        res.json({
            success: true,
            message: `Admin user '${targetUser.name}' (${targetUser.email}) removed successfully`
        });
    } catch (err) {
        console.error('deleteSubAdmin error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    updateStatus,
    addNote,
    deleteProject,
    getStats,
    getAdmins,
    createSubAdmin,
    deleteSubAdmin
};

