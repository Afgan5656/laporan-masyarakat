import express from 'express';
import { getKomentarByLaporan, createKomentar, deleteKomentar } from '../controllers/komentarController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/laporan/:laporanId', verifyToken, getKomentarByLaporan);
router.post('/laporan/:laporanId', verifyToken, createKomentar);
router.delete('/:id', verifyToken, deleteKomentar);

export default router;