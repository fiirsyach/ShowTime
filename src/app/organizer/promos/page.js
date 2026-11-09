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
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
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

export default function PromoPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [promos, setPromos] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'voucher',
    value: '',
    discountType: 'percentage',
    minPurchase: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    maxUses: '',
    perUserLimit: '1'
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user && user.role === 'organizer') {
      fetchPromos();
    }
  }, [user, loading, router]);

  const fetchPromos = async () => {
    try {
      setLoadingPromos(true);
      const response = await api.get('/organizer/promos');
      if (response.data.success) {
        setPromos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching promos:', error);
      toast.error('Gagal memuat promo');
    } finally {
      setLoadingPromos(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        perUserLimit: parseInt(formData.perUserLimit)
      };

      let response;
      if (editingPromo) {
        response = await api.put(`/organizer/promos/${editingPromo.id}`, payload);
      } else {
        response = await api.post('/organizer/promos', payload);
      }

      if (response.data.success) {
        toast.success(editingPromo ? 'Promo updated!' : 'Promo created!');
        setShowModal(false);
        setEditingPromo(null);
        setFormData({ code: '', name: '', description: '', type: 'voucher', value: '', discountType: 'percentage', minPurchase: '', maxDiscount: '', startDate: '', endDate: '', maxUses: '', perUserLimit: '1' });
        fetchPromos();
      }
    } catch (error) {
      console.error('Error saving promo:', error);
      toast.error(error.response?.data?.message || 'Failed to save promo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus promo ini?')) return;
    try {
      await api.delete(`/organizer/promos/${id}`);
      toast.success('Promo deleted!');
      fetchPromos();
    } catch (error) {
      console.error('Error deleting promo:', error);
      toast.error('Failed to delete promo');
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
        <Link href="/organizer/gallery" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaImage className="w-5 h-5" />
          <span className="text-sm font-medium">Gallery</span>
        </Link>
        <Link href="/organizer/promos" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/20 text-secondary">
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

  if (loading || loadingPromos) {
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
              <h1 className="text-3xl font-bold">Promo & Vouchers</h1>
              <p className="text-white/60 mt-1">Buat dan kelola promo konser</p>
            </div>
            <button 
              onClick={() => {
                setEditingPromo(null);
                setFormData({ code: '', name: '', description: '', type: 'voucher', value: '', discountType: 'percentage', minPurchase: '', maxDiscount: '', startDate: '', endDate: '', maxUses: '', perUserLimit: '1' });
                setShowModal(true);
              }}
              className="btn-primary text-sm py-2"
            >
              <FaPlus className="w-4 h-4" />
              Create Promo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promos.map((promo) => (
              <div key={promo.id} className="glass p-6 rounded-2xl hover:border-secondary/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">{promo.code}</h3>
                    <p className="text-sm text-white/60">{promo.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    promo.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {promo.status === 'active' ? (
                      <span className="flex items-center gap-1"><FaCheckCircle className="w-3 h-3" /> Active</span>
                    ) : (
                      <span className="flex items-center gap-1"><FaTimesCircle className="w-3 h-3" /> Inactive</span>
                    )}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Type</span>
                    <span className="capitalize">{promo.type} · {promo.discountType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Value</span>
                    <span className="font-bold text-secondary">
                      {promo.discountType === 'percentage' ? `${promo.value}%` : `Rp ${Number(promo.value).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  {promo.minPurchase && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Min Purchase</span>
                      <span>Rp {promo.minPurchase.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/60">Period</span>
                    <span className="text-xs">{promo.startDate?.split('T')[0]} - {promo.endDate?.split('T')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Usage</span>
                    <span className="text-yellow-400">{promo.usedCount || 0} / {promo.maxUses || '∞'}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-white/10 rounded-full mt-4">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    style={{ width: `${promo.maxUses ? (promo.usedCount / promo.maxUses) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => {
                      setEditingPromo(promo);
                      setFormData({
                        code: promo.code,
                        name: promo.name,
                        description: promo.description || '',
                        type: promo.type || 'voucher',
                        value: promo.value,
                        discountType: promo.discountType || 'percentage',
                        minPurchase: promo.minPurchase || '',
                        maxDiscount: promo.maxDiscount || '',
                        startDate: promo.startDate?.split('T')[0] || '',
                        endDate: promo.endDate?.split('T')[0] || '',
                        maxUses: promo.maxUses || '',
                        perUserLimit: promo.perUserLimit || '1'
                      });
                      setShowModal(true);
                    }}
                    className="flex-1 glass py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaEdit className="w-4 h-4 text-primary" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(promo.id)}
                    className="flex-1 glass py-2 rounded-lg text-sm hover:bg-red-500/10 transition-colors text-red-400 flex items-center justify-center gap-2"
                  >
                    <FaTrash className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {promos.length === 0 && (
            <div className="glass p-12 rounded-2xl text-center">
              <FaGift className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Belum Ada Promo</h3>
              <p className="text-white/60">Buat promo atau voucher untuk menarik lebih banyak pembeli.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit Promo */}
      {showModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingPromo ? 'Edit Promo' : 'Create Promo'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Promo Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="input-field"
                    placeholder="SUMMER20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Promo Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    placeholder="Summer Discount"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field"
                  rows="2"
                  placeholder="Deskripsi promo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="voucher">Voucher</option>
                    <option value="discount">Discount</option>
                    <option value="flash_sale">Flash Sale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Discount calculation *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Value *</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="input-field"
                    placeholder={formData.discountType === 'percentage' ? '20' : '100000'}
                    required
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Min Purchase</label>
                  <input
                    type="number"
                    value={formData.minPurchase || ''}
                    onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                    className="input-field"
                    placeholder="Minimal pembelian"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Max Discount</label>
                  <input
                    type="number"
                    value={formData.maxDiscount || ''}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    className="input-field"
                    placeholder="Maksimal diskon"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Max Uses</label>
                  <input
                    type="number"
                    value={formData.maxUses || ''}
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                    className="input-field"
                    placeholder="Maksimal penggunaan"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Per User Limit</label>
                  <input
                    type="number"
                    value={formData.perUserLimit || 1}
                    onChange={(e) => setFormData({...formData, perUserLimit: e.target.value})}
                    className="input-field"
                    min="1"
                  />
                </div>
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
                    editingPromo ? 'Update Promo' : 'Create Promo'
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