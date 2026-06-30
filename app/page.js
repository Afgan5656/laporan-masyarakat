'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Cek apakah user sudah login
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role === 'super_admin') {
        router.push('/admin/users');
      } else if (parsedUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">LP</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              LaporPak
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-600 hover:text-purple-600 transition">Beranda</button>
            <button onClick={() => scrollToSection('statistik')} className="text-gray-600 hover:text-purple-600 transition">Statistik</button>
            <button onClick={() => scrollToSection('fitur')} className="text-gray-600 hover:text-purple-600 transition">Fitur</button>
            <button onClick={() => scrollToSection('tentang')} className="text-gray-600 hover:text-purple-600 transition">Tentang</button>
          </div>
          <Link
            href="/login"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-md"
          >
            Masuk
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
              ✨ Sistem Pengaduan Masyarakat
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6">
              Laporkan Masalah
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Kami Tindak Lanjuti</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8">
              Platform pengaduan masyarakat yang cepat, transparan, dan terpercaya. 
              Sampaikan keluhan Anda, kami akan bantu tindak lanjuti.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg flex items-center gap-2"
              >
                Buat Laporan
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button
                onClick={() => scrollToSection('fitur')}
                className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition"
              >
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 text-center text-sm text-gray-400">Buat Laporan Baru</div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="font-semibold text-gray-700">Judul Laporan</div>
                  <div className="text-gray-400 text-sm">Jalan rusak di depan sekolah...</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="font-semibold text-gray-700">Deskripsi</div>
                  <div className="text-gray-400 text-sm">Jalan berlubang membahayakan pengendara...</div>
                </div>
                <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-xl font-semibold">
                  Kirim Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistik Section */}
      <section id="statistik" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Dampak <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">LaporPak</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Ribuan laporan telah kami tindak lanjuti bersama instansi terkait
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">4.276+</div>
              <p className="text-gray-500 mt-2">Laporan Masuk</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">93%</div>
              <p className="text-gray-500 mt-2">Ditindaklanjuti</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">2 Hari</div>
              <p className="text-gray-500 mt-2">Rata-Rata Respons</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">18+</div>
              <p className="text-gray-500 mt-2">Instansi Terhubung</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Unggulan */}
      <section id="fitur" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Fitur <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Unggulan</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Dirancang agar warga bisa melapor dengan mudah dan petugas bisa merespons lebih cepat
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Laporan via chat</h3>
              <p className="text-gray-500">Sampaikan keluhan dengan mudah melalui antarmuka chat yang sederhana</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Lokasi otomatis</h3>
              <p className="text-gray-500">Deteksi lokasi otomatis untuk memudahkan tindak lanjut</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Notifikasi realtime</h3>
              <p className="text-gray-500">Dapatkan update status laporan secara langsung</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Pantau Progres</h3>
              <p className="text-gray-500">Lihat perkembangan laporan Anda secara realtime</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Multi instansi</h3>
              <p className="text-gray-500">Terhubung dengan berbagai instansi terkait</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Lampirkan Foto</h3>
              <p className="text-gray-500">Lampirkan bukti foto untuk memperkuat laporan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Section */}
      <section id="tentang" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Kenapa Pilih <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">LaporPak</span>?
              </h2>
              <p className="text-gray-500 mb-6">
                Dirancang agar warga bisa melapor dengan mudah dan petugas bisa merespons lebih cepat.
                Kami berkomitmen untuk memberikan pelayanan terbaik bagi masyarakat.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Respons Cepat - Rata-Rata 2 Hari Kerja</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Transparan - Status bisa dipantau</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Aman & Terverifikasi - Data pelapor terlindungi</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <p className="text-sm text-gray-500">Layanan</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">Gratis</div>
                  <p className="text-sm text-gray-500">Untuk Masyarakat</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">100%</div>
                  <p className="text-sm text-gray-500">Terverifikasi</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">Aman</div>
                  <p className="text-sm text-gray-500">Data Terjaga</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Melaporkan Masalah?
          </h2>
          <p className="text-purple-200 mb-8">
            Bergabunglah dengan ribuan warga yang sudah menggunakan LaporPak
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Mulai Laporkan Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">LP</span>
                </div>
                <span className="text-white font-semibold">LaporPak</span>
              </div>
              <p className="text-sm">Platform pengaduan masyarakat yang cepat, transparan, dan terpercaya.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Tautan Cepat</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition">Beranda</button></li>
                <li><button onClick={() => scrollToSection('statistik')} className="hover:text-white transition">Statistik</button></li>
                <li><button onClick={() => scrollToSection('fitur')} className="hover:text-white transition">Fitur</button></li>
                <li><button onClick={() => scrollToSection('tentang')} className="hover:text-white transition">Tentang</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: info@laporpak.id</li>
                <li>Telepon: (021) 1234567</li>
                <li>WhatsApp: 0812-3456-7890</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Ikuti Kami</h4>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition text-xl">📘</a>
                <a href="#" className="hover:text-white transition text-xl">📷</a>
                <a href="#" className="hover:text-white transition text-xl">🐦</a>
                <a href="#" className="hover:text-white transition text-xl">💬</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            &copy; 2024 LaporPak. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}