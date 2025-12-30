const db = require('../config/db');

// Create a new course in 'Draft' status
exports.createCourse = async (req, res) => {
    const { title, description } = req.body;
    const instructor_id = req.user.id;
    try {
        const result = await db.query(
            'INSERT INTO courses (instructor_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [instructor_id, title, description, 'Draft']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to create course" });
    }
};

// Add a lesson to a specific course
exports.addLesson = async (req, res) => {
    const { course_id, title, content_url, order_index } = req.body;
    try {
        const course = await db.query('SELECT * FROM courses WHERE id = $1 AND instructor_id = $2', [course_id, req.user.id]);
        if (course.rows.length === 0) return res.status(403).json({ error: "Unauthorized" });

        const result = await db.query(
            'INSERT INTO lessons (course_id, title, content_url, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
            [course_id, title, content_url, order_index]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to add lesson" });
    }
};

// Submit course for Admin approval
exports.submitForApproval = async (req, res) => {
    const { course_id } = req.params;
    try {
        await db.query('UPDATE courses SET status = $1 WHERE id = $2 AND instructor_id = $3', ['Submitted', course_id, req.user.id]);
        res.json({ message: "Course submitted for moderation" });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
};

// Get courses created by the logged-in instructor
exports.getMyCourses = async (req, res) => {
    const instructor_id = req.user.id;
    try {
        const result = await db.query('SELECT * FROM courses WHERE instructor_id = $1 ORDER BY created_at DESC', [instructor_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch courses" });
    }
};

// Get published courses for students
exports.getAvailableCourses = async (req, res) => {
    try {
        const result = await db.query("SELECT c.*, u.name as instructor_name FROM courses c JOIN users u ON c.instructor_id = u.id WHERE c.status = 'Published'");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch courses" });
    }
};

// Get enrolled courses for student
exports.getEnrolledCourses = async (req, res) => {
    const student_id = req.user.id;
    try {
        const result = await db.query(`
            SELECT c.*, e.progress_percentage, e.is_completed
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = $1
        `, [student_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch enrolled courses" });
    }
};

// Get lessons for a specific course
exports.getLessons = async (req, res) => {
    const { course_id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;
    try {
        let authorized = false;
        if (user_role === 'Instructor') {
            const course = await db.query('SELECT * FROM courses WHERE id = $1 AND instructor_id = $2', [course_id, user_id]);
            authorized = course.rows.length > 0;
        } else {
            const enrollment = await db.query('SELECT * FROM enrollments WHERE course_id = $1 AND student_id = $2', [course_id, user_id]);
            authorized = enrollment.rows.length > 0;
        }
        if (!authorized) return res.status(403).json({ error: "Unauthorized" });

        const result = await db.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index', [course_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch lessons" });
    }
};

// Create a quiz for a course
exports.createQuiz = async (req, res) => {
    const { course_id, title, question_data, passing_score } = req.body;
    try {
        const course = await db.query('SELECT * FROM courses WHERE id = $1 AND instructor_id = $2', [course_id, req.user.id]);
        if (course.rows.length === 0) return res.status(403).json({ error: "Unauthorized" });

        const result = await db.query(
            'INSERT INTO quizzes (course_id, title, question_data, passing_score) VALUES ($1, $2, $3, $4) RETURNING *',
            [course_id, title, JSON.stringify(question_data), passing_score]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to create quiz" });
    }
};

// Get quizzes for a course
exports.getQuizzes = async (req, res) => {
    const { course_id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;
    try {
        let authorized = false;
        if (user_role === 'Instructor') {
            const course = await db.query('SELECT * FROM courses WHERE id = $1 AND instructor_id = $2', [course_id, user_id]);
            authorized = course.rows.length > 0;
        } else {
            const enrollment = await db.query('SELECT * FROM enrollments WHERE course_id = $1 AND student_id = $2', [course_id, user_id]);
            authorized = enrollment.rows.length > 0;
        }
        if (!authorized) return res.status(403).json({ error: "Unauthorized" });

        const result = await db.query('SELECT * FROM quizzes WHERE course_id = $1', [course_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch quizzes" });
    }
};

// Get enrolled students for a specific course (for instructors)
exports.getEnrolledStudents = async (req, res) => {
    const { course_id } = req.params;
    const instructor_id = req.user.id;
    try {
        const course = await db.query('SELECT * FROM courses WHERE id = $1 AND instructor_id = $2', [course_id, instructor_id]);
        if (course.rows.length === 0) return res.status(403).json({ error: "Unauthorized" });

        const result = await db.query(`
            SELECT u.id, u.name, u.email, e.enrolled_at, e.progress_percentage, e.is_completed
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            WHERE e.course_id = $1
            ORDER BY e.enrolled_at DESC
        `, [course_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch enrolled students" });
    }
};