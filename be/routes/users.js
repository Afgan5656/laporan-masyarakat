import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// ========== ROUTE UNTUK ADMIN & SUPER ADMIN ==========
router.get('/', verifyToken, verifyRole(['admin', 'super_admin']), getAllUsers);
router.get('/:id', verifyToken, verifyRole(['admin', 'super_admin']), getUserById);
router.post('/', verifyToken, verifyRole(['admin', 'super_admin']), createUser);
router.put('/:id', verifyToken, verifyRole(['admin', 'super_admin']), updateUser);
router.delete('/:id', verifyToken, verifyRole(['admin', 'super_admin']), deleteUser);

// ========== ROUTE UNTUK PROFILE USER (SEMUA ROLE) ==========

// UPDATE profile (nama)
router.put('/profile', verifyToken, async (req, res) => {
  const { nama } = req.body;
  
  if (!nama || nama.trim() === '') {
    return res.status(400).json({ message: 'Nama tidak boleh kosong' });
  }
  
  try {
    await db.query('UPDATE users SET name = ? WHERE id = ?', [nama, req.user.id]);
    res.json({ message: 'Profil berhasil diupdate', nama });
  } catch (error) {
    console.error('Error update profile:', error);
    res.status(500).json({ message: error.message });
  }
});

// GANTI PASSWORD
router.put('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Password saat ini dan password baru harus diisi' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
  }
  
  try {
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    const isValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValid) {
      return res.status(400).json({ message: 'Password saat ini salah' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    
    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Error change password:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;