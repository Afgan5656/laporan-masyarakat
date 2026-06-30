'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { laporan, kategori } from '@/lib/api';

export default function EditLaporanPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori_id: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [laporanRes, kategoriRes] = await Promise.all([
        laporan.getById(id),
        kategori.getAll(),
      ]);
      const laporanData = laporanRes.data;
      if (laporanData.status !== 'pending') {
        toast.error('Laporan yang sudah diproses tidak bisa diedit');
        router.push('/dashboard');
        return;
      }
      setFormData({
        judul: laporanData.judul,
        deskripsi: laporanData.deskripsi,
        kategori_id: laporanData.kategori_id,
      });
      setKategoris(kategoriRes.data);
    } catch (error) {
      toast.error('Gagal mengambil data');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await laporan.update(id, formData);
      toast.success('Laporan berhasil diupdate');
      router.push(`/laporan/${id}`);
    } catch (error) {
      toast.error('Gagal mengupdate laporan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-6">
        <Link href={`/laporan/${id}`} className="text-blue-600 hover:underline mb-4 inline-block">
          ← Kembali
        </Link>
        
        <div className="card">
          <h1 className="text-2xl font-bold mb-6">Edit Laporan</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Judul</label>
              <input
                type="text"
                className="input"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Kategori</label>
              <select
                className="input"
                value={formData.kategori_id}
                onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                required
              >
                <option value="">Pilih Kategori</option>
                {kategoris.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Deskripsi</label>
              <textarea
                className="input"
                rows="6"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">
                Simpan Perubahan
              </button>
              <Link href={`/laporan/${id}`} className="btn-secondary flex-1 text-center">
                Batal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}