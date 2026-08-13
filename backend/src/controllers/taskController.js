const db = require('../db');

// GET all tasks of logged-in user
const getTasks = async (req, res) => {
    const userId = req.user.id; // Extracted by auth middleware

    try {
        const result = await db.query(
            'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error("Fetch tasks error:", err);
        res.status(500).json({
            success: false,
            message: "Server error while fetching tasks"
        });
    }
};

// CREATE a new task
const createTask = async (req, res) => {
    const userId = req.user.id;
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: "Task title is required"
        });
    }

    try {
        const result = await db.query(
            'INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
            [userId, title, description]
        );
        res.status(201).json({
            success: true,
            message: "Task created successfully!",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Create task error:", err);
        res.status(500).json({
            success: false,
            message: "Server error while creating task"
        });
    }
};

// UPDATE a task (verifies ownership)
const updateTask = async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description, completed } = req.body;

    if (!title && title !== undefined) {
        return res.status(400).json({
            success: false,
            message: "Title cannot be empty"
        });
    }

    try {
        // Find task first to verify existence vs ownership for specific error message
        const taskCheck = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Verify ownership: does task.user_id match logged-in user.id?
        if (taskCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ // 403 Forbidden
                success: false,
                message: "Access denied: You do not own this task"
            });
        }

        // Update the task columns
        const currentTask = taskCheck.rows[0];
        const newTitle = title !== undefined ? title : currentTask.title;
        const newDesc = description !== undefined ? description : currentTask.description;
        const newCompleted = completed !== undefined ? completed : currentTask.completed;

        const result = await db.query(
            'UPDATE tasks SET title = $1, description = $2, completed = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING *',
            [newTitle, newDesc, newCompleted, taskId, userId]
        );

        res.json({
            success: true,
            message: "Task updated successfully",
            data: result.rows[0]
        });

    } catch (err) {
        console.error("Update task error:", err);
        res.status(500).json({
            success: false,
            message: "Server error while updating task"
        });
    }
};

// DELETE a task (verifies ownership)
const deleteTask = async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;

    try {
        // Find task first to separate "Not Found" dynamic checks from "Access Denied"
        const taskCheck = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Verify ownership
        if (taskCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ // 403 Forbidden
                success: false,
                message: "Access denied: You do not own this task"
            });
        }

        // Delete the task
        await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
        
        res.json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (err) {
        console.error("Delete task error:", err);
        res.status(500).json({
            success: false,
            message: "Server error while deleting task"
        });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};
