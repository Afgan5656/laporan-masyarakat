'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { kategori } from '@/lib/api';

export default function KelolaKategoriPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKategori, setEditingKategori] = useState(null);
  const [namaKategori, setNamaKategori] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    if (parsedUser.role === 'user') {
      router.push('/dashboard');
      toast.error('Akses ditolak');
      return;
    }
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    try {
      const res = await kategori.getAll();
      console.log('Kategori data:', res.data);
      setKategoris(res.data);
    } catch (error) {
      console.error('Error fetch kategori:', error);
      toast.error('Gagal mengambil data kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaKategori.trim()) {
      toast.error('Nama kategori tidak boleh kosong');
      return;
    }
    
    try {
      if (editingKategori) {
        await kategori.update(editingKategori.id, { nama: namaKategori });
        toast.success('Kategori berhasil diupdate');
      } else {
        await kategori.create({ nama: namaKategori });
        toast.success('Kategori berhasil ditambahkan');
      }
      setShowModal(false);
      setEditingKategori(null);
      setNamaKategori('');
      fetchKategori();
    } catch (error) {
      console.error('Error save kategori:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus kategori ini? Kategori yang masih digunakan tidak bisa dihapus.')) {
      try {
        await kategori.delete(id);
        toast.success('Kategori dihapus');
        fetchKategori();
      } catch (error) {
        console.error('Error delete kategori:', error);
        toast.error(error.response?.data?.message || 'Gagal menghapus');
      }
    }
  };

  const handleEdit = (kat) => {
    setEditingKategori(kat);
    setNamaKategori(kat.nama);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">
            Kelola Kategori
          </h1>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Daftar Kategori</h2>
          <button
            onClick={() => {
              setEditingKategori(null);
              setNamaKategori('');
              setShowModal(true);
            }}
            className="btn-primary"
          >
            + Tambah Kategori
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {kategoris.map((kat) => (
                <tr key={kat.id}>
                  <td className="px-6 py-4">{kat.id}</td>
                  <td className="px-6 py-4">{kat.nama}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(kat)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(kat.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {kategoris.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada kategori. Silakan tambah kategori baru.
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah/Edit Kategori */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingKategori ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nama Kategori</label>
                <input
                  type="text"
                  className="input"
                  value={namaKategori}
                  onChange={(e) => setNamaKategori(e.target.value)}
                  placeholder="Contoh: Infrastruktur, Kesehatan, dll"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}