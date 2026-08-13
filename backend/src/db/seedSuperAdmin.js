const db = require('./index');
const bcrypt = require('bcrypt');

async function seedSuperAdmin() {
    const email = 'noorabdullah.qr10@gmail.com';
    const name = 'abdullah';
    // Default initial password for Super Admin if creating new
    const defaultPassword = 'AdminPassword123!';

    try {
        console.log('--- Seeding Super Admin ---');

        // 1. Ensure 'role' column exists in users table and project_files has file_path column
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';`);
        await db.query(`ALTER TABLE project_files ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);`);
        await db.query(`ALTER TABLE project_files ADD COLUMN IF NOT EXISTS file_url VARCHAR(500);`);
        await db.query(`ALTER TABLE project_files ALTER COLUMN file_url DROP NOT NULL;`).catch(() => {});
        await db.query(`ALTER TABLE project_files ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);`);
        await db.query(`ALTER TABLE project_files ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);`);
        await db.query(`ALTER TABLE project_files ADD COLUMN IF NOT EXISTS file_size INTEGER;`);
        
        // Fix project_notes foreign key to point to users table instead of old admins table
        await db.query(`ALTER TABLE project_notes DROP CONSTRAINT IF EXISTS project_notes_admin_id_fkey;`);
        await db.query(`
            ALTER TABLE project_notes 
            ADD CONSTRAINT project_notes_admin_id_fkey 
            FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;
        `).catch(err => console.log('FK add warning (ignored):', err.message));

        console.log('✅ Schema & columns verified in database.');

        // 2. Check if Super Admin user already exists
        const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        const targetPassword = 'abdullah';
        const hashedPassword = await bcrypt.hash(targetPassword, 10);

        if (userRes.rows.length > 0) {
            // Update existing user to super_admin, set name to abdullah, and update password
            await db.query(
                `UPDATE users SET name = $1, password_hash = $2, role = 'super_admin' WHERE email = $3`,
                [name, hashedPassword, email]
            );
            console.log(`✅ Existing user ${email} updated to Super Admin (name: ${name}, password: ${targetPassword}, role: super_admin).`);
        } else {
            // Create new Super Admin user
            await db.query(
                `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'super_admin')`,
                [name, email, hashedPassword]
            );
            console.log(`🎉 New Super Admin user created!`);
            console.log(`   Email: ${email}`);
            console.log(`   Name: ${name}`);
            console.log(`   Password: ${targetPassword}`);
        }

        console.log('--- Seeding Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding Super Admin:', err);
        process.exit(1);
    }
}

seedSuperAdmin();
