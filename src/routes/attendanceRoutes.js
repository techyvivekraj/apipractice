import express from 'express';
import AttendanceController from '../controllers/attendanceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../utils/validations/validate.js';
import attendanceValidationRules from '../utils/validations/attendanceValidation.js';

const router = express.Router();

// Get attendance list
router.get('/attendance',
    authMiddleware,
    validate(attendanceValidationRules.getAttendanceList),
    AttendanceController.getAttendanceList
);


export default router; 