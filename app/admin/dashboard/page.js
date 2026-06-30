'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { laporan, kategori } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [laporans, setLaporans] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showKategoriModal, setShowKategoriModal] = useState(false);
  const [editingKategori, setEditingKategori] = useState(null);
  const [namaKategori, setNamaKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');

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
      return;
    }
    if (parsedUser.role === 'super_admin') {
      router.push('/admin/users');
      return;
    }
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

  const handleUpdateStatus = async (id, status) => {
    try {
      await laporan.updateStatus(id, status);
      toast.success(`Status laporan diubah menjadi ${status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}`);
      fetchData();
      setShowStatusModal(false);
      setSelectedLaporan(null);
    } catch (error) {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDeleteLaporan = async (id) => {
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

  const handleSubmitKategori = async (e) => {
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
      setShowKategoriModal(false);
      setEditingKategori(null);
      setNamaKategori('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDeleteKategori = async (id) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      try {
        await kategori.delete(id);
        toast.success('Kategori dihapus');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menghapus');
      }
    }
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
  
  const processedCount = approvedCount + rejectedCount;
  const processedPercentage = totalLaporan > 0 ? Math.round((processedCount / totalLaporan) * 100) : 0;
  const pendingPercentage = totalLaporan > 0 ? Math.round((pendingCount / totalLaporan) * 100) : 0;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
    toast.success('Logout berhasil');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar Super Premium */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-sm shadow-2xl border-r border-slate-200 z-30">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-md opacity-60"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">LP</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                LaporPak
              </h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>
        
        {/* Mini Stats di Sidebar */}
        <div className="mx-4 mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-600">Total Laporan</span>
            <span className="text-lg font-bold text-blue-600">{totalLaporan}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-600">Pending Review</span>
            <span className="text-lg font-bold text-amber-500">{pendingCount}</span>
          </div>
          <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${processedPercentage}%` }}></div>
          </div>
        </div>
        
        <nav className="mt-4 px-4 space-y-1">
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeMenu === 'dashboard' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveMenu('kelola-laporan')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeMenu === 'kelola-laporan' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">Kelola Laporan</span>
          </button>
          
          <button
            onClick={() => setActiveMenu('riwayat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeMenu === 'riwayat' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Riwayat Laporan</span>
          </button>
          
          <button
            onClick={() => setActiveMenu('kategori')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeMenu === 'kategori' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </svg>
            <span className="font-medium">Kelola Kategori</span>
          </button>
        </nav>
        
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                {user?.nama?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">{user?.nama || user?.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 p-8">
        {/* MENU DASHBOARD */}
        {activeMenu === 'dashboard' && (
          <>
            {/* Hero Welcome Section */}
            <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">👋</span>
                  <h2 className="text-2xl font-bold">Welcome back, {user?.nama || user?.name}!</h2>
                </div>
                <p className="text-blue-100">Berikut adalah ringkasan laporan masyarakat yang perlu ditindaklanjuti.</p>
                <div className="mt-4 flex gap-2">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">📊 Real-time</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">📈 Statistika</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">✅ Akurat</span>
                </div>
              </div>
            </div>

            {/* Stats Cards Super Premium */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm">Total Laporan</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">{totalLaporan}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                      <svg className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    <span className="text-emerald-500 text-xs font-medium">↑ 12%</span>
                    <span className="text-slate-400 text-xs">dari bulan lalu</span>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm">Pending Review</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">{pendingCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
                      <svg className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-amber-500 text-xs font-medium">{pendingPercentage}% dari total</span>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm">Approved</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">{approvedCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300">
                      <svg className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-emerald-500 text-xs font-medium">Laporan disetujui</span>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm">Rejected</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">{rejectedCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center group-hover:bg-rose-500 transition-colors duration-300">
                      <svg className="w-6 h-6 text-rose-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-rose-500 text-xs font-medium">Laporan ditolak</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Analytics Premium Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">📊 Statistik Penanganan Laporan</h3>
                  <p className="text-sm text-slate-400 mt-1">Visualisasi progress penanganan laporan masyarakat</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-4 py-2">
                  <span className="text-sm font-medium text-blue-600">Total: {totalLaporan} laporan</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Progress Diproses */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-slate-700">Sudah Diproses</span>
                    </div>
                    <span className="text-3xl font-bold text-emerald-600">{processedPercentage}%</span>
                  </div>
                  <div className="relative h-3 bg-emerald-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                      style={{ width: `${processedPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-3 text-sm">
                    <span className="text-emerald-600">✅ {approvedCount} Disetujui</span>
                    <span className="text-rose-500">❌ {rejectedCount} Ditolak</span>
                  </div>
                </div>
                
                {/* Progress Pending */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-slate-700">Menunggu Review</span>
                    </div>
                    <span className="text-3xl font-bold text-amber-600">{pendingPercentage}%</span>
                  </div>
                  <div className="relative h-3 bg-amber-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-1000"
                      style={{ width: `${pendingPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-500 mt-3">⏳ {pendingCount} laporan perlu direview</p>
                </div>
              </div>
              
              {/* Ringkasan Angka dengan Ikon */}
              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center group cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{totalLaporan}</p>
                  <p className="text-xs text-slate-400">Total</p>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
                  <p className="text-xs text-slate-400">Approved</p>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-rose-600">{rejectedCount}</p>
                  <p className="text-xs text-slate-400">Rejected</p>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                  <p className="text-xs text-slate-400">Pending</p>
                </div>
              </div>
            </div>

            {/* Laporan Terbaru Premium */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">📋 Laporan Terbaru</h3>
                    <p className="text-sm text-slate-400 mt-1">5 laporan terakhir yang masuk</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Urut berdasarkan terbaru</span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="divide-y">
                {laporans.slice(0, 5).map((item, idx) => (
                  <div key={item.id} className="p-5 hover:bg-slate-50 transition-all duration-200 group">
                    {/* Image Thumbnail */}
                    {item.image && (
                      <div className="mb-3 rounded-lg overflow-hidden h-32 bg-slate-100">
                        <img
                          src={`http://localhost:5000${item.image}`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">#{idx + 1}</span>
                          <p className="font-semibold text-slate-800">{item.title}</p>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="flex gap-4 text-sm text-slate-400 mt-2 ml-0">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                            </svg>
                            {item.kategori_nama}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {item.user_nama}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </span>
                          {item.lokasi && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {item.lokasi}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* <button
                        // onClick={() => {
                        //   setSelectedLaporan(item);
                        //   setShowStatusModal(true);
                        // }}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                      >
                        Review →
                      </button> */}
                    </div>
                  </div>
                ))}
                {laporans.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">Belum ada laporan</p>
                    <p className="text-sm text-slate-400 mt-1">Laporan akan muncul di sini setelah masyarakat melapor</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* MENU KELOLA LAPORAN */}
        {activeMenu === 'kelola-laporan' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Kelola Laporan
              </h2>
              <p className="text-slate-500 mt-1">Approve atau reject laporan masyarakat</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition">
                <p className="text-blue-100 text-sm">Total Laporan</p>
                <p className="text-3xl font-bold mt-2">{totalLaporan}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition">
                <p className="text-amber-100 text-sm">Pending</p>
                <p className="text-3xl font-bold mt-2">{pendingCount}</p>
                <p className="text-amber-200 text-xs mt-1">Menunggu review</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition">
                <p className="text-emerald-100 text-sm">Approved</p>
                <p className="text-3xl font-bold mt-2">{approvedCount}</p>
              </div>
              <div className="bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition">
                <p className="text-rose-100 text-sm">Rejected</p>
                <p className="text-3xl font-bold mt-2">{rejectedCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-white">
                <h3 className="text-lg font-semibold text-slate-800">Laporan Menunggu Review ({pendingCount})</h3>
                <p className="text-sm text-slate-400 mt-1">Klik Review untuk approve atau reject laporan</p>
              </div>
              <div className="divide-y">
                {laporans.filter(l => l.status === 'pending').map((item) => (
                  <div key={item.id} className="p-6 hover:bg-slate-50 transition-all duration-200">
                    <div className="flex gap-4">
                      {/* Image Thumbnail */}
                      {item.image && (
                        <div className="flex-shrink-0 rounded-lg overflow-hidden h-32 w-32 bg-slate-100">
                          <img
                            src={`http://localhost:5000${item.image}`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                      <div className="flex-1 flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{item.title}</h4>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-1">
                            <span className="flex items-center gap-1">📁 {item.kategori_nama}</span>
                            <span className="flex items-center gap-1">👤 {item.user_nama}</span>
                            <span className="flex items-center gap-1">📅 {new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                            {item.lokasi && <span className="flex items-center gap-1">📍 {item.lokasi}</span>}
                          </div>
                          <p className="text-slate-600 mt-2 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => {
                              setSelectedLaporan(item);
                              setShowStatusModal(true);
                            }}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition shadow-md"
                          >
                            Review
                          </button>
                          <Link
                            href={`/laporan/${item.id}`}
                            className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition shadow-md"
                          >
                            Detail
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingCount === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">Tidak ada laporan pending</p>
                    <p className="text-sm text-slate-400 mt-1">Semua laporan sudah direview</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* MENU RIWAYAT LAPORAN */}
        {activeMenu === 'riwayat' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Riwayat Laporan
              </h2>
              <p className="text-slate-500 mt-1">Laporan yang sudah diproses (Approved / Rejected)</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-3 border-b bg-gradient-to-r from-slate-50 to-white flex gap-2">
                <button
                  onClick={() => setFilterStatus('semua')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === 'semua' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterStatus('approved')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === 'approved' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setFilterStatus('rejected')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === 'rejected' 
                      ? 'bg-rose-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Rejected
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Gambar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Laporan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pelapor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {laporans
                      .filter(l => l.status !== 'pending' && (filterStatus === 'semua' || l.status === filterStatus))
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            {item.image ? (
                              <img
                                src={`http://localhost:5000${item.image}`}
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                                No Image
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-800">{item.title}</div>
                            <div className="text-sm text-slate-400 truncate max-w-xs">{item.description}</div>
                          </td>
                          <td className="px-6 py-4 text-sm">{item.kategori_nama}</td>
                          <td className="px-6 py-4 text-sm">{item.user_nama}</td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                           </td>
                          <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                          <td className="px-6 py-4">
                            <Link href={`/laporan/${item.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
                              Detail <span>→</span>
                            </Link>
                           </td>
                          </tr>
                      ))}
                  </tbody>
                </table>
                {laporans.filter(l => l.status !== 'pending' && (filterStatus === 'semua' || l.status === filterStatus)).length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">Belum ada riwayat laporan</p>
                    <p className="text-sm text-slate-400 mt-1">Laporan yang sudah diproses akan muncul di sini</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* MENU KELOLA KATEGORI */}
        {activeMenu === 'kategori' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Kelola Kategori
              </h2>
              <p className="text-slate-500 mt-1">Tambah, edit, atau hapus kategori laporan</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                <h3 className="text-lg font-semibold text-slate-800">Daftar Kategori</h3>
                <button
                  onClick={() => {
                    setEditingKategori(null);
                    setNamaKategori('');
                    setShowKategoriModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 transition flex items-center gap-2 shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Kategori
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {kategoris.map((kat) => (
                      <tr key={kat.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-mono text-slate-500">#{kat.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{kat.nama}</td>
                        <td className="px-6 py-4 flex gap-3">
                          <button
                            onClick={() => {
                              setEditingKategori(kat);
                              setNamaKategori(kat.nama);
                              setShowKategoriModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteKategori(kat.id)}
                            className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
                {kategoris.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">Belum ada kategori</p>
                    <p className="text-sm text-slate-400 mt-1">Klik tombol + Tambah Kategori untuk menambahkan</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal Review Status */}
      {showStatusModal && selectedLaporan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Review Laporan</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-slate-500">Judul</p>
              <p className="font-semibold text-slate-800">{selectedLaporan.title}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-slate-500">Deskripsi</p>
              <p className="text-slate-600 max-h-32 overflow-y-auto">{selectedLaporan.description}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleUpdateStatus(selectedLaporan.id, 'approved')}
                className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl hover:bg-emerald-600 transition flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedLaporan.id, 'rejected')}
                className="flex-1 bg-rose-500 text-white py-2.5 rounded-xl hover:bg-rose-600 transition flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl hover:bg-slate-200 transition font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kategori */}
      {showKategoriModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md transform animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 text-slate-800">
              {editingKategori ? 'Edit Kategori' : 'Tambah Kategori'}
            </h3>
            <form onSubmit={handleSubmitKategori}>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                placeholder="Nama kategori"
                value={namaKategori}
                onChange={(e) => setNamaKategori(e.target.value)}
                required
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-medium hover:from-blue-700 transition">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowKategoriModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-medium hover:bg-slate-200 transition"
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