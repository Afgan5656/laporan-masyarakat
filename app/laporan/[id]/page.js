'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { laporan, komentar } from '@/lib/api';

export default function DetailLaporanPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [laporanData, setLaporanData] = useState(null);
  const [komentars, setKomentars] = useState([]);
  const [komentarBaru, setKomentarBaru] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState({});

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
    setLoading(true);
    try {
      const [laporanRes, komentarRes] = await Promise.all([
        laporan.getById(id),
        komentar.getByLaporan(id),
      ]);
      console.log('Laporan data:', laporanRes.data);
      console.log('Komentar data:', komentarRes.data);
      setLaporanData(laporanRes.data);
      setKomentars(komentarRes.data || []);
    } catch (error) {
      console.error('Error fetch data:', error);
      toast.error('Gagal mengambil data');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await laporan.updateStatus(id, status);
      toast.success(`Status diubah menjadi ${status === 'approved' ? 'Disetujui' : 'Ditolak'}`);
      fetchData();
    } catch (error) {
      toast.error('Gagal mengubah status');
    }
  };

  const handleKomentar = async (e) => {
    e.preventDefault();
    let pesan = komentarBaru.trim();
    
    if (replyTo) {
      pesan = `@${replyTo.user_nama} ${pesan}`;
    }
    
    if (!pesan) {
      toast.error('Komentar tidak boleh kosong');
      return;
    }
    
    setSubmitting(true);
    try {
      await komentar.create(id, pesan);
      toast.success('Komentar berhasil ditambahkan');
      setKomentarBaru('');
      setReplyTo(null);
      fetchData();
    } catch (error) {
      console.error('Error create komentar:', error);
      toast.error('Gagal menambah komentar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKomentar = async (komentarId) => {
    if (confirm('Yakin ingin menghapus komentar ini?')) {
      try {
        await komentar.delete(komentarId);
        toast.success('Komentar dihapus');
        fetchData();
      } catch (error) {
        toast.error('Gagal menghapus');
      }
    }
  };

  const handleLike = (komentarId) => {
    setLikedComments(prev => ({
      ...prev,
      [komentarId]: !prev[komentarId]
    }));
    toast.success('❤️ Menyukai komentar');
  };

  const handleReply = (komentarItem) => {
    setReplyTo({
      id: komentarItem.id,
      user_nama: komentarItem.user_nama
    });
    document.getElementById('komentar-input')?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const now = new Date();
    const komentarDate = new Date(date);
    const diffMs = now - komentarDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return komentarDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const themeColor = isAdmin ? 'blue' : 'purple';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-${themeColor}-50 to-indigo-100`}>
        <div className={`text-xl text-${themeColor}-600`}>Loading...</div>
      </div>
    );
  }

  if (!laporanData) return null;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-${themeColor}-50 via-white to-indigo-50`}>
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link 
            href={isAdmin ? '/admin/dashboard' : '/dashboard'} 
            className={`flex items-center gap-2 text-${themeColor}-600 hover:text-${themeColor}-700 transition`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {isAdmin ? 'Kembali ke Dashboard Admin' : 'Kembali ke Dashboard'}
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Card Detail Laporan */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {laporanData.image && (
            <div className="relative h-64 bg-gray-800">
              <img
                src={`http://localhost:5000${laporanData.image}`}
                alt={laporanData.title}
                className="w-full h-full object-cover"
                onError={(e) => e.target.style.display = 'none'}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                <span className="text-white text-sm">Foto Bukti</span>
              </div>
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{laporanData.title}</h1>
              {getStatusBadge(laporanData.status)}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
              <div className="flex items-center gap-1">
                <svg className={`w-4 h-4 text-${themeColor}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {laporanData.lokasi || 'Lokasi tidak tersedia'}
              </div>
              <div className="flex items-center gap-1">
                <svg className={`w-4 h-4 text-${themeColor}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Dilaporkan oleh: {laporanData.user_nama}
              </div>
              <div className="flex items-center gap-1">
                <svg className={`w-4 h-4 text-${themeColor}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Tanggal: {new Date(laporanData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-1">
                <svg className={`w-4 h-4 text-${themeColor}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
                Kategori: {laporanData.kategori_nama}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Deskripsi Laporan</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{laporanData.description}</p>
            </div>
            
            {/* Tanggapan Petugas / Admin */}
            {komentars.filter(k => k.user_role === 'admin' || k.user_role === 'super_admin' || k.user_nama === 'Admin').length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Tanggapan Petugas</h3>
                {komentars.filter(k => k.user_role === 'admin' || k.user_role === 'super_admin' || k.user_nama === 'Admin').map((k) => (
                  <div key={k.id} className="bg-blue-50 rounded-xl p-4 mb-3 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {k.user_nama?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{k.user_nama}</p>
                        <p className="text-xs text-gray-500">{formatDate(k.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-gray-700">{k.komentar}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Tombol Approve/Reject untuk Admin */}
            {isAdmin && laporanData.status === 'pending' && (
              <div className="mt-6 pt-4 border-t flex gap-3">
                <button onClick={() => handleUpdateStatus('approved')} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">✅ Setujui Laporan</button>
                <button onClick={() => handleUpdateStatus('rejected')} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">❌ Tolak Laporan</button>
              </div>
            )}
          </div>
        </div>

        {/* Komentar Warga Section - TEKS KOMENTAR PASTI MUNCUL */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className={`bg-gradient-to-r from-${themeColor}-600 to-indigo-600 px-6 py-4`}>
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Komentar Warga ({komentars.length})
            </h3>
            <p className={`text-${themeColor}-200 text-sm mt-1`}>Diskusikan laporan ini dengan masyarakat lain</p>
          </div>
          
          {/* Form Komentar */}
          <div className="p-6 border-b bg-gray-50">
            {replyTo && (
              <div className={`mb-3 flex items-center justify-between bg-${themeColor}-50 p-2 rounded-lg`}>
                <span className={`text-sm text-${themeColor}-600`}>
                  Membalas @{replyTo.user_nama}
                </span>
                <button onClick={cancelReply} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-${themeColor}-500 to-indigo-500 flex items-center justify-center text-white font-bold`}>
                  {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  id="komentar-input"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent resize-none`}
                  rows="3"
                  placeholder="Tulis komentar Anda sebagai warga..."
                  value={komentarBaru}
                  onChange={(e) => setKomentarBaru(e.target.value)}
                />
                <div className="flex justify-end mt-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setKomentarBaru('');
                      setReplyTo(null);
                    }}
                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleKomentar}
                    disabled={submitting}
                    className={`bg-gradient-to-r from-${themeColor}-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-${themeColor}-700 hover:to-indigo-700 transition flex items-center gap-2 disabled:opacity-50`}
                  >
                    {submitting ? 'Mengirim...' : 'Kirim Komentar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* List Komentar Warga - TEKS KOMENTAR DENGAN BALON */}
          <div className="divide-y divide-gray-100">
            {komentars.length > 0 ? (
              komentars.map((k) => (
                <div key={k.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${themeColor}-400 to-${themeColor}-600 flex items-center justify-center text-white font-bold`}>
                        {k.user_nama?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-gray-800">{k.user_nama}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{formatDate(k.created_at)}</span>
                      </div>
                      
                      {/* ISI KOMENTAR - PASTI MUNCUL dengan BALON */}
                      <div className="bg-gray-100 rounded-2xl rounded-tl-md p-4 mb-2">
                        <p className="text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
                          {k.comment}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-4 text-sm">
                        <button
                          onClick={() => handleLike(k.id)}
                          className={`flex items-center gap-1 transition ${
                            likedComments[k.id] ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <svg className="w-4 h-4" fill={likedComments[k.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Suka
                        </button>
                        <button
                          onClick={() => handleReply(k)}
                          className={`flex items-center gap-1 text-gray-500 hover:text-${themeColor}-600 transition`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Balas
                        </button>
                        {(isAdmin || k.user_id === user?.id) && (
                          <button
                            onClick={() => handleDeleteKomentar(k.id)}
                            className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 font-medium">Belum ada komentar</p>
                <p className="text-sm text-gray-400 mt-1">Jadilah orang pertama yang memberikan komentar!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}