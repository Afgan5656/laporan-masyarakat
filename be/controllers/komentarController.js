import db from '../config/db.js';

export const getKomentarByLaporan = async (req, res) => {
  try {
    const [komentar] = await db.query(`
      SELECT c.*, u.name as user_nama, u.id as user_id
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.laporan_id = ?
      ORDER BY c.created_at ASC
    `, [req.params.laporanId]);
    
    res.json(komentar);
  } catch (error) {
    console.error('Error getKomentarByLaporan:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createKomentar = async (req, res) => {
  const { comment } = req.body;
  
  try {
    const [laporan] = await db.query('SELECT id FROM laporan WHERE id = ?', [req.params.laporanId]);
    if (laporan.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }
    
    const [result] = await db.query(
      'INSERT INTO comments (laporan_id, user_id, comment) VALUES (?, ?, ?)',
      [req.params.laporanId, req.user.id, comment]
    );
    
    res.status(201).json({ 
      message: 'Komentar berhasil ditambahkan',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error createKomentar:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteKomentar = async (req, res) => {
  try {
    await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteKomentar:', error);
    res.status(500).json({ message: error.message });
  }
};