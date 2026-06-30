'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { laporan, kategori, users } from '@/lib/api';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [laporans, setLaporans] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showKategoriModal, setShowKategoriModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingKategori, setEditingKategori] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [namaKategori, setNamaKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    nama: '',
    role: 'user',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (parsedUser.role !== 'super_admin') {
      toast.error('Akses ditolak. Hanya Super Admin yang bisa mengakses halaman ini');
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [laporanRes, kategoriRes, usersRes] = await Promise.all([
        laporan.getAll(),
        kategori.getAll(),
        users.getAll(),
      ]);
      setLaporans(laporanRes.data || []);
      setKategoris(kategoriRes.data || []);
      setUsersList(usersRes.data || []);
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

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await users.update(editingUser.id, {
          nama: userForm.nama,
          role: userForm.role,
        });
        toast.success('User berhasil diupdate');
      } else {
        await users.create(userForm);
        toast.success('User berhasil ditambahkan');
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ email: '', password: '', nama: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan user');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await users.getAll();
      setUsersList(res.data);
    } catch (error) {
      toast.error('Gagal mengambil data user');
    }
  };

  const handleDeleteUser = async (id, role) => {
    if (role === 'super_admin') {
      toast.error('Tidak bisa menghapus super admin');
      return;
    }
    if (confirm('Yakin ingin menghapus user ini?')) {
      try {
        await users.delete(id);
        toast.success('User dihapus');
        fetchUsers();
      } catch (error) {
        toast.error('Gagal menghapus');
      }
    }
  };

  const handleEditUser = (userItem) => {
    setEditingUser(userItem);
    setUserForm({
      email: userItem.email,
      password: '',
      nama: userItem.nama,
      role: userItem.role,
    });
    setShowUserModal(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800',
    };
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      user: 'User',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[role]}`}>
        {labels[role]}
      </span>
    );
  };

  const totalLaporan = laporans.length;
  const pendingCount = laporans.filter(l => l.status === 'pending').length;
  const approvedCount = laporans.filter(l => l.status === 'approved').length;
  const rejectedCount = laporans.filter(l => l.status === 'rejected').length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
    toast.success('Logout berhasil');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h1 className=" text-2xl font-bold text-blue-600">LaporPak</h1>
          <p className="text-sm text-gray-500 mt-1">Super Admin Panel</p>
        </div>
        
        <nav className="mt-6">
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center px-6 py-3 text-left transition ${
              activeMenu === 'dashboard' 
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveMenu('kelola-laporan')}
            className={`w-full flex items-center px-6 py-3 text-left transition ${
              activeMenu === 'kelola-laporan' 
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Kelola Laporan
          </button>
          
          <button
            onClick={() => setActiveMenu('riwayat')}
            className={`w-full flex items-center px-6 py-3 text-left transition ${
              activeMenu === 'riwayat' 
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Riwayat Laporan
          </button>
          
          <button
            onClick={() => setActiveMenu('kategori')}
            className={`w-full flex items-center px-6 py-3 text-left transition ${
              activeMenu === 'kategori' 
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </svg>
            Kelola Kategori
          </button>
          
          <button
            onClick={() => setActiveMenu('kelola-user')}
            className={`w-full flex items-center px-6 py-3 text-left transition ${
              activeMenu === 'kelola-user' 
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Kelola User
          </button>
        </nav>
        
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.nama}</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.nama}
          </h2>
          <p className="text-gray-500 mt-1">Kelola laporan, kategori, dan user masyarakat</p>
        </div>

        {/* DASHBOARD MENU */}
        {activeMenu === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
                <p className="text-gray-500 text-sm">Total Laporan</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalLaporan}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
                <p className="text-gray-400 text-xs mt-1">Menunggu review</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
                <p className="text-gray-500 text-sm">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{approvedCount}</p>
                <p className="text-gray-400 text-xs mt-1">Laporan disetujui</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
                <p className="text-gray-500 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{rejectedCount}</p>
                <p className="text-gray-400 text-xs mt-1">Laporan ditolak</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-gray-800">Laporan Terbaru</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {laporans.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.user_nama} • {item.kategori_nama}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
                {laporans.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Belum ada laporan</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* KELOLA LAPORAN MENU */}
        {activeMenu === 'kelola-laporan' && (
          <div className="bg-white rounded-lg shadow border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-gray-800">Kelola Laporan</h3>
              <p className="text-sm text-gray-500 mt-1">Approve atau reject laporan masyarakat</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Laporan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelapor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {laporans.filter(l => l.status === 'pending').map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{item.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.kategori_nama}</td>
                      <td className="px-6 py-4 text-gray-600">{item.user_nama}</td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedLaporan(item);
                            setShowStatusModal(true);
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'rejected')}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Reject
                        </button>
                        <Link href={`/laporan/${item.id}`} className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {laporans.filter(l => l.status === 'pending').length === 0 && (
                <div className="text-center py-8 text-gray-500">Tidak ada laporan pending</div>
              )}
            </div>
          </div>
        )}

        {/* RIWAYAT LAPORAN MENU */}
        {activeMenu === 'riwayat' && (
          <div className="bg-white rounded-lg shadow border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-gray-800">Riwayat Laporan</h3>
              <p className="text-sm text-gray-500 mt-1">Laporan yang sudah diproses</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Laporan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelapor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {laporans.filter(l => l.status !== 'pending').map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{item.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.kategori_nama}</td>
                      <td className="px-6 py-4 text-gray-600">{item.user_nama}</td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4">
                        <Link href={`/laporan/${item.id}`} className="text-blue-600 hover:underline text-sm">
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {laporans.filter(l => l.status !== 'pending').length === 0 && (
                <div className="text-center py-8 text-gray-500">Belum ada riwayat laporan</div>
              )}
            </div>
          </div>
        )}

        {/* KELOLA KATEGORI MENU */}
        {activeMenu === 'kategori' && (
          <div className="bg-white rounded-lg shadow border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Daftar Kategori</h3>
              <button
                onClick={() => {
                  setEditingKategori(null);
                  setNamaKategori('');
                  setShowKategoriModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                + Tambah Kategori
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kategoris.map((kat) => (
                  <tr key={kat.id}>
                    <td className="px-6 py-4 text-sm text-gray-600">{kat.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{kat.nama}</td>
                    <td className="px-6 py-4 flex gap-3">
                      <button
                        onClick={() => {
                          setEditingKategori(kat);
                          setNamaKategori(kat.nama);
                          setShowKategoriModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteKategori(kat.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {kategoris.length === 0 && (
              <div className="text-center py-8 text-gray-500">Belum ada kategori</div>
            )}
          </div>
        )}

        {/* KELOLA USER MENU */}
        {activeMenu === 'kelola-user' && (
          <div className="bg-white rounded-lg shadow border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Kelola User</h3>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({ email: '', password: '', nama: '', role: 'user' });
                  setShowUserModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                + Buat User
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 font-medium text-gray-800">{u.nama}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4">
                      {u.role !== 'super_admin' && (
                        <div className="flex gap-3">
                          <button onClick={() => handleEditUser(u)} className="text-blue-600 hover:text-blue-800 text-sm">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteUser(u.id, u.role)} className="text-red-600 hover:text-red-800 text-sm">
                            Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Review Status */}
      {showStatusModal && selectedLaporan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Review Laporan</h3>
            <p className="font-semibold text-gray-800 mb-2">{selectedLaporan.title}</p>
            <p className="text-gray-600 mb-6">{selectedLaporan.description}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleUpdateStatus(selectedLaporan.id, 'approved')}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedLaporan.id, 'rejected')}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                ❌ Reject
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kategori */}
      {showKategoriModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingKategori ? 'Edit Kategori' : 'Tambah Kategori'}
            </h3>
            <form onSubmit={handleSubmitKategori}>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama kategori"
                value={namaKategori}
                onChange={(e) => setNamaKategori(e.target.value)}
                required
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowKategoriModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal User */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingUser ? 'Edit User' : 'Buat User Baru'}
            </h3>
            <form onSubmit={handleSubmitUser}>
              {!editingUser && (
                <>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required={!editingUser}
                  />
                </>
              )}
              <input
                type="text"
                placeholder="Nama Lengkap"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={userForm.nama}
                onChange={(e) => setUserForm({ ...userForm, nama: e.target.value })}
                required
              />
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
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