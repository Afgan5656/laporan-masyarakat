import express from 'express';
import { register, registerAdmin, login, getMe } from '../controllers/authController.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// Register untuk USER biasa (TIDAK PERLU TOKEN)
router.post('/register', register);

// Register untuk ADMIN (hanya SUPER ADMIN yang bisa)
router.post('/register/admin', verifyToken, verifyRole(['super_admin']), registerAdmin);

// Login
router.post('/login', login);

// Get profile sendiri
router.get('/me', verifyToken, getMe);

export default router;