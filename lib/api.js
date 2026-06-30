import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const laporan = {
  getAll: () => api.get('/laporan'),
  getById: (id) => api.get(`/laporan/${id}`),
  create: (data) => {
    const formData = new FormData();
    formData.append('title', data.judul);
    formData.append('description', data.deskripsi);
    formData.append('category_id', data.kategori_id);
    // TAMBAHAN: kirim waktu dan lokasi
    if (data.waktu) formData.append('waktu', data.waktu);
    if (data.lokasi) formData.append('lokasi', data.lokasi);
    if (data.gambar) formData.append('image', data.gambar);
    return api.post('/laporan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    // TAMBAHAN: update juga waktu dan lokasi
    return api.put(`/laporan/${id}`, {
      title: data.judul,
      description: data.deskripsi,
      category_id: data.kategori_id,
      waktu: data.waktu || null,
      lokasi: data.lokasi || null,
    });
  },
  delete: (id) => api.delete(`/laporan/${id}`),
  updateStatus: (id, status) => api.patch(`/laporan/${id}/status`, { status }),
};

export const kategori = {
  getAll: () => api.get('/kategori'),
  create: (data) => api.post('/kategori', data),
  update: (id, data) => api.put(`/kategori/${id}`, data),
  delete: (id) => api.delete(`/kategori/${id}`),
};

export const komentar = {
  getByLaporan: (laporanId) => api.get(`/komentar/laporan/${laporanId}`),
  create: (laporanId, comment) => api.post(`/komentar/laporan/${laporanId}`, { comment }),
  delete: (id) => api.delete(`/komentar/${id}`),
};

export const users = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;