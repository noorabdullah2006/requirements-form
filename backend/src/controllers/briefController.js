const db = require('../db');
const path = require('path');

/**
 * POST /api/projects
 * 
 * Public endpoint — no JWT required.
 * Accepts multipart/form-data with all form fields + files.
 * 
 * Flow:
 *   1. Validate required fields
 *   2. Insert into clients table → get client_id
 *   3. Insert into projects table → get project_id
 *   4. Insert pages into project_pages table
 *   5. Insert features into project_features table
 *   6. Insert uploaded file records into project_files table
 *   7. Return 201 with project_id
 */
const submitBrief = async (req, res) => {
    try {
        // ── 1. Parse & validate required fields ──────────────────────────
        const {
            // Client Info
            fullName, email, phone, companyName, businessType,
            // Project Info
            projectType, businessDescription, projectGoal,
            // Design
            designStyle, preferredColors, hasExistingBranding, referenceUrls,
            // Content
            contentStatus,
            // Domain & Hosting
            hasDomain, domain, hasHosting, hostingDetails,
            // Budget
            budget, deadline, urgency,
            // Additional
            additionalNotes, communicationMethod
        } = req.body;

        // Parse array fields — sent as JSON strings from the frontend
        const pages    = safeParseJSON(req.body.pages,    []);
        const features = safeParseJSON(req.body.features, []);
        const availableAssets = safeParseJSON(req.body.availableAssets, []);

        // Backend validation (always validate on server — never trust frontend alone)
        const errors = {};
        if (!fullName?.trim())             errors.fullName = 'Full name is required';
        if (!email?.trim())                errors.email    = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(email))  errors.email    = 'Email is invalid';
        if (!projectType?.trim())          errors.projectType = 'Project type is required';
        if (!businessDescription?.trim())  errors.businessDescription = 'Description is required';

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        // ── 2. Insert or find client record ──────────────────────────────────
        //
        // First check if a client with this email already exists.
        // If yes, reuse their ID. If no, insert a new client.
        // This avoids needing a UNIQUE constraint on the email column.
        let clientId;
        const existing = await db.query(
            'SELECT id FROM clients WHERE email = $1',
            [email.trim().toLowerCase()]
        );

        if (existing.rows.length > 0) {
            clientId = existing.rows[0].id;
        } else {
            const clientResult = await db.query(
                `INSERT INTO clients (name, email, phone, company_name, business_type)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [fullName.trim(), email.trim().toLowerCase(), phone || null, companyName || null, businessType || null]
            );
            clientId = clientResult.rows[0].id;
        }

        // ── 3. Insert project record ──────────────────────────────────────
        const projectResult = await db.query(
            `INSERT INTO projects (
                client_id, project_type, business_description, project_goal,
                design_style, preferred_colors, branding_status,
                reference_urls, content_status, available_assets,
                domain_status, domain, hosting_status, hosting_details,
                budget, deadline, urgency,
                additional_information, communication_method,
                status
             ) VALUES (
                $1, $2, $3, $4,
                $5, $6, $7,
                $8, $9, $10,
                $11, $12, $13, $14,
                $15, $16, $17,
                $18, $19,
                'NEW'
             ) RETURNING id`,
            [
                clientId, projectType.trim(), businessDescription.trim(), projectGoal || null,
                designStyle || null, preferredColors || null, hasExistingBranding || null,
                referenceUrls || null, contentStatus || null, availableAssets.join(', ') || null,
                hasDomain || null, domain || null, hasHosting || null, hostingDetails || null,
                budget || null, deadline || null, urgency || null,
                additionalNotes || null, communicationMethod || null
            ]
        );
        const projectId = projectResult.rows[0].id;

        // ── 4. Insert pages ───────────────────────────────────────────────
        if (pages.length > 0) {
            const pageValues = pages.map((_, i) => `($1, $${i + 2})`).join(', ');
            await db.query(
                `INSERT INTO project_pages (project_id, page_name) VALUES ${pageValues}`,
                [projectId, ...pages]
            );
        }

        // ── 5. Insert features ────────────────────────────────────────────
        if (features.length > 0) {
            const featValues = features.map((_, i) => `($1, $${i + 2})`).join(', ');
            await db.query(
                `INSERT INTO project_features (project_id, feature_name) VALUES ${featValues}`,
                [projectId, ...features]
            );
        }

        // ── 6. Insert uploaded file records ──────────────────────────────
        //
        // Files are saved to disk by multer middleware before this function runs.
        // We store metadata (name, path, type, size) in project_files table.
        // The actual binary file is NOT stored in the database.
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const filePath = `/uploads/${file.filename}`;
                await db.query(
                    `INSERT INTO project_files (project_id, file_name, file_path, file_url, file_type, file_size)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        projectId,
                        file.originalname,
                        filePath,
                        filePath,
                        file.mimetype,
                        file.size
                    ]
                );
            }
        }

        // ── 7. Return success ─────────────────────────────────────────────
        res.status(201).json({
            success: true,
            message: 'Project brief submitted successfully!',
            data: { projectId, clientId }
        });

    } catch (err) {
        console.error('Brief submission error:', err);
        // NOTE: Showing raw error during development only — remove before production
        res.status(500).json({
            success: false,
            message: err.message || 'Server error',
            detail: err.detail || null,
            hint: 'Check the backend terminal for more info'
        });
    }
};

// Helper: safely parse a JSON string, return fallback if invalid
function safeParseJSON(str, fallback) {
    try { return JSON.parse(str) ?? fallback; }
    catch { return fallback; }
}

module.exports = { submitBrief };
