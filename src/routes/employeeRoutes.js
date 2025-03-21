import express from 'express';
import multer from 'multer';
import EmployeeController from '../controllers/employeeController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validate from '../utils/validations/validate.js';
import validationRules from '../utils/validations/employeeValidation.js';
import { ALLOWED_MIME_TYPES, UPLOAD_FIELDS } from '../config/fileUpload.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and DOC files are allowed.'));
    }
  }
});

// Configure multiple file upload fields
const uploadFields = upload.fields(UPLOAD_FIELDS);

// Employee routes
router.post('/employees',
  authMiddleware,
  uploadFields,
  validate(validationRules.addEmployee),
  EmployeeController.addEmployee
);

router.get('/employees/:id',
  authMiddleware,
  validate(validationRules.getEmployee),
  EmployeeController.getEmployee
);

router.get('/employees',
  authMiddleware,
  validate(validationRules.getEmployees),
  EmployeeController.getEmployees
);

router.put('/employees/:id',
  authMiddleware,
  uploadFields,
  validate(validationRules.updateEmployee),
  EmployeeController.updateEmployee
);

router.delete('/employees/:id',
  authMiddleware,
  validate(validationRules.deleteEmployee),
  EmployeeController.deleteEmployee
);

export default router;
