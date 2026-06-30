// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import toast from 'react-hot-toast';
// import { laporan, kategori } from '@/lib/api';

// export default function SuperAdminDashboardPage() {
//   const router = useRouter();
//   const [user, setUser] = useState(null);
//   const [laporans, setLaporans] = useState([]);
//   const [kategoris, setKategoris] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeMenu, setActiveMenu] = useState('laporan');
//   const [selectedLaporan, setSelectedLaporan] = useState(null);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [showKategoriModal, setShowKategoriModal] = useState(false);
//   const [editingKategori, setEditingKategori] = useState(null);
//   const [namaKategori, setNamaKategori] = useState('');

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const userData = localStorage.getItem('user');
//     if (!token) {
//       router.push('/');
//       return;
//     }
//     const parsedUser = JSON.parse(userData);
//     setUser(parsedUser);
//     if (parsedUser.role !== 'super_admin') {
//       toast.error('Akses ditolak');
//       router.push('/dashboard');
//       return;
//     }
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [laporanRes, kategoriRes] = await Promise.all([
//         laporan.getAll(),
//         kategori.getAll(),
//       ]);
//       setLaporans(laporanRes.data || []);
//       setKategoris(kategoriRes.data || []);
//     } catch (error) {
//       console.error('Error fetchData:', error);
//       toast.error('Gagal mengambil data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateStatus = async (id, status) => {
//     try {
//       await laporan.updateStatus(id, status);
//       toast.success(`Status laporan diubah menjadi ${status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}`);
//       fetchData();
//       setShowStatusModal(false);
//       setSelectedLaporan(null);
//     } catch (error) {
//       toast.error('Gagal mengubah status');
//     }
//   };

//   const handleDeleteLaporan = async (id) => {
//     if (confirm('Yakin ingin menghapus laporan ini?')) {
//       try {
//         await laporan.delete(id);
//         toast.success('Laporan dihapus');
//         fetchData();
//       } catch (error) {
//         toast.error('Gagal menghapus');
//       }
//     }
//   };

//   const handleSubmitKategori = async (e) => {
//     e.preventDefault();
//     if (!namaKategori.trim()) {
//       toast.error('Nama kategori tidak boleh kosong');
//       return;
//     }
//     try {
//       if (editingKategori) {
//         await kategori.update(editingKategori.id, { nama: namaKategori });
//         toast.success('Kategori berhasil diupdate');
//       } else {
//         await kategori.create({ nama: namaKategori });
//         toast.success('Kategori berhasil ditambahkan');
//       }
//       setShowKategoriModal(false);
//       setEditingKategori(null);
//       setNamaKategori('');
//       fetchData();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Gagal menyimpan kategori');
//     }
//   };

//   const handleDeleteKategori = async (id) => {
//     if (confirm('Yakin ingin menghapus kategori ini?')) {
//       try {
//         await kategori.delete(id);
//         toast.success('Kategori dihapus');
//         fetchData();
//       } catch (error) {
//         toast.error(error.response?.data?.message || 'Gagal menghapus');
//       }
//     }
//   };

//   const getStatusBadge = (status) => {
//     const colors = {
//       pending: 'bg-yellow-100 text-yellow-800',
//       approved: 'bg-green-100 text-green-800',
//       rejected: 'bg-red-100 text-red-800',
//     };
//     const labels = {
//       pending: 'Pending',
//       approved: 'Approved',
//       rejected: 'Rejected',
//     };
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
//         {labels[status] || status}
//       </span>
//     );
//   };

//   const totalLaporan = laporans.length;
//   const pendingCount = laporans.filter(l => l.status === 'pending').length;
//   const approvedCount = laporans.filter(l => l.status === 'approved').length;
//   const rejectedCount = laporans.filter(l => l.status === 'rejected').length;

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     router.push('/');
//     toast.success('Logout berhasil');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
//         <div className="text-xl text-purple-600">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
//       {/* Sidebar */}
//       <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-purple-800 to-indigo-900 shadow-xl">
//         <div className="p-6">
//           <h1 className="text-2xl font-bold text-white">LaporPak</h1>
//           <p className="text-sm text-purple-300 mt-1">Super Admin Panel</p>
//         </div>
        
//         <nav className="mt-6">
//           <button
//             onClick={() => setActiveMenu('laporan')}
//             className={`w-full flex items-center px-6 py-3 transition ${
//               activeMenu === 'laporan' 
//                 ? 'text-white bg-purple-700 border-r-4 border-purple-300' 
//                 : 'text-purple-100 hover:bg-purple-700'
//             }`}
//           >
//             <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//             </svg>
//             Kelola Laporan
//           </button>

//           <Link
//             href="/admin/riwayat"
//             className="w-full flex items-center px-6 py-3 text-purple-100 hover:bg-purple-700 transition"
//           >
//             <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             Riwayat Laporan
//           </Link>
          
//           <button
//             onClick={() => setActiveMenu('kategori')}
//             className={`w-full flex items-center px-6 py-3 transition ${
//               activeMenu === 'kategori' 
//                 ? 'text-white bg-purple-700 border-r-4 border-purple-300' 
//                 : 'text-purple-100 hover:bg-purple-700'
//             }`}
//           >
//             <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
//             </svg>
//             Kelola Kategori
//           </button>

//           <Link
//             href="/admin/users"
//             className="w-full flex items-center px-6 py-3 text-purple-100 hover:bg-purple-700 transition"
//           >
//             <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//             </svg>
//             Kelola User
//           </Link>
//         </nav>
        
//         <div className="absolute bottom-0 left-0 w-full p-6 border-t border-purple-700">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-semibold text-white">{user?.nama || user?.name}</p>
//               <p className="text-xs text-purple-300">Super Admin</p>
//             </div>
//             <button onClick={handleLogout} className="text-purple-300 hover:text-white">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="ml-64 p-8">
//         <div className="mb-8">
//           <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
//             Welcome, {user?.nama || user?.name}
//           </h2>
//           <p className="text-gray-500 mt-1">Kelola laporan, kategori, dan user masyarakat</p>
//         </div>

//         {/* MENU LAPORAN */}
//         {activeMenu === 'laporan' && (
//           <>
//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//               <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <p className="text-purple-100 text-sm">Total Laporan</p>
//                     <p className="text-3xl font-bold mt-2">{totalLaporan}</p>
//                   </div>
//                   <div className="bg-white/20 rounded-full p-3">
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-6 text-white">
//                 <div>
//                   <p className="text-yellow-100 text-sm">Pending</p>
//                   <p className="text-3xl font-bold mt-2">{pendingCount}</p>
//                   <p className="text-yellow-200 text-xs mt-1">Menunggu review</p>
//                 </div>
//               </div>
              
//               <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-lg p-6 text-white">
//                 <div>
//                   <p className="text-green-100 text-sm">Approved</p>
//                   <p className="text-3xl font-bold mt-2">{approvedCount}</p>
//                   <p className="text-green-200 text-xs mt-1">Laporan disetujui</p>
//                 </div>
//               </div>
              
//               <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl shadow-lg p-6 text-white">
//                 <div>
//                   <p className="text-red-100 text-sm">Rejected</p>
//                   <p className="text-3xl font-bold mt-2">{rejectedCount}</p>
//                   <p className="text-red-200 text-xs mt-1">Laporan ditolak</p>
//                 </div>
//               </div>
//             </div>

//             {/* Laporan Pending */}
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">
//                 Laporan Menunggu Review ({pendingCount})
//               </h3>
              
//               {pendingCount > 0 ? (
//                 <div className="space-y-4">
//                   {laporans.filter(l => l.status === 'pending').map((item) => (
//                     <div key={item.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <h4 className="text-lg font-semibold text-gray-800">{item.title}</h4>
//                           <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
//                             <span>{item.kategori_nama}</span>
//                             <span>•</span>
//                             <span>Oleh: {item.user_nama}</span>
//                             <span>•</span>
//                             <span>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
//                           </div>
//                           <p className="text-gray-600 mt-2">{item.description}</p>
//                           {item.lokasi && (
//                             <p className="text-sm text-gray-500 mt-2">📍 {item.lokasi}</p>
//                           )}
//                         </div>
//                         <div className="flex gap-2 ml-4">
//                           <button
//                             onClick={() => {
//                               setSelectedLaporan(item);
//                               setShowStatusModal(true);
//                             }}
//                             className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
//                           >
//                             Review
//                           </button>
//                           <Link
//                             href={`/laporan/${item.id}`}
//                             className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//                           >
//                             Detail
//                           </Link>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="bg-white rounded-xl shadow-md p-12 text-center">
//                   <p className="text-gray-500">Tidak ada laporan pending</p>
//                 </div>
//               )}
//             </div>

//             {/* Riwayat Laporan */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Laporan</h3>
//               <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                 <table className="w-full">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Laporan</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelapor</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {laporans.filter(l => l.status !== 'pending').map((item) => (
//                       <tr key={item.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4">
//                           <div className="font-medium">{item.title}</div>
//                           <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
//                         </td>
//                         <td className="px-6 py-4 text-sm">{item.kategori_nama}</td>
//                         <td className="px-6 py-4 text-sm">{item.user_nama}</td>
//                         <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
//                         <td className="px-6 py-4">
//                           <Link href={`/laporan/${item.id}`} className="text-purple-600 hover:underline text-sm">
//                             Detail
//                           </Link>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 {laporans.filter(l => l.status !== 'pending').length === 0 && (
//                   <div className="text-center py-8 text-gray-500">Belum ada riwayat laporan</div>
//                 )}
//               </div>
//             </div>
//           </>
//         )}

//         {/* MENU KATEGORI */}
//         {activeMenu === 'kategori' && (
//           <div className="bg-white rounded-xl shadow-md overflow-hidden">
//             <div className="px-6 py-4 border-b flex justify-between items-center">
//               <h3 className="text-lg font-semibold">Daftar Kategori</h3>
//               <button
//                 onClick={() => {
//                   setEditingKategori(null);
//                   setNamaKategori('');
//                   setShowKategoriModal(true);
//                 }}
//                 className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
//               >
//                 + Tambah Kategori
//               </button>
//             </div>
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kategori</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {kategoris.map((kat) => (
//                   <tr key={kat.id}>
//                     <td className="px-6 py-4 text-sm">{kat.id}</td>
//                     <td className="px-6 py-4 font-medium">{kat.nama}</td>
//                     <td className="px-6 py-4 flex gap-2">
//                       <button
//                         onClick={() => {
//                           setEditingKategori(kat);
//                           setNamaKategori(kat.nama);
//                           setShowKategoriModal(true);
//                         }}
//                         className="text-purple-600 hover:underline text-sm"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDeleteKategori(kat.id)}
//                         className="text-red-600 hover:underline text-sm"
//                       >
//                         Hapus
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {kategoris.length === 0 && (
//               <div className="text-center py-8 text-gray-500">Belum ada kategori</div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Modal Review */}
//       {showStatusModal && selectedLaporan && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 w-full max-w-md">
//             <h3 className="text-xl font-bold mb-4">Review Laporan</h3>
//             <p className="font-semibold mb-2">{selectedLaporan.title}</p>
//             <p className="text-gray-600 mb-4">{selectedLaporan.description}</p>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => handleUpdateStatus(selectedLaporan.id, 'approved')}
//                 className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
//               >
//                 ✅ Approve
//               </button>
//               <button
//                 onClick={() => handleUpdateStatus(selectedLaporan.id, 'rejected')}
//                 className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
//               >
//                 ❌ Reject
//               </button>
//               <button
//                 onClick={() => setShowStatusModal(false)}
//                 className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
//               >
//                 Batal
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal Kategori */}
//       {showKategoriModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 w-full max-w-md">
//             <h3 className="text-xl font-bold mb-4">
//               {editingKategori ? 'Edit Kategori' : 'Tambah Kategori'}
//             </h3>
//             <form onSubmit={handleSubmitKategori}>
//               <input
//                 type="text"
//                 className="w-full px-3 py-2 border rounded-lg mb-4"
//                 placeholder="Nama kategori"
//                 value={namaKategori}
//                 onChange={(e) => setNamaKategori(e.target.value)}
//                 required
//               />
//               <div className="flex gap-3">
//                 <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg">
//                   Simpan
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setShowKategoriModal(false)}
//                   className="flex-1 bg-gray-200 py-2 rounded-lg"
//                 >
//                   Batal
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }