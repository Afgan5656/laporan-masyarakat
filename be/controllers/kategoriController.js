import db from '../config/db.js';

export const getAllKategori = async (req, res) => {
  try {
    const [kategori] = await db.query('SELECT id, name as nama, created_at FROM categories ORDER BY id');
    res.json(kategori);
  } catch (error) {
    console.error('Error getAllKategori:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createKategori = async (req, res) => {
  const { nama } = req.body;
  
  if (!nama || nama.trim() === '') {
    return res.status(400).json({ message: 'Nama kategori tidak boleh kosong' });
  }
  
  try {
    const [existing] = await db.query('SELECT * FROM categories WHERE name = ?', [nama]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Kategori sudah ada' });
    }
    
    const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [nama]);
    res.status(201).json({ 
      message: 'Kategori berhasil dibuat',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error createKategori:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateKategori = async (req, res) => {
  const { nama } = req.body;
  const { id } = req.params;
  
  try {
    const [existing] = await db.query('SELECT * FROM categories WHERE name = ? AND id != ?', [nama, id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Kategori sudah ada' });
    }
    
    await db.query('UPDATE categories SET name = ? WHERE id = ?', [nama, id]);
    res.json({ message: 'Kategori berhasil diupdate' });
  } catch (error) {
    console.error('Error updateKategori:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteKategori = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [laporan] = await db.query('SELECT COUNT(*) as total FROM laporan WHERE category_id = ?', [id]);
    if (laporan[0].total > 0) {
      return res.status(400).json({ message: 'Kategori masih digunakan oleh laporan' });
    }
    
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteKategori:', error);
    res.status(500).json({ message: error.message });
  }
};