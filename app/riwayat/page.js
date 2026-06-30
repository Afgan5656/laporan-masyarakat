'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { laporan } from '@/lib/api';

export default function RiwayatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [laporans, setLaporans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== 'user') {
      router.push('/admin/riwayat');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const laporanRes = await laporan.getAll();
      const processedLaporan = (laporanRes.data || []).filter(
        (item) => item.status === 'approved' || item.status === 'rejected'
      );
      setLaporans(processedLaporan);
    } catch (error) {
      console.error('Error fetchData:', error);
      toast.error('Gagal mengambil riwayat laporan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badge = {
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-rose-100 text-rose-800',
    };
    const label = status === 'approved' ? 'Approved' : 'Rejected';
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge[status]}`}>{label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const filteredLaporans = laporans.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'semua' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="text-lg font-semibold text-purple-700">Memuat riwayat laporan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Riwayat Laporan</h1>
              <p className="text-slate-500 mt-2">Laporan Anda yang sudah diproses oleh admin.</p>
            </div>
            <div className="space-x-2">
              <Link href="/dashboard" className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                Kembali ke Dashboard
              </Link>
              <button
                onClick={fetchData}
                className="inline-flex items-center rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700"
              >
                Segarkan
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.5fr_0.8fr] mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  placeholder="Cari laporan..."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 pl-11 text-sm shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
                <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              >
                <option value="semua">Semua status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Total riwayat</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{laporans.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Diterima</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700">{laporans.filter((item) => item.status === 'approved').length}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.12em] text-xs">
              <tr>
                <th className="px-5 py-4">Judul</th>
                <th className="px-5 py-4">Kategori</th>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLaporans.length > 0 ? (
                filteredLaporans.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-slate-500 text-sm truncate max-w-xl">{item.description}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.kategori_nama}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(item.created_at)}</td>
                    <td className="px-5 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/laporan/${item.id}`} className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center text-slate-500">
                    <div className="mx-auto max-w-md">
                      <p className="mb-2 text-lg font-semibold">Belum ada riwayat laporan</p>
                      <p className="text-sm text-slate-400">Laporan yang sudah diproses akan muncul di sini setelah admin merespons.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
