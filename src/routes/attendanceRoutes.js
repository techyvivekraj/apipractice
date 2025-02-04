import express from 'express';
import AttendanceController from '../controllers/attendanceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../utils/validations/validate.js';
import attendanceValidationRules from '../utils/validations/attendanceValidation.js';

const router = express.Router();

// Get attendance list (Admin, View role, and Reporting Managers)
router.get('/attendance',
  authMiddleware,
  validate(attendanceValidationRules.getAttendanceList),
  AttendanceController.getAttendanceList
);

// Mark attendance (check-in)
router.post('/attendance/check-in',
  authMiddleware,
  validate(attendanceValidationRules.markAttendance),
  AttendanceController.markAttendance
);

// Mark check-out
router.post('/attendance/:id/check-out',
  authMiddleware,
  validate(attendanceValidationRules.markCheckOut),
  AttendanceController.markCheckOut
);

// Update approval status (Admin and Reporting Managers only)
router.put('/attendance/:id/approval',
  authMiddleware,
  validate(attendanceValidationRules.updateApproval),
  AttendanceController.updateApprovalStatus
);

export default router; 