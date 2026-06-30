'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { laporan, kategori } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [laporans, setLaporans] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('daftar');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLaporan, setEditingLaporan] = useState(null);
  const [filterStatus, setFilterStatus] = useState('semua');
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori_id: '',
    waktu: '',
    lokasi: '',
    gambar: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [laporanRes, kategoriRes] = await Promise.all([
        laporan.getAll(),
        kategori.getAll(),
      ]);
      setLaporans(laporanRes.data || []);
      setKategoris(kategoriRes.data || []);
    } catch (error) {
      console.error('Error fetchData:', error);
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
    toast.success('Logout berhasil');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5 MB');
        return;
      }
      setFormData({ ...formData, gambar: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.judul.trim()) {
      toast.error('Judul tidak boleh kosong');
      return;
    }
    if (!formData.deskripsi.trim()) {
      toast.error('Deskripsi tidak boleh kosong');
      return;
    }
    if (!formData.kategori_id) {
      toast.error('Silakan pilih kategori');
      return;
    }
    
    setSubmitting(true);
    try {
      await laporan.create(formData);
      toast.success('Laporan berhasil dibuat!');
      setFormData({ 
        judul: '', 
        deskripsi: '', 
        kategori_id: '', 
        waktu: '', 
        lokasi: '', 
        gambar: null 
      });
      setPreviewImage(null);
      setActivePage('daftar');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat laporan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingLaporan) return;
    
    try {
      await laporan.update(editingLaporan.id, {
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        kategori_id: formData.kategori_id,
        waktu: formData.waktu,
        lokasi: formData.lokasi,
      });
      toast.success('Laporan berhasil diupdate');
      setShowEditModal(false);
      setEditingLaporan(null);
      setFormData({ 
        judul: '', 
        deskripsi: '', 
        kategori_id: '', 
        waktu: '', 
        lokasi: '', 
        gambar: null 
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengupdate laporan');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus laporan ini?')) {
      try {
        await laporan.delete(id);
        toast.success('Laporan dihapus');
        fetchData();
      } catch (error) {
        toast.error('Gagal menghapus');
      }
    }
  };

  const handleEdit = (laporanItem) => {
    setEditingLaporan(laporanItem);
    setFormData({
      judul: laporanItem.title,
      deskripsi: laporanItem.description,
      kategori_id: laporanItem.category_id,
      waktu: laporanItem.waktu ? laporanItem.waktu.slice(0, 16) : '',
      lokasi: laporanItem.lokasi || '',
      gambar: null,
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-rose-100 text-rose-700',
    };
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const totalLaporan = laporans.length;
  const pendingCount = laporans.filter(l => l.status === 'pending').length;
  const approvedCount = laporans.filter(l => l.status === 'approved').length;
  const rejectedCount = laporans.filter(l => l.status === 'rejected').length;

  const filteredLaporans = laporans.filter(laporanItem => {
    if (filterStatus === 'semua') return true;
    return laporanItem.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Sidebar Modern - Logo di Atas */}
      <aside className="fixed left-0 top-0 h-full w-80 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-purple-100 z-30">
        
        {/* Logo Section - DI ATAS */}
        <div className="p-6 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">LP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                LaporPak
              </h1>
              <p className="text-xs text-gray-400">Sistem Pengaduan Masyarakat</p>
            </div>
          </div>
        </div>

        {/* Profile Section - DI BAWAH LOGO */}
        <div className="p-5 border-b border-purple-100 bg-gradient-to-br from-purple-50/50 to-indigo-50/50">
          <div className="flex items-center gap-4">
            {/* Avatar dengan efek glow */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-400 blur-md opacity-50"></div>
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg ring-3 ring-white">
                {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-base">{user?.nama || user?.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  user?.role === 'admin' ? 'bg-blue-100 text-blue-600' :
                  user?.role === 'super_admin' ? 'bg-purple-100 text-purple-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'super_admin' ? 'Super Admin' : 'User'}
                </span>
                <span className="text-xs text-gray-400 truncate max-w-[120px]">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="mt-4 px-4 space-y-1">
          {/* Dashboard */}
          <button
            onClick={() => setActivePage('daftar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activePage === 'daftar' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200' 
                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Dashboard</span>
          </button>

          {/* Riwayat Laporan */}
          <button
            onClick={() => setActivePage('riwayat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activePage === 'riwayat' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200' 
                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Riwayat Laporan</span>
          </button>

          {/* Profil Saya */}
          <Link
            href="/profile"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Profil Saya</span>
          </Link>
          
          {/* Tambah Laporan */}
          {user?.role === 'user' && (
            <button
              onClick={() => setActivePage('tambah')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activePage === 'tambah' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200' 
                  : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Tambah Laporan</span>
            </button>
          )}

          {/* Logout Button */}
          <div className="pt-4 mt-4 border-t border-purple-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-80 p-8">
        {/* HALAMAN DAFTAR LAPORAN */}
        {activePage === 'daftar' && (
          <>
            {/* Welcome Banner */}
            <div className="mb-8 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    welcome, <span className="text-purple-600">{user?.nama || user?.name}</span>
                  </h2>
                  <p className="text-gray-500 mt-1">Selamat datang di platform pengaduan masyarakat</p>
                </div>
                <div className="text-4xl">👋</div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
              <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 border-l-4 border-purple-500 hover:scale-105">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Total Laporan</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{totalLaporan}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <svg className="w-5 h-5 text-purple-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-green-500 text-xs mt-3">+3 dari bulan lalu</p>
              </div>
              
              <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 border-l-4 border-amber-400 hover:scale-105">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{pendingCount}</p>
                  <p className="text-amber-500 text-xs mt-3">Menunggu review</p>
                </div>
              </div>
              
              <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 border-l-4 border-emerald-400 hover:scale-105">
                <div>
                  <p className="text-gray-400 text-sm">Approved</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{approvedCount}</p>
                  <p className="text-emerald-500 text-xs mt-3">Laporan disetujui</p>
                </div>
              </div>
              
              <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 border-l-4 border-rose-400 hover:scale-105">
                <div>
                  <p className="text-gray-400 text-sm">Rejected</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{rejectedCount}</p>
                  <p className="text-rose-500 text-xs mt-3">Laporan ditolak</p>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-1 mb-6 inline-flex gap-1">
              {['semua', 'approved', 'rejected', 'pending'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterStatus === status 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                      : 'text-gray-500 hover:text-purple-600'
                  }`}
                >
                  {status === 'semua' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Laporan List */}
            <div className="space-y-4">
              {filteredLaporans.length > 0 ? (
                filteredLaporans.map((item) => (
                  <div key={item.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.01]">
                    <div className="flex">
                      {item.image ? (
                        <div className="w-32 h-32 flex-shrink-0 m-4 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                          <img
                            src={`http://localhost:5000${item.image}`}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 flex-shrink-0 m-4 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                          <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex-1 p-5">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                              {getStatusBadge(item.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 flex-wrap">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                                </svg>
                                {item.kategori_nama}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(item.created_at).toLocaleDateString('id-ID')}
                              </span>
                              {item.lokasi && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    {item.lokasi}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link
                              href={`/laporan/${item.id}`}
                              className="px-3 py-1.5 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                            >
                              Detail
                            </Link>
                            {user?.role === 'user' && item.user_id === user?.id && item.status === 'pending' && (
                              <button
                                onClick={() => handleEdit(item)}
                                className="px-3 py-1.5 text-sm text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
                              >
                                Edit
                              </button>
                            )}
                            {user?.role === 'user' && item.user_id === user?.id && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-3 py-1.5 text-sm text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Belum ada laporan</p>
                  {user?.role === 'user' && (
                    <button
                      onClick={() => setActivePage('tambah')}
                      className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      + Buat laporan pertama Anda
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* HALAMAN RIWAYAT LAPORAN */}
        {activePage === 'riwayat' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Riwayat Laporan
              </h2>
              <p className="text-gray-500 mt-1">Laporan yang sudah diproses oleh admin</p>
            </div>

            {laporans.filter(l => l.status === 'approved' || l.status === 'rejected').length > 0 ? (
              <div className="space-y-4">
                {laporans.filter(l => l.status === 'approved' || l.status === 'rejected').map((item) => (
                  <div key={item.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.01]">
                    <div className="flex">
                      {item.image ? (
                        <div className="w-32 h-32 flex-shrink-0 m-4 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                          <img
                            src={`http://localhost:5000${item.image}`}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 flex-shrink-0 m-4 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                          <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex-1 p-5">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                              {getStatusBadge(item.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 flex-wrap">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                                </svg>
                                {item.kategori_nama}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(item.created_at).toLocaleDateString('id-ID')}
                              </span>
                              {item.lokasi && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    {item.lokasi}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link
                              href={`/laporan/${item.id}`}
                              className="px-3 py-1.5 text-sm text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                            >
                              Detail
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">Belum ada riwayat laporan</p>
                <p className="text-sm text-gray-400 mt-1">Laporan yang sudah diproses akan muncul di sini</p>
              </div>
            )}
          </>
        )}

        {/* HALAMAN TAMBAH LAPORAN */}
        {activePage === 'tambah' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Tambah Laporan
              </h2>
              <p className="text-gray-500 mt-2">Sampaikan keluhan Anda dengan jelas dan lengkap</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                <h3 className="text-white font-semibold text-lg">Form Laporan Baru</h3>
                <p className="text-purple-200 text-sm">Isi data berikut dengan benar</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Judul Laporan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Contoh: Jalan rusak di depan sekolah"
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                    rows="5"
                    placeholder="Deskripsikan masalah secara detail..."
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Waktu Kejadian
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    value={formData.waktu}
                    onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lokasi Kejadian
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Contoh: Depok, Jawa Barat"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Foto Pendukung
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-400 transition cursor-pointer bg-gray-50/50"
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    {previewImage ? (
                      <div className="space-y-3">
                        <img src={previewImage} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                        <p className="text-sm text-green-600">File siap diupload</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(null);
                            setFormData({ ...formData, gambar: null });
                          }}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500">Klik untuk Upload</p>
                        <p className="text-xs text-gray-400">Maksimal 5 MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </span>
                    ) : (
                      'Kirim Laporan'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('daftar');
                      setFormData({ 
                        judul: '', 
                        deskripsi: '', 
                        kategori_id: '', 
                        waktu: '', 
                        lokasi: '', 
                        gambar: null 
                      });
                      setPreviewImage(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Modal Edit Laporan */}
      {showEditModal && editingLaporan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Laporan</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Laporan</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Waktu Kejadian</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.waktu}
                  onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi Kejadian</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Contoh: Depok, Jawa Barat"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition">
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLaporan(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
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