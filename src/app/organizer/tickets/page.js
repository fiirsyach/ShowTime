'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaHome, 
  FaTicketAlt, 
  FaQrcode,
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

export default function TicketManagementPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    price: '',
    quota: '',
    concertId: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user && user.role === 'organizer') {
      fetchTickets();
    }
  }, [user, loading, router]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const [ticketResponse, concertResponse] = await Promise.all([
        api.get('/organizer/tickets'),
        api.get('/organizer/concerts'),
      ]);
      if (ticketResponse.data.success) setTickets(ticketResponse.data.data);
      if (concertResponse.data.success) setConcerts(concertResponse.data.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Gagal memuat data tiket');
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        quota: parseInt(formData.quota)
      };

      let response;
      if (editingTicket) {
        response = await api.put(`/organizer/tickets/${editingTicket.id}`, payload);
      } else {
        response = await api.post('/organizer/tickets', payload);
      }

      if (response.data.success) {
        toast.success(editingTicket ? 'Tiket berhasil diupdate!' : 'Tiket berhasil dibuat!');
        setShowModal(false);
        setEditingTicket(null);
        setFormData({ category: '', price: '', quota: '', concertId: '' });
        fetchTickets();
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan tiket');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tiket ini?')) return;
    try {
      await api.delete(`/organizer/tickets/${id}`);
      toast.success('Tiket berhasil dihapus!');
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Gagal menghapus tiket');
    }
  };

  // Sidebar component
  const Sidebar = () => (
    <div className="fixed left-0 top-0 h-full w-64 glass-dark border-r border-white/5 p-6 z-50 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gradient">ShowTime</h2>
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
        <Link href="/organizer/tickets" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/20 text-secondary">
          <FaTicketAlt className="w-5 h-5" />
          <span className="text-sm font-medium">Ticket Management</span>
        </Link>
        <Link href="/organizer/scanner" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaQrcode className="w-5 h-5" />
          <span className="text-sm font-medium">Scan Tickets</span>
        </Link>
        <Link href="/organizer/seats" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
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

  if (loading || loadingTickets) {
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
              <h1 className="text-3xl font-bold">Ticket Management</h1>
              <p className="text-white/60 mt-1">Kelola kategori, harga, dan kuota tiket</p>
            </div>
            <button 
              onClick={() => {
                setEditingTicket(null);
                setFormData({ category: '', price: '', quota: '', concertId: '' });
                setShowModal(true);
              }}
              className="btn-primary text-sm py-2"
            >
              <FaPlus className="w-4 h-4" />
              Add Ticket Category
            </button>
          </div>

          {/* Ticket Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="glass p-6 rounded-2xl hover:border-secondary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-secondary">{ticket.category}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.sold < ticket.quota ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {ticket.quota > 0 ? Math.round((ticket.sold / ticket.quota) * 100) : 0}% sold
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Price</span>
                    <span className="font-bold text-gradient">Rp {ticket.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Quota</span>
                    <span>{ticket.quota.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Sold</span>
                    <span className="text-green-400">{ticket.sold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Available</span>
                    <span className="text-blue-400">{ticket.available.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Concert</span>
                    <span className="text-white/80">{ticket.concert?.name || '-'}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full mt-4">
                  <div 
                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                    style={{ width: `${ticket.quota > 0 ? (ticket.sold / ticket.quota) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => {
                      setEditingTicket(ticket);
                      setFormData({
                        category: ticket.category,
                        price: ticket.price,
                        quota: ticket.quota,
                        concertId: ticket.concertId
                      });
                      setShowModal(true);
                    }}
                    className="flex-1 glass py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaEdit className="w-4 h-4 text-primary" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(ticket.id)}
                    className="flex-1 glass py-2 rounded-lg text-sm hover:bg-red-500/10 transition-colors text-red-400 flex items-center justify-center gap-2"
                  >
                    <FaTrash className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {tickets.length === 0 && (
            <div className="glass p-12 rounded-2xl text-center">
              <FaTicketAlt className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Belum Ada Kategori Tiket</h3>
              <p className="text-white/60">Tambahkan kategori tiket untuk konser Anda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit Ticket */}
      {showModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingTicket ? 'Edit Ticket Category' : 'Add Ticket Category'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Festival">Festival</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="VVIP">VVIP</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Price (Rp) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="input-field"
                  placeholder="Harga tiket"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Quota *</label>
                <input
                  type="number"
                  value={formData.quota}
                  onChange={(e) => setFormData({...formData, quota: e.target.value})}
                  className="input-field"
                  placeholder="Jumlah tiket"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Concert</label>
                <select
                  value={formData.concertId}
                  onChange={(e) => setFormData({...formData, concertId: e.target.value})}
                  className="input-field"
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
                <button type="submit" disabled={formLoading} className="flex-1 btn-primary justify-center">
                  {formLoading ? (
                    <span className="flex items-center gap-2">
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    editingTicket ? 'Update Ticket' : 'Add Ticket'
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