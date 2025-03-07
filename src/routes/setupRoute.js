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
router.get('/departments', 
  authMiddleware, 
  SetupController.getDepartments
);

router.get('/departments/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem), // reusing ID validation
  SetupController.getDepartmentById
);

router.post('/departments', 
  authMiddleware, 
  validate(validationRules.createDepartment), 
  SetupController.createDepartment
);

router.put('/departments/:id', 
  authMiddleware, 
  validate(validationRules.updateDepartment), 
  SetupController.updateDepartment
);

router.delete('/departments/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem), 
  SetupController.deleteDepartment
);

// Designation routes
router.get('/roles', 
  authMiddleware, 
  SetupController.getDesignations
);

router.get('/roles/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem),
  SetupController.getDesignationById
);

router.get('/departments/:departmentId/roles', 
  authMiddleware, 
  validate(validationRules.deleteItem),
  SetupController.getDesignationsByDepartment
);

router.post('/roles', 
  authMiddleware, 
  validate(validationRules.createDesignation), 
  SetupController.createDesignation
);

router.put('/roles/:id', 
  authMiddleware, 
  validate(validationRules.updateDesignation), 
  SetupController.updateDesignation
);

router.delete('/roles/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem), 
  SetupController.deleteDesignation
);

// Shift routes
router.get('/shifts', 
  authMiddleware, 
  SetupController.getShifts
);

router.get('/shifts/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem),
  SetupController.getShiftById
);

router.post('/shifts', 
  authMiddleware, 
  validate(validationRules.createShift), 
  SetupController.createShift
);

router.put('/shifts/:id', 
  authMiddleware, 
  validate(validationRules.updateShift), 
  SetupController.updateShift
);

router.delete('/shifts/:id', 
  authMiddleware, 
  validate(validationRules.deleteItem), 
  SetupController.deleteShift
);

// Shift Assignment routes
router.get('/shifts/assignments/:employeeId', 
  authMiddleware, 
  validate(validationRules.deleteItem),
  SetupController.getEmployeeShifts
);

router.post('/shifts/assign', 
  authMiddleware, 
  validate(validationRules.assignShift), 
  SetupController.assignShift
);

router.delete('/shifts/assignments/:id', 
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

// Asset routes
router.get('/assets', 
  authMiddleware, 
  SetupController.getAssets
);

router.get('/assets/:id', 
  authMiddleware,
  validate(validationRules.deleteItem),
  SetupController.getAssetById
);

router.get('/employees/:employeeId/assets', 
  authMiddleware,
  validate(validationRules.deleteItem),
  SetupController.getEmployeeAssets
);

router.post('/assets',
  authMiddleware,
  validate(validationRules.assetValidations.createAsset),
  SetupController.createAsset
);

router.put('/assets/:id',
  authMiddleware,
  validate(validationRules.assetValidations.updateAsset),
  SetupController.updateAsset
);

router.delete('/assets/:id',
  authMiddleware,
  validate(validationRules.deleteItem),
  SetupController.deleteAsset
);

export default router; 