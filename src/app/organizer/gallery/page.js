'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaHome, 
  FaTicketAlt, 
  FaPlus, 
  FaTrash, 
  FaMusic,
  FaMoneyBillWave,
  FaChartLine,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaSpinner,
  FaUsers,
  FaGift,
  FaImage,
  FaUpload,
  FaEye
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getMediaUrl } from '../../../../lib/media-url';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function GalleryPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    caption: '',
    type: 'photo',
    concertId: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user && user.role === 'organizer') {
      fetchImages();
    }
  }, [user, loading, router]);

  const fetchImages = async () => {
    try {
      setLoadingImages(true);
      const [galleryResponse, concertsResponse] = await Promise.all([
        api.get('/organizer/gallery'),
        api.get('/organizer/concerts')
      ]);
      if (!galleryResponse.data.success || !concertsResponse.data.success) {
        throw new Error('Gagal memuat data galeri');
      }
      setImages(galleryResponse.data.data);
      setConcerts(concertsResponse.data.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Gagal memuat galeri');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.image || !formData.concertId) {
      toast.error('Pilih file gambar dan konser');
      return;
    }

    setUploading(true);
    try {
      const payload = new FormData();
      payload.append('image', formData.image);
      payload.append('caption', formData.caption);
      payload.append('type', formData.type);
      payload.append('concertId', formData.concertId);
      const response = await api.post('/organizer/gallery', payload);
      if (response.data.success) {
        toast.success('Gambar berhasil diupload!');
        setShowModal(false);
        setFormData({ image: null, caption: '', type: 'photo', concertId: '' });
        fetchImages();
      }
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error(error.response?.data?.message || 'Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) return;
    try {
      await api.delete(`/organizer/gallery/${id}`);
      toast.success('Gambar berhasil dihapus!');
      fetchImages();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Gagal menghapus gambar');
    }
  };

  const Sidebar = () => (
    <div className="fixed left-0 top-0 h-full w-64 glass-dark border-r border-white/5 p-6 z-50 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gradient">ConcertHub</h2>
        <p className="text-xs text-white/40 mt-1">Organizer Dashboard</p>
        <p className="text-xs text-secondary mt-1">🏢 {user?.name}</p>
      </div>
      <nav className="space-y-1">
        <Link href="/organizer/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaHome className="w-5 h-5" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        <Link href="/organizer/concerts" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaMusic className="w-5 h-5" />
          <span className="text-sm font-medium">Manage Concerts</span>
        </Link>
        <Link href="/organizer/tickets" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaTicketAlt className="w-5 h-5" />
          <span className="text-sm font-medium">Ticket Management</span>
        </Link>
        <Link href="/organizer/seats" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaUsers className="w-5 h-5" />
          <span className="text-sm font-medium">Seat Layout</span>
        </Link>
        <Link href="/organizer/gallery" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/20 text-secondary">
          <FaImage className="w-5 h-5" />
          <span className="text-sm font-medium">Gallery</span>
        </Link>
        <Link href="/organizer/promos" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaGift className="w-5 h-5" />
          <span className="text-sm font-medium">Promo</span>
        </Link>
        <Link href="/organizer/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaTicketAlt className="w-5 h-5" />
          <span className="text-sm font-medium">Orders</span>
        </Link>
        <Link href="/organizer/revenue" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaMoneyBillWave className="w-5 h-5" />
          <span className="text-sm font-medium">Revenue</span>
        </Link>
        <Link href="/organizer/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaChartLine className="w-5 h-5" />
          <span className="text-sm font-medium">Analytics</span>
        </Link>
        <Link href="/organizer/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaUser className="w-5 h-5" />
          <span className="text-sm font-medium">Profile</span>
        </Link>
        <div className="pt-4 mt-4 border-t border-white/5">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full transition-all">
            <FaSignOutAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );

  if (loading || loadingImages) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-secondary animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Gallery</h1>
              <p className="text-white/60 mt-1">Kelola poster, banner, dan galeri konser</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary text-sm py-2"
            >
              <FaPlus className="w-4 h-4" />
              Upload Image
            </button>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="glass rounded-xl overflow-hidden group">
                <Image
                  src={getMediaUrl(image.image)}
                  alt={image.caption || `${image.type} ${image.concert?.name || 'konser'}`}
                  width={600}
                  height={600}
                  unoptimized
                  className="aspect-square w-full object-cover"
                />
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{image.caption || 'No caption'}</p>
                  <p className="text-xs text-white/40 capitalize">{image.type}</p>
                  <p className="text-xs text-white/40">{image.concert?.name || 'No concert'}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 glass py-1 rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                      <FaEye className="w-3 h-3" />
                      View
                    </button>
                    <button 
                      onClick={() => handleDelete(image.id)}
                      className="flex-1 glass py-1 rounded-lg text-xs hover:bg-red-500/10 transition-colors text-red-400 flex items-center justify-center gap-1"
                    >
                      <FaTrash className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {images.length === 0 && (
            <div className="glass p-12 rounded-2xl text-center">
              <FaImage className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Belum Ada Gambar</h3>
              <p className="text-white/60">Upload poster, banner, atau galeri konser Anda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Upload */}
      {showModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upload Image</h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">File gambar *</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  className="input-field"
                  required
                />
                <p className="mt-1 text-xs text-white/40">Format JPG, PNG, GIF, atau WebP; maksimal 5 MB.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Caption</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({...formData, caption: e.target.value})}
                  className="input-field"
                  placeholder="Deskripsi gambar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="input-field"
                >
                  <option value="photo">Photo</option>
                  <option value="poster">Poster</option>
                  <option value="banner">Banner</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Concert</label>
                <select
                  value={formData.concertId}
                  onChange={(e) => setFormData({...formData, concertId: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Pilih Konser</option>
                  {concerts.map((concert) => (
                    <option key={concert.id} value={concert.id}>{concert.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 glass py-3 rounded-lg hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="flex-1 btn-primary justify-center">
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    'Upload Image'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}