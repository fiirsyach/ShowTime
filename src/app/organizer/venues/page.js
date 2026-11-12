'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaHome, 
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
  FaTicketAlt,
  FaUsers,
  FaGift,
  FaImage,
  FaBuilding,
  FaMapMarkerAlt,
  FaCity
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

export default function OrganizerVenuesPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hall',
    stageType: 'front',
    city: '',
    address: '',
    capacity: '',
    description: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Venue types options
  const venueTypes = [
    { value: 'stadium', label: '🏟️ Stadium', description: 'Melingkar/oval seperti stadion' },
    { value: 'hall', label: '🏛️ Hall', description: 'Teratur menghadap panggung' },
    { value: 'outdoor', label: '🌳 Outdoor', description: 'Lapangan terbuka' },
    { value: 'arena', label: '🏟️ Arena', description: 'Oval dengan tribun mengelilingi' },
  ];

  const stageTypes = [
    { value: 'front', label: 'Front Stage - Panggung di depan' },
    { value: 'center', label: 'Center Stage - Panggung di tengah' },
    { value: 'back', label: 'Back Stage - Panggung di belakang' },
    { value: 'in_the_round', label: 'In The Round - Panggung dikelilingi' }
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'organizer' && user.role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    if (user) {
      fetchVenues();
    }
  }, [user, loading]);

  const fetchVenues = async () => {
    try {
      setLoadingVenues(true);
      const response = await api.get('/venues');
      if (response.data.success) {
        setVenues(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast.error('Gagal memuat venue');
    } finally {
      setLoadingVenues(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity) || 0
      };

      let response;
      if (editingVenue) {
        response = await api.put(`/venues/${editingVenue.id}`, payload);
      } else {
        response = await api.post('/venues', payload);
      }

      if (response.data.success) {
        toast.success(editingVenue ? 'Venue updated!' : 'Venue created!');
        setShowModal(false);
        setEditingVenue(null);
        setFormData({
          name: '',
          type: 'hall',
          stageType: 'front',
          city: '',
          address: '',
          capacity: '',
          description: ''
        });
        fetchVenues();
      }
    } catch (error) {
      console.error('Error saving venue:', error);
      toast.error(error.response?.data?.message || 'Failed to save venue');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;
    try {
      await api.delete(`/venues/${id}`);
      toast.success('Venue deleted!');
      fetchVenues();
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast.error('Failed to delete venue');
    }
  };

  const getVenueTypeLabel = (type) => {
    const found = venueTypes.find(v => v.value === type);
    return found ? found.label : type;
  };

  const getVenueTypeIcon = (type) => {
    switch(type) {
      case 'stadium': return '🏟️';
      case 'hall': return '🏛️';
      case 'outdoor': return '🌳';
      case 'arena': return '🏟️';
      default: return '📍';
    }
  };

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
        <Link href="/organizer/venues" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/20 text-primary">
          <FaBuilding className="w-5 h-5" />
          <span className="text-sm font-medium">Venues</span>
        </Link>
        <Link href="/organizer/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all">
          <FaUser className="w-5 h-5" />
          <span className="text-sm font-medium">Profile</span>
        </Link>
        <div className="pt-4 mt-4 border-t border-white/5">
          <button onClick={() => { logout(); router.push('/login'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full transition-all">
            <FaSignOutAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );

  if (loading || loadingVenues) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-secondary animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'organizer' && user.role !== 'super_admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Manage Venues</h1>
              <p className="text-white/60 mt-1">Create and manage venues for your concerts</p>
            </div>
            <button 
              onClick={() => {
                setEditingVenue(null);
                setFormData({
                  name: '',
                  type: 'hall',
                  stageType: 'front',
                  city: '',
                  address: '',
                  capacity: '',
                  description: ''
                });
                setShowModal(true);
              }}
              className="btn-primary text-sm py-2"
            >
              <FaPlus className="w-4 h-4" />
              Add Venue
            </button>
          </div>

          {/* Venue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div key={venue.id} className="glass rounded-2xl overflow-hidden hover:border-primary/30 transition-all group">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getVenueTypeIcon(venue.type)}</span>
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                          {venue.name}
                        </h3>
                        <p className="text-sm text-white/60">{venue.city}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingVenue(venue);
                          setFormData({
                            name: venue.name,
                            type: venue.type,
                            stageType: venue.stageType || 'front',
                            city: venue.city,
                            address: venue.address,
                            capacity: venue.capacity,
                            description: venue.description || ''
                          });
                          setShowModal(true);
                        }}
                        className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <FaEdit className="w-4 h-4 text-primary" />
                      </button>
                      <button 
                        onClick={() => handleDelete(venue.id)}
                        className="p-2 glass rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <FaTrash className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-white/60">
                      <FaMapMarkerAlt className="w-3 h-3 text-secondary" />
                      <span>{venue.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <FaUsers className="w-3 h-3 text-primary" />
                      <span>Capacity: {venue.capacity.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 glass rounded-full text-xs">
                        {getVenueTypeLabel(venue.type)}
                      </span>
                      <span className="px-2 py-0.5 glass rounded-full text-xs">
                        Stage: {venue.stageType || 'Front'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        venue.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {venue.status}
                      </span>
                    </div>
                  </div>

                  {venue.description && (
                    <p className="text-xs text-white/40 mt-2 line-clamp-2">{venue.description}</p>
                  )}

                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-white/40">
                      🎵 Seat layout: {venue.type === 'stadium' ? 'Melingkar/Stadium' :
                        venue.type === 'hall' ? 'Teratur menghadap panggung' :
                        venue.type === 'outdoor' ? 'Lapangan terbuka' : 'Oval mengelilingi'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {venues.length === 0 && (
            <div className="glass p-12 rounded-2xl text-center">
              <FaBuilding className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Venues Yet</h3>
              <p className="text-white/60">Create your first venue for your concerts.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit Venue */}
      {showModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingVenue ? 'Edit Venue' : 'Add New Venue'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Venue Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="e.g. Jakarta International Stadium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Venue Type <span className="text-red-400">*</span>
                    <span className="text-xs text-white/40 block">(Menentukan bentuk seat map)</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="input-field"
                    required
                  >
                    {venueTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Stage Type
                    <span className="text-xs text-white/40 block">(Posisi panggung)</span>
                  </label>
                  <select
                    value={formData.stageType}
                    onChange={(e) => setFormData({...formData, stageType: e.target.value})}
                    className="input-field"
                  >
                    {stageTypes.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    City <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FaCity className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="input-field pl-12"
                      placeholder="City"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Capacity <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      className="input-field pl-12"
                      placeholder="5000"
                      required
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-4 text-white/40" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="input-field pl-12"
                    rows="2"
                    placeholder="Full address"
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
                  placeholder="Describe your venue..."
                />
              </div>

              {/* Preview Info */}
              <div className="glass p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs text-white/60">
                  💡 <span className="text-primary font-medium">Seat Layout Preview:</span>
                </p>
                <p className="text-sm text-white/80 mt-1">
                  {formData.type === 'stadium' && '🏟️ Stadium layout: Melingkar/oval mengikuti bentuk stadion'}
                  {formData.type === 'hall' && '🏛️ Hall layout: Teratur menghadap panggung'}
                  {formData.type === 'outdoor' && '🌳 Outdoor layout: Lapangan terbuka dengan blok horizontal'}
                  {formData.type === 'arena' && '🏟️ Arena layout: Oval dengan tribun mengelilingi'}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Seat map akan otomatis digenerate berdasarkan tipe venue yang dipilih
                </p>
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
                    editingVenue ? 'Update Venue' : 'Create Venue'
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