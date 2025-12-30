const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// All routes here require being logged in
router.use(verifyToken);
// All routes here require Instructor role
router.use(authorizeRoles('Instructor'));

router.post('/create', courseController.createCourse);
router.post('/lesson', courseController.addLesson);
router.patch('/submit/:course_id', courseController.submitForApproval);
router.get('/my-courses', courseController.getMyCourses);
router.get('/enrolled-students/:course_id', courseController.getEnrolledStudents);
router.post('/quiz', courseController.createQuiz);
router.get('/quizzes/:course_id', courseController.getQuizzes);

module.exports = router;