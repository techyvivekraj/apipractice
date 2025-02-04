import express from 'express';
import SetupController from '../controllers/setupController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../utils/validations/validate.js';
import validationRules from '../utils/validations/setupValidations.js';

const router = express.Router();

// Setup status
router.get('setup/status', 
  authMiddleware,
  validate(validationRules.checkSetupStatus),
  SetupController.checkSetupStatus
);

// Department routes
router.get('departments', 
  authMiddleware, 
  SetupController.getDepartments
);

router.get('departments/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem), // reusing ID validation
  SetupController.getDepartmentById
);

router.post('departments', 
  authMiddleware, 
  validate(validationRules.createDepartment), 
  SetupController.createDepartment
);

router.put('departments/:id', 
  authMiddleware, 
  validate(validationRules.updateDepartment), 
  SetupController.updateDepartment
);

router.delete('departments/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem), 
  SetupController.deleteDepartment
);

// Designation routes
router.get('designations', 
  authMiddleware, 
  SetupController.getDesignations
);

router.get('designations/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem),
  SetupController.getDesignationById
);

router.get('departments/:departmentId/designations', 
  authMiddleware, 
  validate(validationRules.deleteItem),
  SetupController.getDesignationsByDepartment
);

router.post('designations', 
  authMiddleware, 
  validate(validationRules.createDesignation), 
  SetupController.createDesignation
);

router.put('designations/:id', 
  authMiddleware, 
  validate(validationRules.updateDesignation), 
  SetupController.updateDesignation
);

router.delete('designations/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem), 
  SetupController.deleteDesignation
);

// Shift routes
router.get('shifts', 
  authMiddleware, 
  SetupController.getShifts
);

router.get('shifts/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem),
  SetupController.getShiftById
);

router.post('shifts', 
  authMiddleware, 
  validate(validationRules.createShift), 
  SetupController.createShift
);

router.put('shifts/:id', 
  authMiddleware, 
  validate(validationRules.updateShift), 
  SetupController.updateShift
);

router.delete('shifts/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem), 
  SetupController.deleteShift
);

// Shift Assignment routes
router.get('shifts/assignments/:employeeId', 
  authMiddleware, 
  validate(validationRules.deleteItem),
  SetupController.getEmployeeShifts
);

router.post('shifts/assign', 
  authMiddleware, 
  validate(validationRules.assignShift), 
  SetupController.assignShift
);

router.delete('shifts/assignments/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem),
  SetupController.removeShiftAssignment
);

// Holiday routes
router.get('/holidays', 
  authMiddleware, 
  SetupController.getHolidays
);

router.get('/holidays/:id', 
  authMiddleware,
  validate(validationRules.deleteItem),
  SetupController.getHolidayById
);

router.post('/holidays',
  authMiddleware,
  validate(validationRules.holidayValidations.createHoliday),
  SetupController.createHoliday
);

router.put('/holidays/:id',
  authMiddleware,
  validate(validationRules.holidayValidations.updateHoliday),
  SetupController.updateHoliday
);

router.delete('/holidays/:id',
  authMiddleware,
  validate(validationRules.deleteItem),
  SetupController.deleteHoliday
);

export default router; 