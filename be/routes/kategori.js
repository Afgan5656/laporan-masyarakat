import express from 'express';
import { getAllKategori, createKategori, updateKategori, deleteKategori } from '../controllers/kategoriController.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// GET semua kategori - semua role bisa akses
router.get('/', verifyToken, getAllKategori);

// POST create kategori - hanya admin & super_admin
router.post('/', verifyToken, verifyRole(['admin', 'super_admin']), createKategori);

// PUT update kategori - hanya admin & super_admin
router.put('/:id', verifyToken, verifyRole(['admin', 'super_admin']), updateKategori);

// DELETE kategori - hanya admin & super_admin
router.delete('/:id', verifyToken, verifyRole(['admin', 'super_admin']), deleteKategori);

export default router;