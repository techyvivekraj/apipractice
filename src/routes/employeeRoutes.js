import express from 'express';
import EmployeeController from '../controllers/employeeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../utils/validations/validate.js';
import employeeValidationRules from '../utils/validations/employeeValidation.js';

const router = express.Router();

// Get all employees
router.get('/employees', authMiddleware, EmployeeController.getEmployees);

// Get potential managers for assignment
router.get('/employees/managers', authMiddleware, EmployeeController.getManagers);

// Get employee by employee code
router.get('/employees/code/:employeeCode', authMiddleware, EmployeeController.getEmployeeByCode);

// Get single employee by ID
router.get('/employees/:id', authMiddleware, EmployeeController.getEmployeeById);

// Create employee
router.post('/employees',
  authMiddleware,
  validate(employeeValidationRules),
  EmployeeController.createEmployee
);

// Update employee
router.put('/employees/:id',
  authMiddleware,
  validate(employeeValidationRules),
  EmployeeController.updateEmployee
);

// Delete employee
router.delete('/employees/:id',
  authMiddleware,
  EmployeeController.deleteEmployee
);

export default router;
