'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { auth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nama: '',
  });

  useEffect(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const res = await auth.login({
          email: formData.email,
          password: formData.password,
        });
        
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        toast.success('Login berhasil!');
        
        if (res.data.user.role === 'super_admin') {
          router.push('/admin/users');
        } else if (res.data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Anda harus login sebagai super admin untuk register');
          setLoading(false);
          return;
        }
        
        await auth.register({
          email: formData.email,
          password: formData.password,
          nama: formData.nama,
          role: 'user',
        });
        
        toast.success('Registrasi berhasil! Silakan login');
        setIsLogin(true);
        setFormData({ email: '', password: '', nama: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (type) => {
    if (type === 'superadmin') {
      setFormData({ ...formData, email: 'superadmin@gmail.com', password: 'super123' });
    } else if (type === 'admin') {
      setFormData({ ...formData, email: 'Afgan@gmail.com', password: 'afgan123' });
    } else if (type === 'user') {
      setFormData({ ...formData, email: 'yanto@gmail.com', password: 'yanto123' });
    }
    toast.success(`Form terisi dengan akun ${type}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">LP</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                LaporPak
              </span>
            </div>
          </Link>
          <p className="text-gray-500 text-sm">Sistem Pengaduan Masyarakat</p>
        </div>
        
        <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
                placeholder="Masukkan nama lengkap"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="contoh: email@gmail.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Masukkan password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isLogin ? 'Masuk' : 'Daftar')}
          </button>
        </form>
        
        <p className="text-center mt-4 text-sm text-gray-600">
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <Link href={isLogin ? "/register" : "/login"} className="text-purple-600 hover:underline font-medium">
  {isLogin ? 'Daftar' : 'Masuk'}
</Link>
        </p>

        {isLogin && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 text-center">Login Cepat dengan Akun Demo:</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => fillDemoAccount('superadmin')} className="text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 text-left">
                🛡️ Super Admin (superadmin@gmail.com)
              </button>
              <button onClick={() => fillDemoAccount('admin')} className="text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 text-left">
                👑 Admin (admin@gmail.com)
              </button>
              <button onClick={() => fillDemoAccount('user')} className="text-sm bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 text-left">
                👤 User (user@gmail.com)
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              * Password semua akun: <span className="font-mono">super123</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}