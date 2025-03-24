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

// Mark check-in
router.post('/attendance/check-in',
    authMiddleware,
    validate(attendanceValidationRules.markCheckIn),
    AttendanceController.markCheckIn
);

// Mark check-out
router.post('/attendance/:id/check-out',
    authMiddleware,
    validate(attendanceValidationRules.markCheckOut),
    AttendanceController.markCheckOut
);

// Update approval status
router.put('/attendance/:id/approval',
    authMiddleware,
    validate(attendanceValidationRules.updateApprovalStatus),
    AttendanceController.updateApprovalStatus
);

export default router; 