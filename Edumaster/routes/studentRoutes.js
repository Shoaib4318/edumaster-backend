const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const courseController = require('../controllers/courseController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// All routes require login
router.use(verifyToken);

router.post('/enroll', authorizeRoles('Student'), studentController.enrollInCourse);
router.post('/update-progress', authorizeRoles('Student'), studentController.updateProgress);
router.get('/courses', courseController.getAvailableCourses); // Available to all logged-in users
router.get('/enrolled-courses', authorizeRoles('Student'), courseController.getEnrolledCourses);
router.get('/lessons/:course_id', courseController.getLessons); // For enrolled students
router.get('/quizzes/:course_id', courseController.getQuizzes); // For enrolled students

module.exports = router;