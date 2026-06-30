import db from '../config/db.js';

export const getAllLaporan = async (req, res) => {
  try {
    let query = `
      SELECT l.*, 
             u.name as user_nama, 
             c.name as kategori_nama,
             (SELECT COUNT(*) FROM comments WHERE laporan_id = l.id) as jumlah_komentar
      FROM laporan l
      JOIN users u ON l.user_id = u.id
      JOIN categories c ON l.category_id = c.id
    `;
    
    const params = [];
    
    if (req.user.role === 'user') {
      query += ' WHERE l.user_id = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY l.created_at DESC';
    
    const [laporan] = await db.query(query, params);
    res.json(laporan);
  } catch (error) {
    console.error('Error getAllLaporan:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getLaporanById = async (req, res) => {
  try {
    const [laporan] = await db.query(`
      SELECT l.*, 
             u.name as user_nama, 
             u.email as user_email, 
             c.name as kategori_nama
      FROM laporan l
      JOIN users u ON l.user_id = u.id
      JOIN categories c ON l.category_id = c.id
      WHERE l.id = ?
    `, [req.params.id]);
    
    if (laporan.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }
    
    res.json(laporan[0]);
  } catch (error) {
    console.error('Error getLaporanById:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createLaporan = async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  // Ambil data dari request
  const { title, description, category_id, waktu, lokasi } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  
  // Validasi
  if (!title) {
    return res.status(400).json({ message: 'Judul harus diisi' });
  }
  if (!description) {
    return res.status(400).json({ message: 'Deskripsi harus diisi' });
  }
  if (!category_id) {
    return res.status(400).json({ message: 'Kategori harus dipilih' });
  }
  
  try {
    const [result] = await db.query(
      'INSERT INTO laporan (user_id, category_id, title, description, waktu, lokasi, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, category_id, title, description, waktu || null, lokasi || null, image]
    );
    
    res.status(201).json({ 
      message: 'Laporan berhasil dibuat', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error createLaporan:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🔥 PERBAIKAN UTAMA: Update Laporan
export const updateLaporan = async (req, res) => {
  console.log('Update request params:', req.params);
  console.log('Update request body:', req.body);
  
  // Ambil data dari request body (frontend mengirim title, description, category_id, lokasi, waktu)
  const { title, description, category_id, lokasi, waktu, status } = req.body;
  
  // Validasi input
  if (!title) {
    return res.status(400).json({ message: 'Judul harus diisi' });
  }
  if (!description) {
    return res.status(400).json({ message: 'Deskripsi harus diisi' });
  }
  if (!category_id) {
    return res.status(400).json({ message: 'Kategori harus dipilih' });
  }
  
  try {
    // Cek apakah laporan ada
    const [laporan] = await db.query('SELECT * FROM laporan WHERE id = ?', [req.params.id]);
    if (laporan.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }
    
    // Cek permission untuk user biasa
    if (req.user.role === 'user') {
      if (laporan[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Anda hanya bisa mengedit laporan sendiri' });
      }
      if (laporan[0].status !== 'pending') {
        return res.status(403).json({ message: 'Laporan yang sudah diproses tidak bisa diedit' });
      }
    }
    
    // 🔥 UPDATE QUERY - Sesuaikan dengan field yang ada di database
    const updateQuery = `
      UPDATE laporan 
      SET title = ?, 
          description = ?, 
          category_id = ?, 
          lokasi = ?, 
          waktu = ?
      WHERE id = ?
    `;
    
    const params = [
      title, 
      description, 
      category_id, 
      lokasi || null, 
      waktu || null,
      req.params.id
    ];
    
    console.log('Update query params:', params);
    
    await db.query(updateQuery, params);
    
    // Jika ada update status (hanya untuk admin)
    if (status && req.user.role !== 'user') {
      await db.query('UPDATE laporan SET status = ? WHERE id = ?', [status, req.params.id]);
    }
    
    res.json({ 
      message: 'Laporan berhasil diupdate',
      success: true 
    });
    
  } catch (error) {
    console.error('Error updateLaporan:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteLaporan = async (req, res) => {
  try {
    const [laporan] = await db.query('SELECT * FROM laporan WHERE id = ?', [req.params.id]);
    if (laporan.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }
    
    if (req.user.role === 'user' && laporan[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda hanya bisa menghapus laporan sendiri' });
    }
    
    await db.query('DELETE FROM laporan WHERE id = ?', [req.params.id]);
    res.json({ message: 'Laporan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteLaporan:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  const { status } = req.body;
  const statusValid = ['pending', 'approved', 'rejected'];
  
  if (!statusValid.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }
  
  try {
    await db.query('UPDATE laporan SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status laporan berhasil diupdate' });
  } catch (error) {
    console.error('Error updateStatus:', error);
    res.status(500).json({ message: error.message });
  }
};