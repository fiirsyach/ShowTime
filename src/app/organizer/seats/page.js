'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaHome, 
  FaTicketAlt, 
  FaPlus, 
  FaEdit, 
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
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
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

export default function SeatLayoutPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [seats, setSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [formData, setFormData] = useState({
    row: '',
    number: '',
    category: 'regular',
    price: '',
    concertId: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user && user.role === 'organizer') {
      fetchSeats();
    }
  }, [user, loading, router]);

  const fetchSeats = async () => {
    try {
      setLoadingSeats(true);
      const response = await api.get('/organizer/seats');
      if (response.data.success) {
        setSeats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Gagal memuat data kursi');
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        number: parseInt(formData.number)
      };

      let response;
      if (editingSeat) {
        response = await api.put(`/organizer/seats/${editingSeat.id}`, payload);
      } else {
        response = await api.post('/organizer/seats', payload);
      }

      if (response.data.success) {
        toast.success(editingSeat ? 'Kursi berhasil diupdate!' : 'Kursi berhasil ditambahkan!');
        setShowModal(false);
        setEditingSeat(null);
        setFormData({ row: '', number: '', category: 'regular', price: '', concertId: '' });
        fetchSeats();
      }
    } catch (error) {
      console.error('Error saving seat:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan kursi');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kursi ini?')) return;
    try {
      await api.delete(`/organizer/seats/${id}`);
      toast.success('Kursi berhasil dihapus!');
      fetchSeats();
    } catch (error) {
      console.error('Error deleting seat:', error);
      toast.error('Gagal menghapus kursi');
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'regular': return 'bg-blue-500/70 hover:bg-blue-400';
      case 'vip': return 'bg-purple-500/70 hover:bg-purple-400';
      case 'vvip': return 'bg-yellow-500/70 hover:bg-yellow-400';
      default: return 'bg-gray-500/50';
    }
  };

  // Sidebar component (sama seperti sebelumnya)
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
        <Link href="/organizer/seats" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/20 text-secondary">
          <FaUsers className="w-5 h-5" />
          <span className="text-sm font-medium">Seat Layout</span>
        </Link>
        <Link href="/organizer/gallery" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
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

  if (loading || loadingSeats) {
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
              <h1 className="text-3xl font-bold">Seat Layout</h1>
              <p className="text-white/60 mt-1">Atur tata letak dan kategori kursi</p>
            </div>
            <button 
              onClick={() => {
                setEditingSeat(null);
                setFormData({ row: '', number: '', category: 'regular', price: '', concertId: '' });
                setShowModal(true);
              }}
              className="btn-primary text-sm py-2"
            >
              <FaPlus className="w-4 h-4" />
              Add Seat
            </button>
          </div>

          {/* Seat Map */}
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Stage Layout</h3>
                <p className="text-sm text-white/60">Tata letak kursi konser</p>
              </div>
            </div>

            {/* Stage */}
            <div className="text-center mb-8">
              <div className="inline-block px-12 py-4 bg-white/5 rounded-xl text-white/60 text-lg">
                🎵 STAGE
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500/70 rounded" />
                <span className="text-white/60">Regular</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500/70 rounded" />
                <span className="text-white/60">VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500/70 rounded" />
                <span className="text-white/60">VVIP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500/70 rounded" />
                <span className="text-white/60">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500/70 rounded" />
                <span className="text-white/60">Available</span>
              </div>
            </div>

            {/* Seats Grid */}
            <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto">
              {seats.map((seat) => (
                <div 
                  key={seat.id}
                  className={`aspect-square rounded-lg transition-all cursor-pointer ${getCategoryColor(seat.category)} ${
                    seat.status === 'booked' ? 'bg-red-500/50 cursor-not-allowed' : ''
                  } flex items-center justify-center text-xs text-white/60 hover:scale-110`}
                >
                  {seat.row}{seat.number}
                </div>
              ))}
            </div>

            {/* Seat Info */}
            <div className="mt-6 p-4 glass rounded-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-white/60">Total Seats</p>
                  <p className="font-bold text-xl">{seats.length}</p>
                </div>
                <div>
                  <p className="text-white/60">Available</p>
                  <p className="font-bold text-xl text-green-400">
                    {seats.filter(s => s.status === 'available').length}
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Booked</p>
                  <p className="font-bold text-xl text-red-400">
                    {seats.filter(s => s.status === 'booked').length}
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Categories</p>
                  <p className="font-bold text-xl text-primary">
                    {new Set(seats.map(s => s.category)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Seat */}
      {showModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingSeat ? 'Edit Seat' : 'Add New Seat'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Row *</label>
                <input
                  type="text"
                  value={formData.row}
                  onChange={(e) => setFormData({...formData, row: e.target.value.toUpperCase()})}
                  className="input-field"
                  placeholder="A, B, C, ..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Seat Number *</label>
                <input
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  className="input-field"
                  placeholder="1, 2, 3, ..."
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="regular">Regular</option>
                  <option value="vip">VIP</option>
                  <option value="vvip">VVIP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Price (Rp)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="input-field"
                  placeholder="Harga kursi"
                  min="0"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 glass py-3 rounded-lg hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 btn-primary justify-center">
                  {formLoading ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    editingSeat ? 'Update Seat' : 'Add Seat'
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