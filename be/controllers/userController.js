import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res) => {
  try {
    let query = 'SELECT id, email, name as nama, role, created_at FROM users';
    
    if (req.user.role !== 'super_admin') {
      query += ' WHERE role != "super_admin"';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [users] = await db.query(query);
    res.json(users);
  } catch (error) {
    console.error('Error getAllUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, name as nama, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error getUserById:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  const { email, password, nama, role } = req.body;
  
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'user';
    
    await db.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, nama, userRole]
    );
    
    res.status(201).json({ message: 'User berhasil dibuat' });
  } catch (error) {
    console.error('Error createUser:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { nama, role } = req.body;
  
  try {
    await db.query('UPDATE users SET name = ?, role = ? WHERE id = ?', [nama, role, req.params.id]);
    res.json({ message: 'User berhasil diupdate' });
  } catch (error) {
    console.error('Error updateUser:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteUser:', error);
    res.status(500).json({ message: error.message });
  }
};