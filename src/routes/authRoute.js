import express from 'express';
import AuthController from '../controllers/authController.js';
import validate from '../utils/validations/authValidations.js';

const router = express.Router();

router.post('/register', validate('register'), AuthController.register);
router.post('/login', validate('login'), AuthController.login);

export default router;