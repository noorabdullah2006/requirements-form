const express = require('express');
const router = express.Router();
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const admin = require('../controllers/adminController');

// All routes below require a valid admin JWT token
router.use(authenticateToken);

// GET  /api/admin/stats     — dashboard statistics
router.get('/stats', admin.getStats);

// GET  /api/admin/projects  — list all submitted projects
router.get('/projects', admin.getProjects);

// GET  /api/admin/projects/:id — full project details
router.get('/projects/:id', admin.getProjectById);

// PUT  /api/admin/projects/:id/status — change project status
router.put('/projects/:id/status', admin.updateStatus);

// POST /api/admin/projects/:id/notes  — add private admin note
router.post('/projects/:id/notes', admin.addNote);

// DELETE /api/admin/projects/:id — delete project
router.delete('/projects/:id', admin.deleteProject);

// ── TEAM / SUB-ADMIN MANAGEMENT (Super Admin Only) ─────────────────────────
// GET    /api/admin/users      — list all admin users
router.get('/users', requireSuperAdmin, admin.getAdmins);

// POST   /api/admin/users      — add a new sub-admin
router.post('/users', requireSuperAdmin, admin.createSubAdmin);

// DELETE /api/admin/users/:id  — remove a sub-admin (cannot delete abdullah)
router.delete('/users/:id', requireSuperAdmin, admin.deleteSubAdmin);

module.exports = router;

