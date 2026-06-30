import express from 'express';
import { 
  getAllLaporan, 
  getLaporanById, 
  createLaporan, 
  updateLaporan, 
  deleteLaporan, 
  updateStatus 
} from '../controllers/laporanController.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', verifyToken, getAllLaporan);
router.get('/:id', verifyToken, getLaporanById);
router.post('/', verifyToken, upload.single('image'), createLaporan);
router.put('/:id', verifyToken, updateLaporan);
router.delete('/:id', verifyToken, deleteLaporan);
router.patch('/:id/status', verifyToken, verifyRole(['admin', 'super_admin']), updateStatus);

export default router;