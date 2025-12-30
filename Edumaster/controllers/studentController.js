const db = require('../config/db');

// Enroll a student in a course
exports.enrollInCourse = async (req, res) => {
    const { course_id } = req.body;
    const student_id = req.user.id;
    try {
        // Only allow enrollment in 'Published' courses [cite: 42]
        const course = await db.query("SELECT * FROM courses WHERE id = $1 AND status = 'Published'", [course_id]);
        if (course.rows.length === 0) return res.status(404).json({ error: "Course not available" });

        await db.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [student_id, course_id]
        );
        res.status(201).json({ message: "Enrolled successfully" });
    } catch (err) {
        res.status(500).json({ error: "Enrollment failed" });
    }
};

// Update lesson progress [cite: 48]
exports.updateProgress = async (req, res) => {
    const { course_id } = req.body;
    const student_id = req.user.id;
    try {
        // Get current progress
        const current = await db.query('SELECT progress_percentage FROM enrollments WHERE student_id = $1 AND course_id = $2', [student_id, course_id]);
        if (current.rows.length === 0) return res.status(404).json({ error: "Enrollment not found" });
        
        const newProgress = Math.min(current.rows[0].progress_percentage + 10, 100);
        const isCompleted = newProgress === 100;

        await db.query(
            'UPDATE enrollments SET progress_percentage = $1, is_completed = $2 WHERE student_id = $3 AND course_id = $4',
            [newProgress, isCompleted, student_id, course_id]
        );

        res.json({ message: "Progress updated", progress: newProgress });
    } catch (err) {
        res.status(500).json({ error: "Failed to update progress" });
    }
};