const db = require('../config/db');

// Approve an Instructor so they can log in/operate
exports.approveInstructor = async (req, res) => {
    const { user_id } = req.params;
    try {
        await db.query('UPDATE users SET is_approved = true WHERE id = $1 AND role = $2', [user_id, 'Instructor']);
        res.json({ message: "Instructor approved successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to approve instructor" });
    }
};

// Get pending instructors
exports.getPendingInstructors = async (req, res) => {
    try {
        const result = await db.query("SELECT id, name, email FROM users WHERE role = 'Instructor' AND is_approved = false");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch pending instructors" });
    }
};

// Approve a Course so it becomes 'Published' and visible to students
exports.approveCourse = async (req, res) => {
    const { course_id } = req.params;
    try {
        await db.query("UPDATE courses SET status = 'Published' WHERE id = $1", [course_id]);
        res.json({ message: "Course published successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to publish course" });
    }
};

// Get pending courses
exports.getPendingCourses = async (req, res) => {
    try {
        const result = await db.query("SELECT c.id, c.title, c.description, u.name as instructor_name FROM courses c JOIN users u ON c.instructor_id = u.id WHERE c.status = 'Submitted'");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch pending courses" });
    }
};

// Block/Unblock users (Students or Instructors)
exports.toggleUserStatus = async (req, res) => {
    const { user_id, block_status } = req.body;
    try {
        await db.query('UPDATE users SET is_blocked = $1 WHERE id = $2', [block_status, user_id]);
        res.json({ message: "User status updated" });
    } catch (err) {
        res.status(500).json({ error: "Action failed" });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, role, is_approved, is_blocked FROM users ORDER BY role, name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};