'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaSave, 
  FaArrowLeft,
  FaSpinner,
  FaBuilding,
  FaUsers,
  FaTicketAlt,
  FaMapMarkerAlt,
  FaHome,
  FaMusic,
  FaMoneyBillWave,
  FaChartLine,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaGift,
  FaImage
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import SeatMap from '../../../../../components/SeatMap';

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

export default function OrganizerSeatEditorPage() {
  const { id } = useParams();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [concert, setConcert] = useState(null);
  const [venue, setVenue] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    category: 'regular',
    rows: 10,
    seatsPerRow: 10,
    price: 100000
  });
  const [seatFormData, setSeatFormData] = useState({
    sectionId: '',
    row: '',
    number: '',
    category: 'regular',
    price: '',
    isAccessible: false,
    isRestricted: false
  });

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
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const concertRes = await api.get(`/organizer/concerts/${id}`);
      if (concertRes.data.success) {
        setConcert(concertRes.data.data);
        setVenue(concertRes.data.data.venue);
      }

      const seatsRes = await api.get(`/seats/concerts/${id}/seats`);
      if (seatsRes.data.success) {
        setSeats(seatsRes.data.data.seats || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoadingData(false);
    }
  };

  const generateSeats = async () => {
    try {
      const response = await api.post(`/seats/concerts/${id}/generate-seats`, {
        venueId: venue?.id,
        config: venue?.seatConfig
      });
      if (response.data.success) {
        toast.success('Seats generated successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error generating seats:', error);
      toast.error(error.response?.data?.message || 'Gagal generate seats');
    }
  };

  const addSection = async () => {
    try {
      const response = await api.post(`/seats/concerts/${id}/sections`, sectionFormData);
      if (response.data.success) {
        toast.success('Section added successfully!');
        setShowSectionModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error(error.response?.data?.message || 'Gagal menambah section');
    }
  };

  const addSeat = async () => {
    try {
      const response = await api.post(`/seats/concerts/${id}/seats`, {
        ...seatFormData,
        venueId: venue?.id
      });
      if (response.data.success) {
        toast.success('Seat added successfully!');
        setShowSeatModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error adding seat:', error);
      toast.error(error.response?.data?.message || 'Gagal menambah seat');
    }
  };

  const deleteSeat = async (seatId) => {
    if (!confirm('Are you sure you want to delete this seat?')) return;
    try {
      await api.delete(`/seats/concerts/${id}/seats/${seatId}`);
      toast.success('Seat deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting seat:', error);
      toast.error('Gagal menghapus seat');
    }
  };

  const deleteSection = async (sectionId) => {
    if (!confirm('Are you sure you want to delete this section and all its seats?')) return;
    try {
      await api.delete(`/seats/concerts/${id}/sections/${sectionId}`);
      toast.success('Section deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Gagal menghapus section');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading || loadingData) {
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

  // Sidebar
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
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 w-full transition-all">
            <FaSignOutAlt className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
                <FaArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Seat Map Editor</h1>
                <p className="text-white/60">{concert?.name} - {venue?.name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={generateSeats} className="glass px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                <FaPlus className="w-4 h-4" />
                Generate Seats
              </button>
              <button onClick={() => setShowSectionModal(true)} className="glass px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                <FaPlus className="w-4 h-4" />
                Add Section
              </button>
              <button onClick={() => setShowSeatModal(true)} className="btn-primary text-sm py-2">
                <FaPlus className="w-4 h-4" />
                Add Seat
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Venue Info */}
            <div className="lg:col-span-1 glass p-4 rounded-2xl">
              <h3 className="font-bold mb-4">Venue Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <FaBuilding className="w-4 h-4" />
                  <span>{venue?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  <span>{venue?.city}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <FaUsers className="w-4 h-4" />
                  <span>Capacity: {venue?.capacity}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <FaTicketAlt className="w-4 h-4" />
                  <span>Total Seats: {seats.length}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span>Type: {venue?.type}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="font-medium mb-2">Sections</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {venue?.seatConfig?.sections?.map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-2 glass rounded-lg text-sm">
                      <span>{section.name}</span>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${section.category === 'vvip' ? 'yellow' : section.category === 'vip' ? 'purple' : 'blue'}-500/20 text-${section.category === 'vvip' ? 'yellow' : section.category === 'vip' ? 'purple' : 'blue'}-400`}>
                          {section.category}
                        </span>
                        <button onClick={() => deleteSection(section.id)} className="text-red-400 hover:text-red-300 transition-colors">
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Seat Map */}
            <div className="lg:col-span-3">
              <div className="h-[600px]">
                <SeatMap
                  concert={concert}
                  venue={venue}
                  seats={seats}
                  onSeatSelect={() => {}}
                  selectedSeats={[]}
                  readOnly={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add Section */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add Section</h2>
              <button onClick={() => setShowSectionModal(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addSection(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Section Name</label>
                <input
                  type="text"
                  value={sectionFormData.name}
                  onChange={(e) => setSectionFormData({...sectionFormData, name: e.target.value})}
                  className="input-field"
                  placeholder="e.g. Section A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
                <select
                  value={sectionFormData.category}
                  onChange={(e) => setSectionFormData({...sectionFormData, category: e.target.value})}
                  className="input-field"
                >
                  <option value="vvip">VVIP</option>
                  <option value="vip">VIP</option>
                  <option value="regular">Regular</option>
                  <option value="platinum">Platinum</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Rows</label>
                <input
                  type="number"
                  value={sectionFormData.rows}
                  onChange={(e) => setSectionFormData({...sectionFormData, rows: parseInt(e.target.value)})}
                  className="input-field"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Seats Per Row</label>
                <input
                  type="number"
                  value={sectionFormData.seatsPerRow}
                  onChange={(e) => setSectionFormData({...sectionFormData, seatsPerRow: parseInt(e.target.value)})}
                  className="input-field"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Price</label>
                <input
                  type="number"
                  value={sectionFormData.price}
                  onChange={(e) => setSectionFormData({...sectionFormData, price: e.target.value})}
                  className="input-field"
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowSectionModal(false)} className="flex-1 glass py-3 rounded-lg hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary justify-center">
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Seat */}
      {showSeatModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass p-8 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add Seat</h2>
              <button onClick={() => setShowSeatModal(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addSeat(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Section</label>
                <select
                  value={seatFormData.sectionId}
                  onChange={(e) => setSeatFormData({...seatFormData, sectionId: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Section</option>
                  {venue?.seatConfig?.sections?.map((section) => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Row</label>
                <input
                  type="text"
                  value={seatFormData.row}
                  onChange={(e) => setSeatFormData({...seatFormData, row: e.target.value.toUpperCase()})}
                  className="input-field"
                  placeholder="A, B, C, ..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Seat Number</label>
                <input
                  type="number"
                  value={seatFormData.number}
                  onChange={(e) => setSeatFormData({...seatFormData, number: parseInt(e.target.value)})}
                  className="input-field"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
                <select
                  value={seatFormData.category}
                  onChange={(e) => setSeatFormData({...seatFormData, category: e.target.value})}
                  className="input-field"
                >
                  <option value="vvip">VVIP</option>
                  <option value="vip">VIP</option>
                  <option value="regular">Regular</option>
                  <option value="platinum">Platinum</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Price</label>
                <input
                  type="number"
                  value={seatFormData.price}
                  onChange={(e) => setSeatFormData({...seatFormData, price: e.target.value})}
                  className="input-field"
                  min="0"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={seatFormData.isAccessible}
                    onChange={(e) => setSeatFormData({...seatFormData, isAccessible: e.target.checked})}
                  />
                  Accessible
                </label>
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={seatFormData.isRestricted}
                    onChange={(e) => setSeatFormData({...seatFormData, isRestricted: e.target.checked})}
                  />
                  Restricted
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowSeatModal(false)} className="flex-1 glass py-3 rounded-lg hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary justify-center">
                  Add Seat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}