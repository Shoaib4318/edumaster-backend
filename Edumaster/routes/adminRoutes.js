const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Security: All routes below require a valid token AND Admin role
router.use(verifyToken);
router.use(authorizeRoles('Administrator'));

router.patch('/approve-instructor/:user_id', adminController.approveInstructor);
router.get('/pending-instructors', adminController.getPendingInstructors);
router.patch('/approve-course/:course_id', adminController.approveCourse);
router.get('/pending-courses', adminController.getPendingCourses);
router.post('/manage-user', adminController.toggleUserStatus);
router.get('/users', adminController.getAllUsers);

module.exports = router;